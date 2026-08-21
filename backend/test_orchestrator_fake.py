from app.agent.orchestrator import AgentOrchestrator


class FakeBrowser:

    def __init__(self):

        self.fields = [
            "Product Description",
            "How many pieces are required?",
            "Destination",
            "Expected Arrival",
            "Coverage Duration",
        ]

        self.values = {}

    def inspect_fields(self):

        print("\n🌐 Browser: Inspecting fields...")

        return self.fields

    def fill_field(self, field_name, value):

        print(
            f"🌐 Browser: Filling '{field_name}' "
            f"with '{value}'"
        )

        if field_name not in self.fields:

            print(
                f"❌ Browser: Field '{field_name}' not found."
            )

            return False

        self.values[field_name] = value

        print("✓ Browser: Field filled.")

        return True

    def submit_quote_request(self):

        print("\n🌐 Browser: Quote request submitted.")

        return True


def main():

    browser = FakeBrowser()

    agent = AgentOrchestrator(browser)

    result = agent.run(
        user_request=(
            "I need 100 Dell laptops delivered to Kolkata "
            "within 7 days with at least 2 years warranty."
        ),
        supplier_id="supplier_orchestrator_demo",
    )

    print("\n" + "=" * 70)
    print("FINAL AGENT RESULT")
    print("=" * 70)

    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()