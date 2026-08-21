from typing import Protocol


class BrowserAdapter(Protocol):

    def inspect_fields(self) -> list[str]:
        ...

    def fill_field(
        self,
        field_name: str,
        value: str,
    ) -> bool:
        ...

    def submit_quote_request(self) -> bool:
        ...