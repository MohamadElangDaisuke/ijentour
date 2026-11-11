import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\Ryzen\\.gemini\\antigravity\\brain\\f5ca176d-bb13-45bb-87f2-14d097aa39bd\\screenshots\\responsive";
const TEMP_PROFILE = path.join(process.env.TEMP || "C:\\Temp", "chrome_responsive_profile_" + Date.now());

interface CaptureTarget {
  name: string;
  url: string;
  width: number;
  height: number;
  mobile: boolean;
  scrollToSelector?: string;
  waitExtraMs?: number;
}

const TARGETS: CaptureTarget[] = [
  // 1. Ultra-small Mobile Homepage (320px)
  {
    name: "homepage-mobile-320",
    url: "http://localhost:3000/",
    width: 320,
    height: 640,
    mobile: true,
  },
  // 2. Mobile Homepage (375px)
  {
    name: "homepage-mobile-375",
    url: "http://localhost:3000/",
    width: 375,
    height: 812,
    mobile: true,
  },
  // 3. Tablet Homepage (768px)
  {
    name: "homepage-tablet-768",
    url: "http://localhost:3000/",
    width: 768,
    height: 1024,
    mobile: false,
  },
  // 4. Desktop Homepage (1440px)
  {
    name: "homepage-desktop-1440",
    url: "http://localhost:3000/",
    width: 1440,
    height: 900,
    mobile: false,
  },
  // 5. Mobile Travel Planning Resources (375px)
  {
    name: "travel-resources-mobile-375",
    url: "http://localhost:3000/",
    width: 375,
    height: 812,
    mobile: true,
    scrollToSelector: "#travel-resources",
    waitExtraMs: 2000,
  },
  // 6. Desktop Travel Planning Resources (1440px)
  {
    name: "travel-resources-desktop-1440",
    url: "http://localhost:3000/",
    width: 1440,
    height: 900,
    mobile: false,
    scrollToSelector: "#travel-resources",
    waitExtraMs: 2000,
  },
  // 7. Mobile Tour Packages (375px)
  {
    name: "packages-mobile-375",
    url: "http://localhost:3000/packages",
    width: 375,
    height: 812,
    mobile: true,
  },
  // 8. Desktop Tour Packages (1440px)
  {
    name: "packages-desktop-1440",
    url: "http://localhost:3000/packages",
    width: 1440,
    height: 900,
    mobile: false,
  },
  // 9. Mobile Package Detail (375px)
  {
    name: "package-detail-mobile-375",
    url: "http://localhost:3000/packages/pkg-5",
    width: 375,
    height: 812,
    mobile: true,
  },
  // 10. Desktop Package Detail (1440px)
  {
    name: "package-detail-desktop-1440",
    url: "http://localhost:3000/packages/pkg-5",
    width: 1440,
    height: 900,
    mobile: false,
  },
  // 11. Mobile Custom Tour Wizard (375px)
  {
    name: "custom-tour-mobile-375",
    url: "http://localhost:3000/custom-package",
    width: 375,
    height: 812,
    mobile: true,
  },
  // 12. Desktop Custom Tour Wizard (1440px)
  {
    name: "custom-tour-desktop-1440",
    url: "http://localhost:3000/custom-package",
    width: 1440,
    height: 900,
    mobile: false,
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CdpClient {
  private ws: WebSocket;
  private id = 0;
  private pending = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

  constructor(url: string) {
    this.ws = new WebSocket(url);
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data.toString());
          if (data.id && this.pending.has(data.id)) {
            const { resolve, reject } = this.pending.get(data.id)!;
            this.pending.delete(data.id);
            if (data.error) {
              reject(new Error(data.error.message || JSON.stringify(data.error)));
            } else {
              resolve(data.result);
            }
          }
        } catch (err) {
          console.error("CDP parse error:", err);
        }
      };
    });
  }

  send(method: string, params: any = {}): Promise<any> {
    const reqId = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(reqId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function getDebuggerUrl(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const res = await fetch("http://127.0.0.1:9222/json");
      if (res.ok) {
        const pages = await res.json();
        const page = pages.find((p: any) => p.type === "page");
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {
      // Chrome starting up
    }
    await sleep(500);
  }
  throw new Error("Unable to connect to Chrome remote debugging port.");
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🚀 Launching headless Chrome with remote debugging on port 9222...");
  const chromeProc: ChildProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      `--user-data-dir=${TEMP_PROFILE}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getDebuggerUrl();
    console.log(`Connected to Chrome CDP WebSocket: ${wsUrl}`);
    const client = new CdpClient(wsUrl);
    await client.init();

    await client.send("Page.enable");
    await client.send("Network.enable");
    await client.send("DOM.enable");

    // Warmup navigation to ensure Next.js dev server has compiled the page
    console.log("Warming up Next.js dev server...");
    await client.send("Page.navigate", { url: "http://localhost:3000/" });
    await sleep(3500);

    for (const target of TARGETS) {
      console.log(`\n📸 Capturing ${target.name} (${target.width}x${target.height}, mobile: ${target.mobile})...`);

      // Set device viewport & scale factor
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: target.width,
        height: target.height,
        deviceScaleFactor: 2,
        mobile: target.mobile,
      });

      if (target.mobile) {
        await client.send("Emulation.setTouchEmulationEnabled", { enabled: true });
      } else {
        await client.send("Emulation.setTouchEmulationEnabled", { enabled: false });
      }

      // Navigate
      await client.send("Page.navigate", { url: target.url });
      await sleep(2500); // Wait for network & React hydration

      // Scroll to selector if specified
      if (target.scrollToSelector) {
        await client.send("Runtime.evaluate", {
          expression: `
            const el = document.querySelector('${target.scrollToSelector}');
            if (el) {
              el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
          `,
        });
        await sleep(target.waitExtraMs || 1000);
      }

      // Capture screenshot
      const result = await client.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });

      const buffer = Buffer.from(result.data, "base64");
      const outPath = path.join(OUTPUT_DIR, `${target.name}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(` Saved ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }

    client.close();
    console.log("\n All screenshots captured successfully!");
  } finally {
    try {
      chromeProc.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});

