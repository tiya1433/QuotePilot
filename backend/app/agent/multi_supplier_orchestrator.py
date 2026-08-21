from .orchestrator import AgentOrchestrator
from .browser_adapter_impl import BrowserAdapterImpl
from .quote_comparator import compare_quotes
from .requirement_parser import parse_requirement
from .schemas import QuoteResult


SUPPLIERS = [
    "supplier-a",
    "supplier-b",
    "supplier-c",
]


class MultiSupplierOrchestrator:

    def __init__(self):
        self.browser = BrowserAdapterImpl()

    def run(self, user_request: str):

        # --------------------------------------------------
        # STEP 1 — Parse the user's requirements
        # --------------------------------------------------

        print("\n" + "=" * 70)
        print("🤖 QUOTE PILOT — MULTI-SUPPLIER AGENT")
        print("=" * 70)

        print("\n🧠 Understanding user request...")

        requirements = parse_requirement(
            user_request
        )

        print("\n📋 REQUIREMENTS:")
        print(
            f"Product: {requirements.product}"
        )
        print(
            f"Quantity: {requirements.quantity}"
        )
        print(
            f"Location: {requirements.delivery_location}"
        )
        print(
            f"Max delivery: "
            f"{requirements.max_delivery_days} days"
        )
        print(
            f"Min warranty: "
            f"{requirements.min_warranty_years} years"
        )

        quotes: list[QuoteResult] = []

        # --------------------------------------------------
        # STEP 2 — Query every supplier
        # --------------------------------------------------

        for supplier_id in SUPPLIERS:

            print("\n" + "-" * 70)
            print(
                f"🌐 Querying supplier: {supplier_id}"
            )
            print("-" * 70)

            try:

                # Open supplier website
                open_result = (
                    self.browser.browser.open_supplier(
                        supplier_id
                    )
                )

                if not open_result.get("success"):

                    print(
                        f"❌ Could not open {supplier_id}"
                    )

                    continue

                supplier_name = (
                    open_result.get("supplier")
                )

                print(
                    f"✅ Connected to "
                    f"{supplier_name}"
                )

                # Create agent for this supplier
                agent = AgentOrchestrator(
                    browser=self.browser,
                    supplier_name=supplier_name,
                )

                # Run complete supplier workflow
                result = agent.run(
                    user_request=user_request,
                    supplier_id=supplier_id,
                )

                if not result.success:

                    print(
                        f"❌ Quote failed for "
                        f"{supplier_name}"
                    )

                    print(
                        result.message
                    )

                    continue

                if result.quote is None:

                    print(
                        f"❌ No quote returned by "
                        f"{supplier_name}"
                    )

                    continue

                quotes.append(
                    result.quote
                )

                print(
                    f"✅ Quote received from "
                    f"{supplier_name}"
                )

                print(
                    f"   Price: ₹"
                    f"{result.quote.price:,.0f}"
                )

                print(
                    f"   Delivery: "
                    f"{result.quote.delivery_days} days"
                )

                print(
                    f"   Warranty: "
                    f"{result.quote.warranty_years} years"
                )

            except Exception as error:

                print(
                    f"❌ Error processing "
                    f"{supplier_id}: {error}"
                )

        # --------------------------------------------------
        # STEP 3 — Check whether we received quotes
        # --------------------------------------------------

        if not quotes:

            print("\n❌ No supplier quotes received.")

            return {
                "success": False,
                "message": (
                    "No supplier quotes were "
                    "successfully retrieved."
                ),
                "requirements": requirements,
                "quotes": [],
                "comparison": [],
                "best_quote": None,
            }

        # --------------------------------------------------
        # STEP 4 — Compare quotes
        # --------------------------------------------------

        print("\n" + "=" * 70)
        print("📊 COMPARING SUPPLIER QUOTES")
        print("=" * 70)

        best_quote, comparison = compare_quotes(
            quotes=quotes,
            requirements=requirements,
        )

        # --------------------------------------------------
        # STEP 5 — Display comparison
        # --------------------------------------------------

        for item in comparison:

            print("\nSupplier:")
            print(
                f"  {item['supplier']}"
            )

            print(
                f"Price: ₹"
                f"{item['price']:,.0f}"
            )

            print(
                f"Delivery: "
                f"{item['delivery_days']} days"
            )

            print(
                f"Warranty: "
                f"{item['warranty_years']} years"
            )

            if item["meets_requirements"]:

                print(
                    "Status: ✅ Meets requirements"
                )

            else:

                print(
                    "Status: ❌ Does not meet requirements"
                )

                for reason in item["reasons"]:

                    print(
                        f"  - {reason}"
                    )

        # --------------------------------------------------
        # STEP 6 — Display recommendation
        # --------------------------------------------------

        print("\n" + "=" * 70)
        print("🏆 RECOMMENDATION")
        print("=" * 70)

        if best_quote is None:

            print(
                "❌ No supplier satisfies "
                "all requirements."
            )

        else:

            print(
                f"\n🏆 {best_quote.supplier}"
            )

            print(
                f"Price: ₹"
                f"{best_quote.price:,.0f}"
            )

            print(
                f"Delivery: "
                f"{best_quote.delivery_days} days"
            )

            print(
                f"Warranty: "
                f"{best_quote.warranty_years} years"
            )

            print(
                f"Quote ID: "
                f"{best_quote.quote_id}"
            )

        # --------------------------------------------------
        # STEP 7 — Return structured result
        # --------------------------------------------------

        return {
            "success": True,
            "message": (
                "Supplier quotes collected "
                "and compared successfully."
            ),
            "requirements": requirements,
            "quotes": quotes,
            "comparison": comparison,
            "best_quote": best_quote,
        }

    def close(self):
        self.browser.close()