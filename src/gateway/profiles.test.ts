import { describe, expect, it } from "vitest";
import { listBots } from "./profiles";

describe("listBots", () => {
  it("requests no sessions and maps the backend profile array", async () => {
    const calls: unknown[] = [];
    const bots = await listBots({
      async call<T>(method: string, params?: Record<string, unknown>): Promise<T> {
        calls.push({ method, params });
        return { profiles: [{ name: "default", display_name: "Hermes" }] } as T;
      },
    });
    expect(calls).toEqual([{ method: "profiles.list", params: { include_sessions: false } }]);
    expect(bots[0].display_name).toBe("Hermes");
  });

  it("fails closed on a malformed response", async () => {
    await expect(listBots({ async call<T>(): Promise<T> { return {} as T; } })).rejects.toThrow("Invalid profiles.list");
  });
});
