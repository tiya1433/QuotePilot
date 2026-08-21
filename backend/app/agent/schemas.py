from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ProcurementRequirements(BaseModel):
    product: str = Field(
        description="The product or item the user wants to procure."
    )

    quantity: int = Field(
        description="Number of units required."
    )

    delivery_location: str | None = Field(
        default=None,
        description="Location where the products should be delivered."
    )

    max_delivery_days: int | None = Field(
        default=None,
        description="Maximum acceptable delivery time in days."
    )

    min_warranty_years: float | None = Field(
        default=None,
        description="Minimum required warranty period in years."
    )

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("Quantity must be greater than 0.")
        return value

    @field_validator("max_delivery_days")
    @classmethod
    def validate_delivery_days(
        cls,
        value: int | None,
    ) -> int | None:
        if value is not None and value <= 0:
            raise ValueError(
                "Delivery days must be greater than 0."
            )
        return value

    @field_validator("min_warranty_years")
    @classmethod
    def validate_warranty(
        cls,
        value: float | None,
    ) -> float | None:
        if value is not None and value < 0:
            raise ValueError(
                "Warranty cannot be negative."
            )
        return value


class FieldMappingResult(BaseModel):
    field_name: str

    concept: Literal[
        "product",
        "quantity",
        "delivery_location",
        "delivery",
        "warranty",
    ] | None

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Confidence that the field maps "
            "to the selected concept."
        ),
    )

    reasoning: str

    @field_validator("reasoning")
    @classmethod
    def validate_reasoning(cls, value: str) -> str:
        return value.strip()


class QuoteResult(BaseModel):
    supplier: str | None = None
    product: str | None = None
    quantity: int = 0
    price: float = 0
    delivery_days: int = 0
    warranty_years: float = 0
    quote_id: str | None = None


class AgentResult(BaseModel):
    success: bool
    state: str
    supplier_id: str
    message: str

    requirements: ProcurementRequirements | None = None

    mappings: dict[str, str] | None = None

    quote: QuoteResult | None = None