import os
from pydantic import BaseModel
from typing import Dict, Any, List

class Settings(BaseModel):
    APP_NAME: str = "PROMPTX — Autonomous AI Prompt Optimization Engine"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./promptx.db")
    
    # Provider API keys (optional; engine will use intelligent local heuristics if not provided)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    DEFAULT_MODEL: str = "gpt-4o"
    DEFAULT_MODE: str = "BALANCED"

settings = Settings()
