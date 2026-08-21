
import readline from "node:readline";
import { BrowserAdapter } from "./browser_adapter.js";
import { loadSupplier } from "./supplier_runner.js";

const sessionId = process.env.WEBCMD_SESSION;

if (!sessionId) {
  console.error("WEBCMD_SESSION is not set");
  process.exit(1);
}

const browser = new BrowserAdapter(sessionId);

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

function send(data) {
  process.stdout.write(JSON.stringify(data) + "\n");
}

async function handle(command) {
  try {
    switch (command.action) {
      case "open": {
        const supplier = await loadSupplier(command.supplier_id);

        const result = await browser.goto(supplier.url);

        send({
          success: true,
          action: "open",
          supplier_id: supplier.id,
          supplier: supplier.name,
          url: supplier.url,
          result,
        });

        break;
      }

      case "inspect": {
        const result = await browser.inspect();

        send({
          success: true,
          action: "inspect",
          result,
        });

        break;
      }

      case "fill": {
        const result = await browser.fill(
          command.selector,
          command.value
        );

        send({
          success: true,
          action: "fill",
          selector: command.selector,
          result,
        });

        break;
      }

      case "click": {
        const result = await browser.click(
          command.selector
        );

        send({
          success: true,
          action: "click",
          selector: command.selector,
          result,
        });

        break;
      }

      case "page_info": {
        const result = await browser.getPageInfo();

        send({
          success: true,
          action: "page_info",
          result,
        });

        break;
      }

      default:
        send({
          success: false,
          action: command.action,
          error: `Unknown action: ${command.action}`,
        });
    }
  } catch (error) {
    send({
      success: false,
      action: command.action,
      error: error.message,
    });
  }
}

rl.on("line", async (line) => {
  if (!line.trim()) {
    return;
  }

  try {
    const command = JSON.parse(line);
    await handle(command);
  } catch (error) {
    send({
      success: false,
      error: error.message,
    });
  }
});