import subprocess
import yt_dlp
from faster_whisper import WhisperModel
import os

url = "https://www.youtube.com/watch?v=3-UoYRNWXug"
audio_file = "audio.m4a"

# ---------- STEP 1: Download Best Audio ----------
subprocess.run([
    "yt-dlp",
    "-f", "bestaudio[ext=m4a]/bestaudio",
    "-o", audio_file,
    "--quiet",
    "--extractor-args", "youtube:player_client=default",
    url
])

# ---------- STEP 2: Load Fast CPU Model ----------
model = WhisperModel(
    "tiny.en",     # fastest English model
    device="cpu",
    compute_type="int8"
)

# ---------- STEP 3: Transcribe ----------
segments, info = model.transcribe(
    audio_file,
    beam_size=1
)

print("\nTranscript:\n")

for segment in segments:
    print(segment.text.strip())

# ---------- STEP 4: Cleanup ----------
os.remove(audio_file)