import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime
from app.config import settings
from app.models.schemas import OptimizationResponse

class Base(DeclarativeBase):
    pass

class OptimizationRecord(Base):
    __tablename__ = "optimizations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    raw_prompt: Mapped[str] = mapped_column(Text)
    target_model: Mapped[str] = mapped_column(String(64))
    mode: Mapped[str] = mapped_column(String(32))
    raw_tokens: Mapped[int] = mapped_column(Integer)
    optimized_tokens: Mapped[int] = mapped_column(Integer)
    compact_tokens: Mapped[int] = mapped_column(Integer)
    detailed_tokens: Mapped[int] = mapped_column(Integer)
    savings_percent: Mapped[float] = mapped_column(Float)
    quality_score: Mapped[float] = mapped_column(Float)
    optimized_text: Mapped[str] = mapped_column(Text)
    compact_text: Mapped[str] = mapped_column(Text)
    detailed_text: Mapped[str] = mapped_column(Text)
    full_response_json: Mapped[str] = mapped_column(Text)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class TemplateRecord(Base):
    __tablename__ = "templates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(128))
    category: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(Text)
    template: Mapped[str] = mapped_column(Text)
    target_model: Mapped[str] = mapped_column(String(64), default="gpt-4o")
    tags: Mapped[str] = mapped_column(String(256), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_default_templates()

async def seed_default_templates():
    from sqlalchemy import select
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(TemplateRecord).limit(1))
        if result.scalar_one_or_none() is None:
            defaults = [
                TemplateRecord(
                    id="tpl-clean-code",
                    title="Production-Grade Code Architect",
                    category="Coding and software engineering",
                    description="Generates strict, idiomatic, fully-typed code with error handling and zero filler.",
                    template="Write a production-grade implementation in {language} for {feature}. Include comprehensive type annotations, boundary check validation, and clear docstrings. No conversational filler.",
                    target_model="gpt-4o",
                    tags="coding,architecture,types"
                ),
                TemplateRecord(
                    id="tpl-math-step",
                    title="Deterministic Mathematical Reasoner",
                    category="Mathematical reasoning",
                    description="Step-by-step rigorous derivation with final boxed answer verification.",
                    template="Solve the following mathematical formulation: {problem}. Deconstruct the problem into explicit state verification steps, state assumptions, and provide the final result clearly boxed.",
                    target_model="o1",
                    tags="math,reasoning,proof"
                ),
                TemplateRecord(
                    id="tpl-json-schema",
                    title="Strict Schema Data Extractor",
                    category="Data analysis",
                    description="Extracts entity and metric payloads into strict RFC-compliant JSON.",
                    template="Extract all key entities, metrics, and relationships from the following text into valid RFC-8259 JSON matching schema {schema}. Output raw JSON only with no markdown wrapping.",
                    target_model="gpt-4o-mini",
                    tags="json,schema,extraction"
                ),
                TemplateRecord(
                    id="tpl-executive-summary",
                    title="Executive Strategic Synthesis",
                    category="Business and strategy",
                    description="Condensed executive briefing with ROI, risks, and strategic next steps.",
                    template="Synthesize the strategic initiative for {topic}. Provide a high-level briefing with 3 core strategic pillars, quantitative ROI projections, top 2 risks, and immediate 30-day next steps.",
                    target_model="claude-3-5-sonnet",
                    tags="business,executive,strategy"
                ),
                TemplateRecord(
                    id="tpl-research-synthesis",
                    title="State-of-the-Art Research Survey",
                    category="Research and analysis",
                    description="Deep multi-perspective comparative review of literature and technological trade-offs.",
                    template="Conduct a state-of-the-art comparative analysis between {technology_a} and {technology_b}. Evaluate computational complexity, scaling characteristics, operational overhead, and trade-offs in tabular format.",
                    target_model="gemini-2.0-flash",
                    tags="research,comparison,deep-dive"
                )
            ]
            session.add_all(defaults)
            await session.commit()
