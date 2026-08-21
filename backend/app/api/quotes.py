from fastapi import APIRouter
from pydantic import BaseModel

from ..agent.multi_supplier_orchestrator import (
    MultiSupplierOrchestrator,
)


router = APIRouter(
    prefix="/api/quotes",
    tags=["Quotes"],
)


class QuoteRequest(BaseModel):
    request: str


@router.post("/compare")
def compare_supplier_quotes(
    payload: QuoteRequest,
):
    agent = MultiSupplierOrchestrator()

    try:
        result = agent.run(payload.request)

        return {
            "success": result["success"],
            "message": result["message"],
            "requirements": result["requirements"].model_dump(),
            "quotes": [
                quote.model_dump()
                for quote in result["quotes"]
            ],
            "comparison": result["comparison"],
            "best_quote": (
                result["best_quote"].model_dump()
                if result["best_quote"] is not None
                else None
            ),
        }

    finally:
        agent.close()