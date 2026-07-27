import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
for (const [name, viewport] of Object.entries({
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
})) {
  const ctx = await b.newContext({ viewport });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  const m = await p.evaluate(() => {
    const header = document.querySelector("header").getBoundingClientRect();
    const frame = document.querySelector("#top > div").getBoundingClientRect();
    return {
      headerHeight: Math.round(header.height),
      frameTop: Math.round(frame.top),
      gapHeaderToFrame: Math.round(frame.top - header.bottom),
    };
  });
  console.log(name, JSON.stringify(m));
  await ctx.close();
}
await b.close();
