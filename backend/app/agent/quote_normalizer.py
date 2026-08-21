import re

from .schemas import QuoteResult


def normalize_quote(
    quote_data: dict,
) -> QuoteResult:

    if not quote_data:
        raise ValueError(
            "No quote data received."
        )

    response = quote_data.get("response")

    if not isinstance(response, str):
        raise ValueError(
            "Quote response missing."
        )

    product_match = re.search(
        r"Product:\s*(.+)",
        response,
        re.IGNORECASE,
    )

    quantity_match = re.search(
        r"Quantity:\s*([\d,]+)",
        response,
        re.IGNORECASE,
    )

    price_match = re.search(
        r"Total Price:\s*[^0-9]*([\d,]+)",
        response,
        re.IGNORECASE,
    )

    delivery_match = re.search(
        r"Delivery:\s*(\d+)\s*days?",
        response,
        re.IGNORECASE,
    )

    warranty_match = re.search(
        r"Warranty:\s*(\d+(?:\.\d+)?)\s*years?",
        response,
        re.IGNORECASE,
    )

    quote_id_match = re.search(
        r"Quote ID:\s*([A-Za-z0-9-]+)",
        response,
        re.IGNORECASE,
    )

    if not product_match:
        raise ValueError(
            "Could not parse product from quote."
        )

    if not quantity_match:
        raise ValueError(
            "Could not parse quantity from quote."
        )

    if not price_match:
        raise ValueError(
            "Could not parse price from quote."
        )

    if not delivery_match:
        raise ValueError(
            "Could not parse delivery time from quote."
        )

    if not warranty_match:
        raise ValueError(
            "Could not parse warranty from quote."
        )

    if not quote_id_match:
        raise ValueError(
            "Could not parse quote ID."
        )

    return QuoteResult(
        supplier=quote_data.get("supplier"),
        product=product_match.group(1).strip(),
        quantity=int(
            quantity_match.group(1).replace(",", "")
        ),
        price=float(
            price_match.group(1).replace(",", "")
        ),
        delivery_days=int(
            delivery_match.group(1)
        ),
        warranty_years=float(
            warranty_match.group(1)
        ),
        quote_id=quote_id_match.group(1),
    )