from app.agent.browser_adapter_impl import BrowserAdapterImpl
from app.agent.orchestrator import AgentOrchestrator


def main():

    user_request = (
        "I need 100 laptops delivered to Kolkata "
        "within 7 days with at least 2 years warranty."
    )

    supplier_ids = [
        "supplier-a",
        "supplier-b",
        "supplier-c",
    ]

    browser = BrowserAdapterImpl()

    try:

        for supplier_id in supplier_ids:

            print()
            print("=" * 60)
            print(f"Running supplier: {supplier_id}")
            print("=" * 60)

            browser.browser.open_supplier(
                supplier_id
            )

            orchestrator = AgentOrchestrator(
                browser=browser
            )

            result = orchestrator.run(
                user_request=user_request,
                supplier_id=supplier_id,
            )

            print()
            print("RESULT:")
            print(result.model_dump_json(indent=2))

    finally:

        browser.close()


if __name__ == "__main__":
    main()