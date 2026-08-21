from app.agent.orchestrator import AgentOrchestrator
from app.agent.browser_adapter_impl import BrowserAdapterImpl


def main():

    supplier_id = "supplier-c"

    user_request = (
        "I need 100 Dell laptops delivered to Kolkata "
        "within 7 days with at least 2 years warranty."
    )

    browser = BrowserAdapterImpl()

    try:

        # --------------------------------------------------
        # STEP 1 — Open the REAL supplier website through Webcmd
        # --------------------------------------------------

        print("\n🌐 Opening Supplier...")

        open_result = browser.browser.open_supplier(
            supplier_id
        )

        print("OPEN RESULT:")
        print(open_result)

        if not open_result.get("success"):
            print("❌ Supplier could not be opened.")
            return

        # Get the human-readable supplier name
        # returned from supplier.json.
        supplier_name = open_result.get("supplier")

        if not supplier_name:
            print("❌ Supplier name was not returned.")
            return

        print(
            f"✅ Supplier opened: {supplier_name}"
        )

        # --------------------------------------------------
        # STEP 2 — Create the REAL intelligence orchestrator
        # --------------------------------------------------

        agent = AgentOrchestrator(
            browser=browser,
            supplier_name=supplier_name,
        )

        # --------------------------------------------------
        # STEP 3 — Run the complete procurement workflow
        # --------------------------------------------------

        result = agent.run(
            user_request=user_request,
            supplier_id=supplier_id,
        )

        # --------------------------------------------------
        # STEP 4 — Display final result
        # --------------------------------------------------

        print("\n" + "=" * 70)
        print("FINAL REAL-BROWSER AGENT RESULT")
        print("=" * 70)

        print(
            result.model_dump_json(
                indent=2
            )
        )

    finally:

        # Always close the browser bridge.
        browser.close()


if __name__ == "__main__":
    main()