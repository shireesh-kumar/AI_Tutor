"""
Vercel entry point for FastAPI application.
This file is required for Vercel to recognize and deploy the FastAPI app.
"""
from app.main import app

# Vercel expects the app instance to be available
__all__ = ["app"]

