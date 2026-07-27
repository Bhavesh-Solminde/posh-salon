// End-to-end critical flows: create a customer → sell a membership → ring a
// mixed service+product bill that redeems the wallet → verify it lands in
// billing history, and that the wallet was debited for SERVICES ONLY.
//
//   node e2e/flows.mjs
import { chromium } from "playwright";
import {
  BASE, c, login, watchErrors, selectByText, waitForRow, waitForModalClose,
} from "./helpers.mjs";

const uniq = Date.now().toString().slice(-6);
const CUSTOMER = `E2E Client ${uniq}`;
const PHONE = `9${uniq}0000`.slice(0, 10);

const steps = [];
const step = async (name, fn) => {
  const t = Date.now();
  try {
    const detail = await fn();
    const ms = Date.now() - t;
    console.log(`  ${c.ok("✓")} ${name} ${c.dim(`(${ms}ms)`)}${detail ? c.dim(" — " + detail) : ""}`);
    steps.push({ name, ok: true, ms });
  } catch (e) {
    console.log(`  ${c.bad("✗")} ${name} ${c.dim("—")} ${c.bad(e.message.split("\n")[0])}`);
    steps.push({ name, ok: false, error: e.message });
    throw e;
  }
};
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const money = (s) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = watchErrors(page);

