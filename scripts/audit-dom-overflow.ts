import { spawn } from "child_process";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_PROFILE = path.join(process.env.TEMP || "C:\\Temp", "chrome_dom_audit_" + Date.now());

async function run() {
  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9227",
    "--user-data-dir=" + TEMP_PROFILE,
    "--disable-gpu",
    "about:blank",
  ]);

  await new Promise((r) => setTimeout(r, 2000));
  const res = await fetch("http://127.0.0.1:9227/json");
  const pages = await res.json();
  const ws = new WebSocket(pages[0].webSocketDebuggerUrl);
  await new Promise((r) => {
    ws.onopen = r as any;
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

  await send("Emulation.setDeviceMetricsOverride", {
    width: 360,
    height: 800,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send("Page.navigate", { url: "http://localhost:3000/" });
  await new Promise((r) => setTimeout(r, 3500));

  const evalResult: any = await send("Runtime.evaluate", {
    expression: `
      (() => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const winWidth = window.innerWidth;
        const sec = document.querySelector('#travel-resources');
        
        const details = [];
        if (sec) {
          const els = sec.querySelectorAll('*');
          for (const el of els) {
            const rect = el.getBoundingClientRect();
            // Check if element extends beyond viewport width
            if (rect.right > winWidth + 1) {
              details.push({
                tag: el.tagName,
                className: el.className,
                rectRight: Math.round(rect.right),
                rectWidth: Math.round(rect.width),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                text: el.innerText ? el.innerText.slice(0, 40) : ''
              });
            }
          }
        }
        
        return {
          winWidth,
          docWidth,
          bodyWidth,
          overflowCount: details.length,
          overflowElements: details
        };
      })()
    `,
    returnByValue: true,
  });

  console.log("DOM Overflow Analysis at 360px viewport:");
  console.log(JSON.stringify(evalResult.result.value, null, 2));

  ws.close();
  chrome.kill();
}

run().catch(console.error);

