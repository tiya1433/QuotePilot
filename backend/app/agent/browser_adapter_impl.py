from dataclasses import fields
import json
from unittest import result

from .browser_bridge import BrowserBridge


class BrowserAdapterImpl:

    def __init__(self):
        self.browser = BrowserBridge()

    def inspect_fields(self) -> list[dict]:
        result = self.browser.inspect()

        if not result.get("success"):
            raise RuntimeError(
                result.get(
                "error",
                "Could not inspect supplier page.",
            )
        )

        data = result.get("result", {})

        # BrowserBridge may return nested JSON.
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                raise RuntimeError(
                "Invalid inspection response from browser."
            )

        fields = data.get("fields", [])

        return [
        {
            "label": field.get("label", ""),
            "selector": field.get("selector", ""),
            "type": field.get("type", ""),
        }
        for field in fields
        ]

    def fill_field(
        self,
        field_name: str,
        value: str,
    ) -> bool:

        print(
            f"\n🌐 Browser: Filling '{field_name}' "
            f"with '{value}'"
        )

        success = self.browser.fill(
            field_name,
            value,
        )

        if success:
            print("✓ Browser: Field filled.")
        else:
            print(
                f"❌ Browser: Field '{field_name}' "
                "could not be filled."
            )

        return success

    def submit_quote_request(self) -> bool:

        print("\n🌐 Browser: Submitting quote request...")

        success = self.browser.click(
        'button:has-text("Get Quote")'
    )

        if success:
            print("✓ Quote request submitted.")
        else:
            print("❌ Quote request submission failed.")

        return success


    def get_quote(
        self,
        supplier_name: str | None = None,
    ) -> dict:

        result = self.browser.get_quote(
            supplier_name
        )

        if not result.get("success"):
            raise RuntimeError(
                result.get(
                    "error",
                    "Could not retrieve supplier quote.",
                )
            )

        data = result.get("result", {})

        if not isinstance(data, dict):
            raise RuntimeError(
                "Invalid quote response received."
            )

        return data



    def close(self):
        self.browser.close()
