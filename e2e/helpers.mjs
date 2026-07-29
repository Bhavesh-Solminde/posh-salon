// Shared helpers for the Solminde Studio Playwright suite.
// Plain Node scripts (no @playwright/test runner) so they can run against any
// already-running server with `node e2e/<script>.mjs`.

export const BASE = process.env.E2E_BASE ?? "http://localhost:3000";

export const CREDS = {
  ADMIN: { email: "admin@solminde.studio", password: "demo1234" },
  MANAGER: { email: "manager@solminde.studio", password: "demo1234" },
  CASHIER: { email: "cashier@solminde.studio", password: "demo1234" },
};

// Every admin route, in nav order.
export const ADMIN_ROUTES = [
  "/admin/dashboard",
  "/admin/appointments",
  "/admin/billing",
  "/admin/billing-history",
  "/admin/customers",
  "/admin/memberships",
  "/admin/services",
  "/admin/products",
  "/admin/employees",
  "/admin/reports",
  "/admin/website",
  "/admin/settings",
];

export const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  bad: (s) => `\x1b[31m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[90m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
};

/**
 * Attaches console/pageerror collection to a page. Returns a live array plus a
 * `drain()` that empties it — used to attribute errors to a specific click.
 */
export function watchErrors(page) {
  const errors = [];
  const IGNORE = [
    /favicon/i,
    /Download the React DevTools/i,
    /\[Fast Refresh\]/i,
  ];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (IGNORE.some((re) => re.test(text))) return;
    errors.push(text);
  });
  page.on("pageerror", (e) => errors.push(String(e?.message ?? e)));
  page.on("response", (r) => {
    if (r.status() >= 500) errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  return {
    all: errors,
    drain() {
      return errors.splice(0, errors.length);
    },
  };
}

/** Logs in through the real Better Auth form. Throws if it doesn't stick. */
export async function login(page, role = "ADMIN") {
  const { email, password } = CREDS[role];
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page
    .waitForFunction(() => !location.pathname.endsWith("/admin/login"), null, { timeout: 25000 })
    .catch(async () => {
      const msg = await page.locator('[role="alert"]').first().textContent().catch(() => null);
      throw new Error(`login as ${role} failed${msg ? ` — "${msg.trim()}"` : ""}`);
    });
  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" });
  if (page.url().includes("/admin/login")) {
    throw new Error(
      `login as ${role} did not persist — check BETTER_AUTH_URL matches ${BASE}`,
    );
  }
}

/**
 * Selects the first <option> whose text matches `re`. Playwright's
 * selectOption only takes literal labels, so resolve to a value ourselves.
 */
export async function selectByText(select, re, what = "option") {
  const value = await select.evaluate((el, src) => {
    const rx = new RegExp(src.source, src.flags);
    const opt = Array.from(el.options).find((o) => rx.test(o.textContent ?? ""));
    return opt ? opt.value : null;
  }, { source: re.source, flags: re.flags });
  if (value === null) {
    const all = await select.evaluate((el) => Array.from(el.options).map((o) => o.textContent?.trim()));
    throw new Error(`no ${what} matching ${re} — available: ${all.join(" | ")}`);
  }
  await select.selectOption(value);
  return value;
}

/**
 * Reloads `route` until a table row containing `text` shows up. Server actions
 * against a remote database can outlast any fixed sleep, so poll for the real
 * result instead. Returns the row's text.
 */
export async function waitForRow(page, route, text, tries = 10) {
  for (let i = 0; i < tries; i++) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const row = page.locator("tbody tr", { hasText: text }).first();
    if (await row.count()) return row.innerText();
    await page.waitForTimeout(1500);
  }
  throw new Error(`no row containing "${text}" on ${route} after ${tries} tries`);
}

/** Waits for an open modal to close — how these forms signal success. */
export async function waitForModalClose(page, timeout = 30000) {
  await page.waitForFunction(
    () => document.querySelectorAll('[role="dialog"]').length === 0,
    null,
    { timeout },
  ).catch(async () => {
    const alerts = await page.locator('[role="alert"]').allInnerTexts().catch(() => []);
    throw new Error(`form did not submit${alerts.length ? ` — ${alerts.join(" / ").trim()}` : ""}`);
  });
}

/** A stable identity for a button so the report is readable. */
export async function describeButton(btn) {
  const [name, aria, text, type] = await Promise.all([
    btn.getAttribute("aria-label"),
    btn.getAttribute("title"),
    btn.innerText().catch(() => ""),
    btn.getAttribute("type"),
  ]);
  const label = (name || aria || (text || "").trim().split("\n")[0] || "").trim();
  return label || `<unnamed ${type ?? "button"}>`;
}

/** Snapshot enough page state to tell whether a click did anything. */
export async function snapshot(page) {
  return page.evaluate(() => ({
    url: location.pathname + location.search,
    html: document.body?.innerHTML.length ?? 0,
    dialogs: document.querySelectorAll('[role="dialog"]').length,
    alerts: document.querySelectorAll('[role="alert"],[role="status"]').length,
    aria: Array.from(document.querySelectorAll("[aria-current],[aria-expanded],[aria-selected]"))
      .map((el) => `${el.getAttribute("aria-current")}${el.getAttribute("aria-expanded")}${el.getAttribute("aria-selected")}`)
      .join("|"),
  }));
}

export function changed(a, b) {
  return (
    a.url !== b.url ||
    a.dialogs !== b.dialogs ||
    a.alerts !== b.alerts ||
    a.aria !== b.aria ||
    Math.abs(a.html - b.html) > 20
  );
}

/** Close whatever the click opened, so the next button starts clean. */
export async function resetUi(page, route) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(120);
  const stillOpen = await page.locator('[role="dialog"]').count().catch(() => 0);
  const offRoute = !page.url().includes(route);
  if (stillOpen > 0 || offRoute) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  }
}
