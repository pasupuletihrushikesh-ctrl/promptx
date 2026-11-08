from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.db import init_db
from app.api.optimize import router as optimize_router
from app.api.history import router as history_router
from app.api.templates import router as templates_router
from app.api.ab_testing import router as ab_test_router
from app.api.models_api import router as models_router
from app.api.benchmark_api import router as benchmark_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed default templates
    await init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Autonomous AI Prompt Optimization Engine with 7-Stage Multi-Agent Architecture.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(optimize_router, prefix=settings.API_PREFIX)
app.include_router(history_router, prefix=settings.API_PREFIX)
app.include_router(templates_router, prefix=settings.API_PREFIX)
app.include_router(ab_test_router, prefix=settings.API_PREFIX)
app.include_router(models_router, prefix=settings.API_PREFIX)
app.include_router(benchmark_router, prefix=settings.API_PREFIX)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.VERSION
    }

@app.get("/")
async def root():
    return {
        "message": "PROMPTX Engine Online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
