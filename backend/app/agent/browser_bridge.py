import json
import os
import subprocess
from pathlib import Path


class BrowserBridge:

    def __init__(self):
        self.root = Path(__file__).resolve().parents[3]

        self.node_command = [
            "node",
            str(
                self.root
                / "browser-agent"
                / "src"
                / "bridge_runner.js"
            ),
        ]

        env = os.environ.copy()

        if not env.get("WEBCMD_SESSION"):
            raise RuntimeError(
                "WEBCMD_SESSION environment variable is not set."
            )

        self.process = subprocess.Popen(
            self.node_command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            env=env,
        )

    def _request(self, payload: dict) -> dict:

        if self.process.stdin is None:
            raise RuntimeError("Browser bridge stdin unavailable.")

        if self.process.stdout is None:
            raise RuntimeError("Browser bridge stdout unavailable.")

        self.process.stdin.write(
            json.dumps(payload) + "\n"
        )

        self.process.stdin.flush()

        while True:
            line = self.process.stdout.readline()

            if not line:
                raise RuntimeError(
                    "Browser bridge stopped unexpectedly."
                )

            line = line.strip()

            if not line:
                continue

            try:
                response = json.loads(line)

                if isinstance(response, dict):
                    return response

            except json.JSONDecodeError:
                # Ignore non-JSON Node/Webcmd logging.
                continue

    def open_supplier(self, supplier_id: str) -> dict:
        return self._request(
            {
                "action": "open",
                "supplier_id": supplier_id,
            }
        )

    def inspect(self) -> dict:
        result = self._request(
            {
                "action": "inspect",
            }
        )

        # The bridge can return nested JSON as a string.
        if isinstance(result, dict):

            data = result.get("result")

            if isinstance(data, str):
                try:
                    decoded = json.loads(data)

                    if isinstance(decoded, dict):
                        result["result"] = decoded

                except json.JSONDecodeError:
                    pass

        return result

    def fill(self, selector: str, value: str) -> bool:
        result = self._request(
            {
                "action": "fill",
                "selector": selector,
                "value": value,
            }
        )

        return bool(result.get("success"))

    def click(self, selector: str) -> bool:
        result = self._request(
            {
                "action": "click",
                "selector": selector,
            }
        )

        return bool(result.get("success"))

    def page_info(self) -> dict:
        return self._request(
            {
                "action": "page_info",
            }
        )

    def close(self):
        if self.process.poll() is None:
            self.process.terminate()

            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()

