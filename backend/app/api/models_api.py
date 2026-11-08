from fastapi import APIRouter
from typing import List
from app.models.schemas import ModelInfo
from app.models.registry import list_supported_models

router = APIRouter(prefix="/models", tags=["Models Registry"])

@router.get("", response_model=List[ModelInfo])
async def get_models():
    return list_supported_models()