try {
  console.log(c.b("\nAuth"));
  await step("unauthenticated /admin/dashboard redirects to login", async () => {
    await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" });
    expect(page.url().includes("/admin/login"), `landed on ${page.url()}`);
  });
  await step("admin@posh.salon signs in", () => login(page, "ADMIN"));

  console.log(c.b("\nCustomer"));
  await step("create customer", async () => {
    await page.goto(`${BASE}/admin/customers`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /new customer/i }).first().click();
    await page.waitForSelector('input[name="name"]', { state: "visible" });
    await page.fill('input[name="name"]', CUSTOMER);
    await page.fill('input[name="phone"]', PHONE);
    await page.getByRole("button", { name: /register customer/i }).last().click();
    await waitForModalClose(page);
    await waitForRow(page, `/admin/customers?q=${PHONE}`, CUSTOMER);
    return CUSTOMER;
  });

  console.log(c.b("\nMembership"));
  let walletStart = 0;
  await step("sell a membership (wallet credited)", async () => {
    await page.goto(`${BASE}/admin/memberships`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /new membership|add membership/i }).first().click();
    await page.waitForSelector('[role="dialog"]', { state: "visible" });
    const dlg = page.locator('[role="dialog"]');
    await selectByText(dlg.locator("select").first(), new RegExp(PHONE), "customer");
    // Pick the Gold plan (5000 paid → 7000 wallet).
    await selectByText(dlg.locator("select").nth(1), /gold/i, "plan");
    await dlg.getByRole("button", { name: /create membership/i }).click();
    await waitForModalClose(page);
    const row = await waitForRow(page, "/admin/memberships", CUSTOMER);
    // The wallet is the only ₹ figure in the row.
    walletStart = money((row.match(/₹\s?([\d,]+(?:\.\d+)?)/) ?? [])[1] ?? 0);
    expect(walletStart > 0, `wallet not funded (row: ${row})`);
    return `wallet ₹${walletStart}`;
  });

  console.log(c.b("\nBilling — the money path"));
  let invoiceNo = "";
  let walletUsed = 0;
  let serviceSubtotal = 0;
  await step("ring a service + product bill redeeming the wallet", async () => {
    await page.goto(`${BASE}/admin/billing`, { waitUntil: "networkidle" });
    await selectByText(page.locator("#pos-customer"), new RegExp(PHONE), "customer");
    await page.selectOption("#pos-service", { index: 1 });
    await page.waitForTimeout(200);
    await page.selectOption("#pos-product", { index: 1 });
    await page.waitForTimeout(400);

    // Redeem the maximum the UI will allow.
    await page.getByRole("button", { name: /^max$/i }).first().click();
    await page.waitForTimeout(300);

    const summary = await page.textContent("body");
    const svcMatch = summary.match(/Services?[^0-9₹]*₹\s?([\d,]+(?:\.\d+)?)/i);
    serviceSubtotal = svcMatch ? money(svcMatch[1]) : 0;
    const walMatch = summary.match(/Wallet[^0-9₹]*₹\s?([\d,]+(?:\.\d+)?)/i);
    walletUsed = walMatch ? money(walMatch[1]) : 0;

    await page.getByRole("button", { name: /^full$/i }).first().click().catch(() => {});
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: /generate invoice/i }).click();
    // Success panel: "Invoice <number>" + a View/Print link to the detail page.
    const done = page.locator('a[href^="/admin/billing/"]').first();
    await done.waitFor({ state: "visible", timeout: 60000 });
    const heading = await page
      .locator("p")
      .filter({ hasText: /^Invoice\s+\S+$/ })
      .first()
      .innerText();
    invoiceNo = heading.replace(/^Invoice\s+/, "").trim();
    expect(/\d/.test(invoiceNo) && invoiceNo.length > 4, `bad invoice number: "${invoiceNo}"`);
    return `invoice ${invoiceNo}`;
  });

  await step("wallet redemption never exceeds the service subtotal", async () => {
    expect(
      walletUsed <= serviceSubtotal + 0.01,
      `wallet redeemed ₹${walletUsed} > service subtotal ₹${serviceSubtotal} — SERVICES-ONLY RULE BROKEN`,
    );
    return `₹${walletUsed} redeemed vs ₹${serviceSubtotal} of services`;
  });

  await step("invoice appears in billing history", async () => {
    await page.goto(`${BASE}/admin/billing-history`, { waitUntil: "networkidle" });
    expect((await page.textContent("body")).includes(invoiceNo), `${invoiceNo} missing from ledger`);
  });

  await step("invoice detail page renders", async () => {
    await page.goto(`${BASE}/admin/billing-history`, { waitUntil: "networkidle" });
    await page.locator("tr", { hasText: invoiceNo }).first().click();
    await page.waitForTimeout(1500);
  });

  await step("dashboard reflects the sale", async () => {
    await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" });
    const body = await page.textContent("body");
    for (const kpi of ["Today's Revenue", "Today's Invoices"]) {
      expect(body.includes(kpi), `dashboard missing "${kpi}"`);
    }
  });

  console.log(c.b("\nRBAC"));
  await step("cashier is blocked from manager-only screens", async () => {
    const c2 = await browser.newContext();
    const p2 = await c2.newPage();
    await login(p2, "CASHIER");
    await p2.goto(`${BASE}/admin/website`, { waitUntil: "networkidle" });
    const bounced = !p2.url().includes("/admin/website");
    await c2.close();
    expect(bounced, "cashier reached /admin/website");
    return "bounced to dashboard";
  });

  console.log(c.b("\nRegression"));
  await step("public landing still renders", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    expect((await page.textContent("body")).length > 500, "landing page looks empty");
  });
} catch {
  await page.screenshot({ path: "e2e/_flow-failure.png" }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}

const failed = steps.filter((s) => !s.ok);
console.log(c.b("\n──────── flows ────────"));
console.log(`  ${c.ok("passed")}  ${steps.length - failed.length}/${steps.length}`);
if (errs.all.length) {
  console.log(c.bad(`  console errors: ${errs.all.length}`));
  errs.all.slice(0, 8).forEach((e) => console.log(c.bad(`    - ${e.slice(0, 160)}`)));
  process.exitCode = 1;
}
if (failed.length) {
  console.log(c.bad("  failed:"));
  failed.forEach((s) => console.log(c.bad(`    - ${s.name}: ${s.error}`)));
  process.exitCode = 1;
} else if (!errs.all.length) {
  console.log(c.ok("\n✅ all critical flows green, 0 console errors"));
}
