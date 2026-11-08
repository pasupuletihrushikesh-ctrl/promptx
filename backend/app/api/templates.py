import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from app.models.schemas import PromptTemplate
from app.database.db import AsyncSessionLocal, TemplateRecord

router = APIRouter(prefix="/templates", tags=["Templates"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("", response_model=List[PromptTemplate])
async def list_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TemplateRecord))
    records = result.scalars().all()
    return [
        PromptTemplate(
            id=r.id,
            title=r.title,
            category=r.category,
            description=r.description,
            template=r.template,
            target_model=r.target_model,
            tags=[t.strip() for t in r.tags.split(",") if t.strip()]
        )
        for r in records
    ]

@router.post("", response_model=PromptTemplate)
async def create_template(tpl: PromptTemplate, db: AsyncSession = Depends(get_db)):
    record_id = tpl.id or f"tpl-{uuid.uuid4().hex[:8]}"
    record = TemplateRecord(
        id=record_id,
        title=tpl.title,
        category=tpl.category,
        description=tpl.description,
        template=tpl.template,
        target_model=tpl.target_model,
        tags=",".join(tpl.tags)
    )
    db.add(record)
    await db.commit()
    tpl.id = record_id
    return tpl

@router.delete("/{tpl_id}")
async def delete_template(tpl_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(TemplateRecord).filter(TemplateRecord.id == tpl_id))
    await db.commit()
    return {"status": "deleted", "id": tpl_id}
