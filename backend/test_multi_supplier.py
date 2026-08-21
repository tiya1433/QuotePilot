from app.agent.multi_supplier_orchestrator import (
    MultiSupplierOrchestrator,
)


def main():

    user_request = (
        "I need 100 Dell laptops delivered to Kolkata "
        "within 7 days with at least 2 years warranty."
    )

    agent = MultiSupplierOrchestrator()

    try:

        result = agent.run(
            user_request=user_request
        )

        print("\n" + "=" * 70)
        print("FINAL MULTI-SUPPLIER RESULT")
        print("=" * 70)

        print(
            "\nSuccess:",
            result["success"]
        )

        print(
            "\nMessage:",
            result["message"]
        )

        print("\n" + "-" * 70)
        print("ALL QUOTES")
        print("-" * 70)

        for quote in result["quotes"]:

            print(
                f"\n🏢 {quote.supplier}"
            )

            print(
                f"   Product: {quote.product}"
            )

            print(
                f"   Quantity: {quote.quantity}"
            )

            print(
                f"   Price: ₹{quote.price:,.0f}"
            )

            print(
                f"   Delivery: "
                f"{quote.delivery_days} days"
            )

            print(
                f"   Warranty: "
                f"{quote.warranty_years} years"
            )

            print(
                f"   Quote ID: "
                f"{quote.quote_id}"
            )

        print("\n" + "-" * 70)
        print("COMPARISON")
        print("-" * 70)

        for item in result["comparison"]:

            status = (
                "✅ QUALIFIED"
                if item["meets_requirements"]
                else "❌ DISQUALIFIED"
            )

            print(
                f"\n{item['supplier']}"
            )

            print(
                f"   Price: "
                f"₹{item['price']:,.0f}"
            )

            print(
                f"   Delivery: "
                f"{item['delivery_days']} days"
            )

            print(
                f"   Warranty: "
                f"{item['warranty_years']} years"
            )

            print(
                f"   Status: {status}"
            )

            if item["reasons"]:

                for reason in item["reasons"]:

                    print(
                        f"   Reason: {reason}"
                    )

        print("\n" + "=" * 70)
        print("🏆 FINAL RECOMMENDATION")
        print("=" * 70)

        best_quote = result["best_quote"]

        if best_quote is None:

            print(
                "\n❌ No supplier satisfies "
                "all requirements."
            )

        else:

            print(
                f"\n🏆 Supplier: "
                f"{best_quote.supplier}"
            )

            print(
                f"💰 Price: "
                f"₹{best_quote.price:,.0f}"
            )

            print(
                f"🚚 Delivery: "
                f"{best_quote.delivery_days} days"
            )

            print(
                f"🛡️ Warranty: "
                f"{best_quote.warranty_years} years"
            )

            print(
                f"🧾 Quote ID: "
                f"{best_quote.quote_id}"
            )

        print("\n" + "=" * 70)

    finally:

        agent.close()


if __name__ == "__main__":
    main()