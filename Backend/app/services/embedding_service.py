import os
import re
from google import genai
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv
from app.utils.logger import get_logger
import time

load_dotenv()

logger = get_logger(__name__)

# Qdrant configuration
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
QDRANT_URL = os.getenv('QDRANT_URL')

# Gemini configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Initialize clients
# The new SDK automatically handles the API key if provided in the constructor
client = genai.Client(api_key=GEMINI_API_KEY)
qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

EMBEDDING_MODEL = "gemini-embedding-001"
SEGMENTS_PER_EMBEDDING = 5  # Combine 5 transcript segments per embedding


def get_embedding_with_retry(texts: list):
    """Get embeddings with automatic retry on rate limit errors."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=texts
            )
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                # Extract retry delay from error message
                delay_match = re.search(r'retry in ([\d.]+)s', error_str, re.IGNORECASE)
                if delay_match:
                    delay = float(delay_match.group(1)) + 2  # Add 2s buffer
                else:
                    delay = 35  # Default 35 seconds
                
                if attempt < max_retries - 1:
                    logger.warning(f"Rate limit hit. Waiting {delay:.1f}s before retry (attempt {attempt + 1}/{max_retries})...")
                    time.sleep(delay)
                else:
                    logger.error(f"Rate limit exceeded after {max_retries} attempts")
                    raise
            else:
                raise


def embed_and_store_transcript(video_id: str, transcript_data: list[dict]) -> bool:
    """
    Embed transcript segments with timestamps and store in Qdrant.
    Combines 5 segments per embedding to reduce API calls.
    """
    try:
        collection_name = video_id
        
        # Check if collection already exists
        try:
            collections = qdrant_client.get_collections().collections
            if any(col.name == collection_name for col in collections):
                logger.info(f"Collection already exists for video: {video_id}")
                return True
        except Exception as e:
            logger.warning(f"Error checking collection: {str(e)}")
        
        # Create collection (gemini-embedding-001 uses 3072 dimensions)
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=3072,
                distance=Distance.COSINE
            )
        )
        logger.info(f"Created collection: {collection_name}")
        
        # Fast processing: filter and format valid items using list comprehension
        def format_timestamp(ts):
            if isinstance(ts, (int, float)):
                return f"{int(ts // 60):02d}:{int(ts % 60):02d}"
            return str(ts) if ts else "00:00"
        
        processed_items = [
            {
                'text': item.get('text', '') or item.get('content', ''),
                'timestamp': item.get('timestamp') or item.get('start') or item.get('start_time') or item.get('time') or 0,
                'original': item
            }
            for item in transcript_data
            if (item.get('text', '') or item.get('content', '')).strip()
        ]
        
        if not processed_items:
            logger.warning("No valid text found in transcript data.")
            return False
        
        # Combine segments: group every 5 segments
        combined_segments = []
        for i in range(0, len(processed_items), SEGMENTS_PER_EMBEDDING):
            chunk = processed_items[i:i + SEGMENTS_PER_EMBEDDING]
            combined_text = " ".join([
                f"[{format_timestamp(item['timestamp'])}] {item['text']}"
                for item in chunk
            ])
            combined_segments.append({
                'text': combined_text,
                'segments': chunk
            })
        
        logger.info(f"Combined {len(processed_items)} segments into {len(combined_segments)} embeddings")
        
        # Process in batches of 99
        points = []
        batch_size = 99
        
        for i in range(0, len(combined_segments), batch_size):
            batch_segments = combined_segments[i:i + batch_size]
            batch_texts = [seg['text'] for seg in batch_segments]
            
            # Generate embeddings with retry logic
            response = get_embedding_with_retry(batch_texts)
            
            # Create points for each embedding (1 point per combined text)
            batch_points = []
            for idx, embedding_obj in enumerate(response.embeddings):
                segment_data = batch_segments[idx]
                point_id = i + idx
                batch_points.append(PointStruct(
                    id=point_id,
                    vector=embedding_obj.values,
                    payload={
                        "text": segment_data['text'],  # Combined text with all timestamps
                        "video_id": video_id
                    }
                ))
            
            points.extend(batch_points)
            
            # Upsert to Qdrant
            qdrant_client.upsert(
                collection_name=collection_name,
                points=batch_points
            )
            logger.info(f"Uploaded batch {i//batch_size + 1} ({len(batch_segments)} embeddings)")
            
            # Rate limiting: sleep before next batch (except last batch)
            if i + batch_size < len(combined_segments):
                time.sleep(0.7)  # ~85 requests/min (safe margin)
        
        logger.info(f"Successfully stored {len(points)} embeddings for video: {video_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error embedding and storing transcript for video {video_id}: {str(e)}", exc_info=True)
        return False