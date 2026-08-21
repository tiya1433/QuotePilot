import re

from .schemas import ProcurementRequirements


def _extract_quantity(text: str):
    match = re.search(
        r"\b(\d+)\s+(?:units?|pieces?|items?|products?|laptops?|"
        r"chairs?|monitors?|printers?)\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return int(match.group(1))

    # Fallback: find a number near common quantity wording.
    match = re.search(
        r"\b(?:need|needs|looking for|require|required)\s+(\d+)\b",
        text,
        re.IGNORECASE,
    )

    return int(match.group(1)) if match else None


def _extract_product(text: str):
    # Common procurement phrasing:
    # "100 Dell laptops"
    # "50 office chairs"
    # "200 monitors"
    # "75 HP laptops"
    patterns = [
        r"\b\d+\s+(.+?)(?=\s+(?:delivered|delivery|within|with|for|as soon|$))",
        r"\b\d+\s+(.+)$",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if not match:
            continue

        product = match.group(1).strip(" .,")
        product = re.sub(
            r"\s+(?:with|having|and having)\s+.*$",
            "",
            product,
            flags=re.IGNORECASE,
        )

        if product:
            return product

    return None


def _extract_location(text: str):
    patterns = [
        r"\bdelivered\s+to\s+([A-Za-z][A-Za-z\s-]*?)(?=\s+within|\s+with|\s+and|[.,]|$)",
        r"\bdelivery\s+in\s+([A-Za-z][A-Za-z\s-]*?)(?=\s+within|\s+with|\s+and|[.,]|$)",
        r"\bdelivery\s+location\s+(?:is\s+)?([A-Za-z][A-Za-z\s-]*?)(?=\s+within|\s+with|\s+and|[.,]|$)",
        r"\bfor\s+([A-Za-z][A-Za-z\s-]*?)(?=\s+delivery|\s+within|\s+and|[.,]|$)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            location = match.group(1).strip()

            # Avoid accidentally treating procurement words as locations.
            if location.lower() not in {
                "delivery",
                "a",
                "an",
                "the",
            }:
                return location

    return None


def _extract_delivery_days(text: str):
    # "within 7 days"
    match = re.search(
        r"\bwithin\s+(\d+)\s+days?\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return int(match.group(1))

    # "maximum delivery time 10 days"
    match = re.search(
        r"\b(?:maximum|max|not exceed|up to)\s+"
        r"(?:delivery\s+time\s+)?(\d+)\s+days?\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return int(match.group(1))

    # "within one week" / "one week"
    if re.search(
        r"\b(?:within\s+)?one\s+week\b",
        text,
        re.IGNORECASE,
    ):
        return 7

    # "as soon as possible" intentionally means no explicit maximum.
    return None


def _extract_warranty_years(text: str):
    # Years: "2 year warranty", "at least 3 years warranty"
    match = re.search(
        r"\b(?:at\s+least|minimum|min\.?|of\s+at\s+least)?\s*"
        r"(\d+(?:\.\d+)?)\s*years?\s*(?:warranty|guarantee)\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return float(match.group(1))

    # Months: "24 month warranty", "minimum warranty 36 months"
    match = re.search(
        r"\b(?:at\s+least|minimum|min\.?|of\s+at\s+least)?\s*"
        r"(\d+(?:\.\d+)?)\s*months?\s*(?:warranty|guarantee)\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return float(match.group(1)) / 12

    # Alternate wording:
    # "warranty of 2 years"
    match = re.search(
        r"\b(?:warranty|guarantee)\s+(?:of\s+)?"
        r"(\d+(?:\.\d+)?)\s*years?\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return float(match.group(1))

    # Alternate wording:
    # "warranty of 24 months"
    match = re.search(
        r"\b(?:warranty|guarantee)\s+(?:of\s+)?"
        r"(\d+(?:\.\d+)?)\s*months?\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return float(match.group(1)) / 12

    return None


def parse_requirement(user_request: str) -> ProcurementRequirements:
    """
    Parse a procurement request locally without requiring
    a Gemini API call.

    Missing information remains None rather than being invented.
    """

    if not user_request or not user_request.strip():
        raise ValueError("User request cannot be empty.")

    text = " ".join(user_request.strip().split())

    return ProcurementRequirements(
        product=_extract_product(text),
        quantity=_extract_quantity(text),
        delivery_location=_extract_location(text),
        max_delivery_days=_extract_delivery_days(text),
        min_warranty_years=_extract_warranty_years(text),
    )
