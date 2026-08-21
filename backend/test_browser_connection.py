from app.agent.browser_bridge import BrowserBridge


def main():
    browser = BrowserBridge()

    try:
        print("\n" + "=" * 60)
        print("QUOTE PILOT — WEBCMD CONNECTION TEST")
        print("=" * 60)

        print("\n1. Opening Supplier A...")

        result = browser.open_supplier("supplier-a")

        print("\nOPEN RESULT:")
        print(result)

        if not result.get("success"):
            print("\n❌ OPEN FAILED")
            return

        print("\n✅ Supplier opened successfully.")

        print("\n2. Getting page information...")

        page_info = browser.page_info()

        print("\nPAGE INFO:")
        print(page_info)

        if not page_info.get("success"):
            print("\n❌ PAGE INFO FAILED")
            return

        print("\n✅ Browser connection is working.")

        print("\n3. Inspecting page...")

        inspection = browser.inspect()

        print("\nINSPECT RESULT:")
        print(inspection)

        if not inspection.get("success"):
            print("\n❌ INSPECTION FAILED")
            return

        print("\n✅ Webcmd inspection is working.")

        print("\n" + "=" * 60)
        print("🎉 PYTHON → NODE → WEBCMD → BROWSER WORKS")
        print("=" * 60)

    finally:
        browser.close()


if __name__ == "__main__":
    main()