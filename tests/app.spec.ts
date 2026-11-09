import { expect, test, type Page } from "@playwright/test";

const bots = [
  { name: "atlas", display_name: "Atlas", description: "Plans implementation work", model: "Frontier", provider: "local", is_default: true, skill_count: 12 },
  { name: "forge", display_name: "Forge", description: "Builds and tests features", model: "Code", provider: "relay", skill_count: 8 },
  { name: "review", display_name: "Review", description: "Reviews verified changes", model: "Review", provider: "relay", skill_count: 5 },
];

async function installBackend(page: Page, profiles = bots) {
  await page.addInitScript((fakeProfiles) => {
    type Handler = { resolve: (value: unknown) => void; reject: (error: Error) => void };
    const pending = new Map<number, Handler>();
    const socket = {
      onopen: null, onmessage: null, onerror: null, onclose: null,
      sent: [] as string[],
      send(data: string) {
        this.sent.push(data);
        const request = JSON.parse(data);
        if (request.method === "profiles.list") {
          queueMicrotask(() => this.onmessage?.({ data: JSON.stringify({ id: request.id, result: { profiles: fakeProfiles } }) }));
        }
      },
      close() {},
    };
    const global = window as unknown as {
      __TAURI_INTERNALS__: { invoke: (command: string) => Promise<unknown> };
      WebSocket: new (url: string) => typeof socket;
      __fakeGateway: typeof socket;
      __pendingCalls: Map<number, Handler>;
    };
    global.__TAURI_INTERNALS__ = {
      invoke: async (command) => {
        if (command !== "discover_backend") throw new Error("Unexpected command");
        return { role: "desktop-serve", pid: 123, host: "127.0.0.1", port: 8787, token: "test-only" };
      },
    };
    global.WebSocket = class {
      constructor() {
        queueMicrotask(() => socket.onmessage?.({ data: JSON.stringify({ method: "event", params: { type: "gateway.ready", payload: {} } }) }));
        return socket;
      }
    } as unknown as typeof global.WebSocket;
    global.__fakeGateway = socket;
    global.__pendingCalls = pending;
  }, profiles);
}

test("idle and error states offer one clear recovery action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Bring your bots to the desk." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect to Hermes", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "New conversation" })).toBeDisabled();
  await expect(page.getByText("Connect to load the local bot register.")).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 1440);
  await page.screenshot({ path: ".impeccable/review/desktop.png", fullPage: true });
});

test("loads real-shaped profiles, selects a bot, searches, and toggles details", async ({ page }) => {
  await installBackend(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Connect to Hermes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your bot register is ready." })).toBeVisible();
  await expect(page.locator(".bot-list .bot-row")).toHaveCount(3);
  await page.locator(".bot-list .bot-row").filter({ hasText: "Forge" }).click();
  await expect(page.getByRole("heading", { name: "Forge", exact: true })).toBeVisible();
  await expect(page.getByText("No session created")).toBeVisible();
  await page.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.locator(".inspector")).toHaveCount(0);
  await expect(page.locator(".app-shell")).not.toHaveClass(/with-inspector/);
  await page.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.locator(".inspector")).toBeVisible();
  await page.getByRole("button", { name: "Find a bot" }).click();
  await expect(page.locator(".sidebar")).toHaveAttribute("inert", "");
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".search-results .bot-row").last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("textbox", { name: "Find a bot", exact: true })).toBeFocused();
  await page.getByRole("textbox", { name: "Find a bot", exact: true }).fill("Review");
  await expect(page.locator(".search-results .bot-row")).toHaveCount(1);
  await page.locator(".search-results .bot-row").click();
  await expect(page.getByRole("heading", { name: "Review", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Find a bot" })).toBeFocused();
  await page.getByRole("button", { name: "Find", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Find", exact: true })).toBeFocused();
  await page.screenshot({ path: ".impeccable/review/bot-profile.png", fullPage: true });
});

test("empty roster is honest and narrow windows do not overflow", async ({ page }) => {
  await installBackend(page, []);
  await page.goto("/");
  await page.getByRole("button", { name: "Connect to Hermes", exact: true }).click();
  await expect(page.locator(".bot-list .bot-row")).toHaveCount(0);
  await expect(page.getByText("No bot profiles are configured. Create one with `hermes profile create`, then refresh.")).toBeVisible();
  for (const width of [1024, 820, 620]) {
    await page.setViewportSize({ width, height: 700 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
  }
  await expect(page.getByRole("button", { name: "Details", exact: true })).toBeHidden();
  await page.setViewportSize({ width: 820, height: 700 });
  await page.screenshot({ path: ".impeccable/review/user-820.png" });
});
