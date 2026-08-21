from .browser_bridge import BrowserBridge


class BrowserAdapterImpl:

    def __init__(self):
        self.browser = BrowserBridge()

    def inspect_fields(self) -> list[str]:
        result = self.browser.inspect()

        if not result.get("success"):
            raise RuntimeError(
                result.get(
                    "error",
                    "Could not inspect supplier page.",
                )
            )

        data = result.get("result", {})
        fields = data.get("fields", [])

        selectors = []

        for field in fields:
            field_id = field.get("id")
            field_name = field.get("name")

            if field_id:
                selectors.append(f"#{field_id}")

            elif field_name:
                selectors.append(
                    f'[name="{field_name}"]'
                )

        return selectors

    def fill_field(
        self,
        field_name: str,
        value: str,
    ) -> bool:
        return self.browser.fill(
            field_name,
            value,
        )

    def submit_quote_request(self) -> bool:
        return self.browser.click(
            'button:has-text("Get Quote")'
        )

    def close(self):
        self.browser.close()
