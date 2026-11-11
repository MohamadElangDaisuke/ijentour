import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR =
  "C:\\Users\\Ryzen\\.gemini\\antigravity\\brain\\f5ca176d-bb13-45bb-87f2-14d097aa39bd\\screenshots\\responsive\\travel-resources-fixed";
const TEMP_PROFILE = path.join(
  process.env.TEMP || "C:\\Temp",
  "chrome_tr_test_" + Date.now()
);

interface ViewportTest {
  width: number;
  height: number;
  mobile: boolean;
  name: string;
}

const VIEWPORTS: ViewportTest[] = [
  { width: 320, height: 800, mobile: true, name: "tr-mobile-320" },
  { width: 360, height: 800, mobile: true, name: "tr-mobile-360" },
  { width: 375, height: 812, mobile: true, name: "tr-mobile-375" },
  { width: 390, height: 844, mobile: true, name: "tr-mobile-390" },
  { width: 414, height: 896, mobile: true, name: "tr-mobile-414" },
  { width: 430, height: 932, mobile: true, name: "tr-mobile-430" },
  { width: 480, height: 900, mobile: true, name: "tr-mobile-480" },
  { width: 768, height: 1024, mobile: false, name: "tr-tablet-768" },
  { width: 1024, height: 768, mobile: false, name: "tr-desktop-1024" },
  { width: 1366, height: 768, mobile: false, name: "tr-desktop-1366" },
  { width: 1440, height: 900, mobile: false, name: "tr-desktop-1440" },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🚀 Launching Headless Chrome for Travel Planning Resources Comprehensive Test...");
  const chrome = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--remote-debugging-port=9228",
      `--user-data-dir=${TEMP_PROFILE}`,
      "--disable-gpu",
      "--no-first-run",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  await sleep(2000);

  const res = await fetch("http://127.0.0.1:9228/json");
  const pages = await res.json();
  const ws = new WebSocket(pages[0].webSocketDebuggerUrl);
  await new Promise((resolve) => {
    ws.onopen = resolve as any;
  });

  let id = 0;
  function send(method: string, params: any = {}) {
    return new Promise((resolve, reject) => {
      const curId = ++id;
      const handler = (msg: any) => {
        const data = JSON.parse(msg.data.toString());
        if (data.id === curId) {
          ws.removeEventListener("message", handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send("Page.enable");
  await send("DOM.enable");

  // Track console errors
  const consoleErrors: string[] = [];
  ws.addEventListener("message", (msg: any) => {
    try {
      const data = JSON.parse(msg.data.toString());
      if (data.method === "Runtime.consoleAPICalled" && data.params.type === "error") {
        consoleErrors.push(JSON.stringify(data.params.args));
      }
    } catch {}
  });

  // Navigate once
  console.log("Navigating to http://localhost:3000/ ...");
  await send("Page.navigate", { url: "http://localhost:3000/" });
  await sleep(3500);

  const results: any[] = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n🔍 Testing Viewport: ${vp.width}x${vp.height} (${vp.name})...`);

    await send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.mobile,
    });
    await send("Emulation.setTouchEmulationEnabled", { enabled: vp.mobile });

    // Scroll to #travel-resources
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const sec = document.querySelector('#travel-resources');
          if (sec) {
            sec.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        })()
      `,
    });
    await sleep(800);

    // Measure body.scrollWidth, window.innerWidth, and card widths
    const metrics: any = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const winWidth = window.innerWidth;
          const bodyWidth = document.body.scrollWidth;
          const docWidth = document.documentElement.scrollWidth;
          const sec = document.querySelector('#travel-resources');
          
          let cardOverflow = false;
          let maxCardRight = 0;
          if (sec) {
            const cards = sec.querySelectorAll('.grid > div');
            for (const c of cards) {
              const r = c.getBoundingClientRect();
              if (r.right > maxCardRight) maxCardRight = r.right;
              if (r.right > winWidth + 1) {
                cardOverflow = true;
              }
            }
          }

          return {
            winWidth,
            bodyWidth,
            docWidth,
            hasBodyOverflow: bodyWidth > winWidth,
            cardOverflow,
            maxCardRight: Math.round(maxCardRight)
          };
        })()
      `,
      returnByValue: true,
    });

    const m = metrics.result.value;
    console.log(`   Window: ${m.winWidth}px | Body: ${m.bodyWidth}px | Card Max Right: ${m.maxCardRight}px | Overflow: ${m.hasBodyOverflow ? "FAIL" : "PASS"}`);

    results.push({
      viewport: `${vp.width}x${vp.height}`,
      name: vp.name,
      bodyWidth: m.bodyWidth,
      winWidth: m.winWidth,
      passed: !m.hasBodyOverflow && !m.cardOverflow,
    });

    // Capture screenshot
    const shotResult: any = await send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(shotResult.data, "base64");
    const outPath = path.join(OUTPUT_DIR, `${vp.name}.png`);
    fs.writeFileSync(outPath, buffer);
  }

  // Interactivity Test: Click through tabs on mobile (375px)
  console.log("\n🧪 Testing Tab Interactivity on mobile (375px)...");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });

  const tabLabels = ["Warm Layering", "Hiking Gear", "Hydration & First Aid", "Tips & Etiquette", "Documents & Entry"];
  for (const label of tabLabels) {
    const clickResult: any = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('#travel-resources button'));
          const target = btns.find(b => b.innerText.includes('${label}'));
          if (target) {
            target.click();
            return { found: true };
          }
          return { found: false };
        })()
      `,
      returnByValue: true,
    });

    await sleep(400);

    const activeTitleResult: any = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const h3 = document.querySelector('#travel-resources h3');
          return h3 ? h3.innerText : '';
        })()
      `,
      returnByValue: true,
    });

    console.log(`   Clicked '${label}' -> Rendered Title: "${activeTitleResult.result.value}"`);

    // Capture a couple of clicked tab states for visual proof
    if (label === "Warm Layering" || label === "Hiking Gear") {
      const shot: any = await send("Page.captureScreenshot", { format: "png" });
      const safeName = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      fs.writeFileSync(path.join(OUTPUT_DIR, `tr-mobile-tab-${safeName}.png`), Buffer.from(shot.data, "base64"));
    }
  }

  ws.close();
  chrome.kill();

  console.log("\n==================================================");
  console.log("TRAVEL PLANNING RESOURCES RESPONSIVE TEST RESULTS:");
  console.log("==================================================");
  let allPassed = true;
  for (const r of results) {
    console.log(`[${r.passed ? "PASS" : "FAIL"}] ${r.viewport} (${r.name}): winWidth=${r.winWidth}px, bodyWidth=${r.bodyWidth}px`);
    if (!r.passed) allPassed = false;
  }
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`Overall Status: ${allPassed ? "ALL 11 VIEWPORTS PASSED" : "FAILED"}`);
}

run().catch(console.error);

