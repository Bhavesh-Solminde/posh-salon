// Clicks every button on every admin screen and reports which ones do nothing
// or throw. Destructive confirms are always dismissed, so this is safe to run
// against seeded data.
//
//   node e2e/button-audit.mjs            # all routes
//   node e2e/button-audit.mjs customers  # one route
import { chromium } from "playwright";
import {
  BASE, ADMIN_ROUTES, c, login, watchErrors, describeButton, snapshot, changed, resetUi,
} from "./helpers.mjs";

const only = process.argv[2];
const routes = only ? ADMIN_ROUTES.filter((r) => r.includes(only)) : ADMIN_ROUTES;
if (routes.length === 0) {
  console.error(`No route matches "${only}"`);
  process.exit(1);
}

// Buttons we must not click during a sweep: they end the session or leave the shell.
const SKIP = /sign ?out|log ?out|print|download|export/i;

// Buttons whose correct behaviour on this route IS to do nothing.
const EXPECTED_NOOP = [
  { route: "/admin/billing", label: /^New Invoice$/, why: "already on the billing screen" },
  { route: "/admin/billing", label: /^Full$/, why: "nothing due on an empty cart" },
  { route: "/admin/website", label: /^Offers$/, why: "already the active tab" },
];
const isExpectedNoop = (route, label) =>
  EXPECTED_NOOP.find((e) => e.route === route && e.label.test(label));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = watchErrors(page);

// Never let a native confirm() actually delete anything.
let confirmsSeen = 0;
page.on("dialog", async (d) => {
  confirmsSeen++;
  await d.dismiss().catch(() => {});
});

const results = [];
const record = (route, label, status, detail = "") =>
  results.push({ route, label, status, detail });

try {
  await login(page, "ADMIN");
  console.log(c.dim(`logged in as admin@posh.salon → ${BASE}\n`));

  for (const route of routes) {
    console.log(c.b(route));
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    errs.drain(); // ignore load-time noise; we only attribute click-time errors

    const count = await page.locator("button:visible").count();
    if (count === 0) console.log(c.dim("  (no buttons)"));

    for (let i = 0; i < count; i++) {
      const btn = page.locator("button:visible").nth(i);
      if ((await btn.count()) === 0) continue; // DOM shifted under us

      let label;
      try {
        label = await describeButton(btn);
      } catch {
        continue;
      }

      if (SKIP.test(label)) {
        console.log(`  ${c.dim("skip")} ${label} ${c.dim("(session/native action)")}`);
        record(route, label, "skipped", "excluded from sweep");
        continue;
      }
      if (await btn.isDisabled().catch(() => true)) {
        console.log(`  ${c.dim("skip")} ${label} ${c.dim("(disabled)")}`);
        record(route, label, "skipped", "disabled");
        continue;
      }

      const before = await snapshot(page);
      const confirmsBefore = confirmsSeen;

      try {
        // Generous: these pages re-render off a remote database.
        await btn.click({ timeout: 15000 });
      } catch (e) {
        console.log(`  ${c.bad("FAIL")} ${label} ${c.dim("— not clickable: " + e.message.split("\n")[0])}`);
        record(route, label, "fail", "not clickable");
        await resetUi(page, route);
        continue;
      }

      // A server action against a remote DB can take seconds, so poll for the
      // effect rather than sampling once — otherwise slow buttons look dead.
      let after = await snapshot(page);
      for (let waited = 0; waited < 6000 && !changed(before, after); waited += 300) {
        await page.waitForTimeout(300);
        after = await snapshot(page);
      }
      const clickErrors = errs.drain();
      const firedConfirm = confirmsSeen > confirmsBefore;

      if (clickErrors.length > 0) {
        console.log(`  ${c.bad("FAIL")} ${label}`);
        clickErrors.forEach((e) => console.log(c.bad(`         ${e.slice(0, 160)}`)));
        record(route, label, "fail", clickErrors[0].slice(0, 200));
      } else if (firedConfirm) {
        console.log(`  ${c.ok("ok")}   ${label} ${c.dim("→ confirm prompt (dismissed)")}`);
        record(route, label, "ok", "confirm dialog");
      } else if (changed(before, after)) {
        const what =
          before.url !== after.url ? `→ ${after.url}`
          : after.dialogs > before.dialogs ? "→ opened dialog"
          : after.alerts > before.alerts ? "→ toast/validation"
          : before.aria !== after.aria ? "→ toggled state"
          : "→ updated view";
        console.log(`  ${c.ok("ok")}   ${label} ${c.dim(what)}`);
        record(route, label, "ok", what);
      } else {
        const noop = isExpectedNoop(route, label);
        if (noop) {
          console.log(`  ${c.ok("ok")}   ${label} ${c.dim(`→ no-op (${noop.why})`)}`);
          record(route, label, "ok", `expected no-op: ${noop.why}`);
        } else {
          console.log(`  ${c.warn("DEAD")} ${label} ${c.dim("— click produced no visible change")}`);
          record(route, label, "dead", "no observable effect");
        }
      }

      await resetUi(page, route);
    }
    console.log("");
  }

  // Sign-out gets its own check at the very end.
  const signOut = page.getByRole("button", { name: /sign ?out|log ?out/i }).first();
  if (await signOut.count()) {
    await signOut.click();
    await page.waitForTimeout(1500);
    await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" });
    const loggedOut = page.url().includes("/admin/login");
    console.log(loggedOut ? c.ok("ok   Sign out → session cleared") : c.bad("FAIL Sign out → still authenticated"));
    record("/admin", "Sign out", loggedOut ? "ok" : "fail", loggedOut ? "session cleared" : "session persisted");
  }
} catch (e) {
  console.error(c.bad(`\nAborted: ${e.message}`));
  await page.screenshot({ path: "e2e/_audit-failure.png" }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}

const tally = (s) => results.filter((r) => r.status === s).length;
const failed = results.filter((r) => r.status === "fail");
const dead = results.filter((r) => r.status === "dead");

console.log(c.b("\n──────── button audit ────────"));
console.log(`  clicked   ${results.length - tally("skipped")}`);
console.log(`  ${c.ok("working")}   ${tally("ok")}`);
console.log(`  ${c.warn("dead")}      ${dead.length}`);
console.log(`  ${c.bad("failing")}   ${failed.length}`);
console.log(`  skipped   ${tally("skipped")}`);

if (dead.length) {
  console.log(c.warn("\nNo observable effect:"));
  dead.forEach((r) => console.log(`  ${r.route} → ${r.label}`));
}
if (failed.length) {
  console.log(c.bad("\nFailing:"));
  failed.forEach((r) => console.log(`  ${r.route} → ${r.label}: ${r.detail}`));
  process.exitCode = 1;
} else if (!dead.length) {
  console.log(c.ok("\n✅ every button on every admin screen responds"));
}
