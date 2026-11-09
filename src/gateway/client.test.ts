import { describe, expect, it, vi } from "vitest";
import { GatewayClient, redactSecrets, type WebSocketLike } from "./client";

class FakeSocket implements WebSocketLike {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  sent: string[] = [];
  constructor(readonly url: string) {}
  send(data: string) { this.sent.push(data); }
  close() { this.onclose?.(); }
  receive(value: unknown) { this.onmessage?.({ data: JSON.stringify(value) }); }
  ready() { this.receive({ method: "event", params: { type: "gateway.ready", payload: { protocol: 1 } } }); }
}

function fixture() {
  const sockets: FakeSocket[] = [];
  const client = new GatewayClient(
    { host: "127.0.0.1", port: 8787, token: "live-secret" },
    (url) => { const socket = new FakeSocket(url); sockets.push(socket); return socket; },
  );
  return { client, socket: () => sockets[0] };
}

describe("GatewayClient", () => {
  it("waits for gateway.ready and uses no subprotocol", async () => {
    const { client, socket } = fixture();
    const connected = client.connect();
    expect(socket().url).toBe("ws://127.0.0.1:8787/api/ws?token=live-secret");
    socket().ready();
    await expect(connected).resolves.toEqual({ protocol: 1 });
  });

  it("rejects non-loopback endpoints before opening a socket", async () => {
    const factory = vi.fn();
    const client = new GatewayClient({ host: "192.168.1.2", port: 80, token: "x" }, factory);
    await expect(client.connect()).rejects.toThrow("Only loopback");
    expect(factory).not.toHaveBeenCalled();
  });

  it("sends one JSON-RPC request per frame and resolves by id", async () => {
    const { client, socket } = fixture();
    const connected = client.connect();
    socket().ready();
    await connected;
    const result = client.call("profiles.list", { include_sessions: false });
    expect(socket().sent).toHaveLength(1);
    const request = JSON.parse(socket().sent[0]);
    expect(request).toEqual({ jsonrpc: "2.0", id: 1, method: "profiles.list", params: { include_sessions: false } });
    socket().receive({ id: 1, result: { profiles: [] } });
    await expect(result).resolves.toEqual({ profiles: [] });
  });

  it("surfaces RPC errors and rejects pending calls on disconnect", async () => {
    const { client, socket } = fixture();
    const connected = client.connect();
    socket().ready();
    await connected;
    const failed = client.call("groups.state");
    socket().receive({ id: 1, error: { code: 5119, message: "stale approval" } });
    await expect(failed).rejects.toThrow("5119: stale approval");
    const pending = client.call("profiles.list");
    socket().onclose?.();
    await expect(pending).rejects.toThrow("disconnected");
  });

  it("rejects connect immediately when the socket closes", async () => {
    const { client, socket } = fixture();
    const connected = client.connect();
    socket().onclose?.();
    await expect(connected).rejects.toThrow("disconnected");
  });

  it("fans out typed events", async () => {
    const { client, socket } = fixture();
    const events: string[] = [];
    client.onEvent((event) => events.push(event.type));
    const connected = client.connect();
    socket().ready();
    await connected;
    socket().receive({ method: "event", params: { type: "message.delta", payload: { text: "hi" } } });
    expect(events).toEqual(["gateway.ready", "message.delta"]);
  });
});

describe("redactSecrets", () => {
  it("removes every credential form used by the gateway", () => {
    const text = "ws://localhost/api/ws?token=abc&x=1 Bearer abc X-Hermes-Token: abc hermes-gateway-ticket.abc";
    const redacted = redactSecrets(text);
    expect(redacted).not.toContain("abc");
    expect(redacted).toContain("token=[REDACTED]");
  });
});
