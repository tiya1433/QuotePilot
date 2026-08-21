import fs from "node:fs/promises";
import path from "node:path";
import { BrowserAdapter } from "./browser_adapter.js";
import { fileURLToPath } from "node:url";

export async function loadSupplier(supplierId) {
  const filePath = fileURLToPath(
    new URL(
      `../suppliers/${supplierId}/supplier.json`,
      import.meta.url
    )
  );

  const data = await fs.readFile(filePath, "utf8");

  return JSON.parse(data);
}

export async function runSupplier(
  supplierId,
  requirements,
  browser = null
) {
  const supplier = await loadSupplier(supplierId);

  console.log("\n================================");
  console.log(`Supplier: ${supplier.name}`);
  console.log(`URL: ${supplier.url}`);
  console.log("================================");

  const adapter =
    browser ||
    new BrowserAdapter(process.env.WEBCMD_SESSION);

  await adapter.goto(supplier.url);

  await adapter.fill(
    "#product",
    requirements.product
  );

  await adapter.fill(
    "#quantity",
    requirements.quantity
  );

  await adapter.fill(
    "#delivery_location",
    requirements.delivery_location
  );

  await adapter.fill(
    "#delivery_days",
    requirements.max_delivery_days
  );

  await adapter.fill(
    "#warranty",
    requirements.min_warranty_years * 12
  );

  const clickResult = await adapter.click(
    'button:has-text("Get Quote")'
  );

  const pageInfo = await adapter.getPageInfo();

  const inspected = await adapter.inspect();

  return {
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    status: "completed",

    result: {
      click: clickResult,
      page: pageInfo,
      inspection: inspected
    }
  };
}
