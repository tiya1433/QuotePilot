from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.quotes import router as quotes_router


app = FastAPI(
    title="QuotePilot API",
    description="AI-powered multi-supplier procurement agent",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(quotes_router)


@app.get("/")
def root():
    return {
        "message": "QuotePilot API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }