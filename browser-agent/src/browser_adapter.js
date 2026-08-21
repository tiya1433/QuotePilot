import { runWebcmd } from "./webcmd_runner.js";

function extractDomain(url) {
  try {
    const withoutProtocol = String(url).replace(
      /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//,
      ""
    );

    return withoutProtocol.split("/")[0].split(":")[0];
  } catch {
    return "";
  }
}

function parseWebcmdResult(result) {
  if (!result || typeof result.stdout !== "string") {
    return result;
  }

  const lines = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Webcmd may print logging before the JSON response.
  // Use the last valid JSON object printed by the script.
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(lines[i]);
    } catch {
      // Ignore non-JSON logging.
    }
  }

  return result;
}

export class BrowserAdapter {
  constructor(sessionId) {
    this.sessionId = sessionId;

    if (!this.sessionId) {
      throw new Error(
        "WEBCMD_SESSION is required for BrowserAdapter"
      );
    }
  }

  async run(script) {
    const result = await runWebcmd(
      [
        "--session",
        this.sessionId,
        "browser",
        "run",
        "--stdin",
        "--timeout",
        "30"
      ],
      script
    );

    return parseWebcmdResult(result);
  }

  async goto(url) {
    const script = `
await page.goto(${JSON.stringify(url)});

const currentUrl = page.url();

console.log(JSON.stringify({
  success: true,
  action: "goto",
  url: currentUrl
}));
`;

    return this.run(script);
  }

  async inspect() {
    const script = `
const currentUrl = page.url();

const domain = String(currentUrl)
  .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\\/\\//, "")
  .split("/")[0]
  .split(":")[0];

const fields = await page.locator(
  "input, textarea, select"
).evaluateAll(
  elements =>
    elements.map((element) => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || "",
      name: element.getAttribute("name") || "",
      type: element.getAttribute("type") || "",
      placeholder:
        element.getAttribute("placeholder") || "",
      ariaLabel:
        element.getAttribute("aria-label") || ""
    }))
);

const buttons = await page.locator("button").evaluateAll(
  elements =>
    elements.map((element) => ({
      text: (element.innerText || "").trim(),
      id: element.id || "",
      name: element.getAttribute("name") || "",
      type: element.getAttribute("type") || ""
    }))
);

const bodyText = await page.locator("body").innerText();

console.log(JSON.stringify({
  success: true,
  action: "inspect",
  url: currentUrl,
  domain,
  fields,
  buttons,
  text: bodyText
}));
`;

    return this.run(script);
  }

  async fill(selector, value) {
    const script = `
try {
  await page.locator(
    ${JSON.stringify(selector)}
  ).fill(
    ${JSON.stringify(String(value))}
  );

  console.log(JSON.stringify({
    success: true,
    action: "fill",
    selector: ${JSON.stringify(selector)},
    value: ${JSON.stringify(String(value))},
    url: page.url()
  }));
} catch (error) {
  console.log(JSON.stringify({
    success: false,
    action: "fill",
    selector: ${JSON.stringify(selector)},
    error: error.message,
    url: page.url()
  }));

  process.exitCode = 1;
}
`;

    return this.run(script);
  }

  async click(selector) {
    const script = `
try {
  await page.locator(
    ${JSON.stringify(selector)}
  ).click();

  console.log(JSON.stringify({
    success: true,
    action: "click",
    selector: ${JSON.stringify(selector)},
    url: page.url()
  }));
} catch (error) {
  console.log(JSON.stringify({
    success: false,
    action: "click",
    selector: ${JSON.stringify(selector)},
    error: error.message,
    url: page.url()
  }));

  process.exitCode = 1;
}
`;

    return this.run(script);
  }

  async getPageInfo() {
    const script = `
const currentUrl = page.url();

const domain = String(currentUrl)
  .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\\/\\//, "")
  .split("/")[0]
  .split(":")[0];

console.log(JSON.stringify({
  success: true,
  action: "page_info",
  url: currentUrl,
  domain,
  title: await page.title()
}));
`;

    return this.run(script);
  }
}