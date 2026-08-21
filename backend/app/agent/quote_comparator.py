from .schemas import ProcurementRequirements, QuoteResult


def compare_quotes(
    quotes: list[QuoteResult],
    requirements: ProcurementRequirements,
) -> tuple[QuoteResult | None, list[dict]]:
    """
    Compare supplier quotes against the user's requirements.

    Suppliers that fail the delivery or warranty requirements
    are marked as disqualified.

    Among valid suppliers, the lowest-price supplier is selected.
    """

    comparison = []

    valid_quotes = []

    for quote in quotes:

        reasons = []
        meets_requirements = True

        # Check delivery requirement
        if (
            requirements.max_delivery_days is not None
            and quote.delivery_days
            > requirements.max_delivery_days
        ):
            meets_requirements = False
            reasons.append(
                f"Delivery exceeds required "
                f"{requirements.max_delivery_days} days."
            )

        # Check warranty requirement
        if (
            requirements.min_warranty_years is not None
            and quote.warranty_years
            < requirements.min_warranty_years
        ):
            meets_requirements = False
            reasons.append(
                f"Warranty is below required "
                f"{requirements.min_warranty_years} years."
            )

        if meets_requirements:
            valid_quotes.append(quote)

        comparison.append(
            {
                "supplier": quote.supplier,
                "price": quote.price,
                "delivery_days": quote.delivery_days,
                "warranty_years": quote.warranty_years,
                "quote_id": quote.quote_id,
                "meets_requirements": meets_requirements,
                "reasons": reasons,
            }
        )

    # No supplier satisfies the requirements.
    if not valid_quotes:
        return None, comparison

    # Lowest total price among valid suppliers.
    best_quote = min(
        valid_quotes,
        key=lambda quote: quote.price,
    )

    # Add ranking information.
    ranked_quotes = sorted(
        valid_quotes,
        key=lambda quote: quote.price,
    )

    for index, quote in enumerate(
        ranked_quotes,
        start=1,
    ):

        for item in comparison:

            if item["quote_id"] == quote.quote_id:
                item["rank"] = index
                break

    return best_quote, comparison