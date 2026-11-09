export type JsonObject = Record<string, unknown>;

export interface WebSocketLike {
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: (() => void) | null;
  onclose: (() => void) | null;
  send(data: string): void;
  close(): void;
}

export type WebSocketFactory = (url: string) => WebSocketLike;
export type GatewayEvent = { type: string; payload: unknown };

type Pending = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class GatewayError extends Error {}

export function redactSecrets(text: string): string {
  return text
    .replace(/([?&]token=)[^\s&"']+/gi, "$1[REDACTED]")
    .replace(/(Bearer\s+)[^\s"']+/gi, "$1[REDACTED]")
    .replace(/(X-Hermes-Token\s*[:=]?\s*)[^\s"']+/gi, "$1[REDACTED]")
    .replace(/hermes-gateway-ticket\.[^\s"']+/gi, "hermes-gateway-ticket.[REDACTED]");
}

function endpoint(attachment: { host: string; port: number; token: string }): string {
  if (!["127.0.0.1", "localhost", "::1"].includes(attachment.host)) {
    throw new GatewayError("Only loopback Hermes backends are supported");
  }
  const host = attachment.host.includes(":") ? `[${attachment.host}]` : attachment.host;
  return `ws://${host}:${attachment.port}/api/ws?token=${encodeURIComponent(attachment.token)}`;
}

/** Single-use Hermes JSON-RPC WebSocket client. One JSON object per frame. */
export class GatewayClient {
  private socket?: WebSocketLike;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private listeners = new Set<(event: GatewayEvent) => void>();
  private terminal?: Error;
  private rejectConnect?: (error: Error) => void;

  constructor(
    private attachment: { host: string; port: number; token: string },
    private makeSocket: WebSocketFactory = (url) => new WebSocket(url) as unknown as WebSocketLike,
  ) {}

  connect(timeoutMs = 20_000): Promise<unknown> {
    if (this.socket || this.terminal) return Promise.reject(new GatewayError("Client is already used"));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.fail(new GatewayError("Timed out waiting for gateway.ready")), timeoutMs);
      let ready = false;
      this.rejectConnect = (error) => { clearTimeout(timer); reject(error); };
      const url = endpoint(this.attachment);
      try {
        this.socket = this.makeSocket(url);
      } catch {
        clearTimeout(timer);
        this.fail(new GatewayError("Could not open the Hermes gateway"));
        return;
      }
      this.socket.onopen = () => { /* gateway.ready, not socket open, completes connect */ };
      this.socket.onerror = () => this.fail(new GatewayError("Hermes gateway connection failed"));
      this.socket.onclose = () => this.fail(new GatewayError("Hermes gateway disconnected"));
      this.socket.onmessage = ({ data }) => {
        if (typeof data !== "string") return;
        let message: JsonObject;
        try { message = JSON.parse(data) as JsonObject; } catch { return; }
        if (message.method === "event") {
          const params = (message.params ?? {}) as JsonObject;
          if (params.type === "gateway.ready" && !ready) {
            ready = true;
            this.rejectConnect = undefined;
            clearTimeout(timer);
            resolve(params.payload);
          }
          this.listeners.forEach((listener) => listener({ type: String(params.type ?? ""), payload: params.payload }));
          return;
        }
        if (typeof message.id === "number" && message.method === undefined) {
          const request = this.pending.get(message.id);
          if (!request) return;
          this.pending.delete(message.id);
          clearTimeout(request.timer);
          if (message.error) {
            const rpcError = message.error as JsonObject;
            request.reject(new GatewayError(`Hermes RPC ${String(rpcError.code ?? "error")}: ${String(rpcError.message ?? "request failed")}`));
          } else {
            request.resolve(message.result);
          }
        }
      };
    }).catch((error: unknown) => {
      this.terminal = error instanceof Error ? error : new GatewayError("Connection failed");
      throw this.terminal;
    });
  }

  call<T = unknown>(method: string, params: JsonObject = {}, timeoutMs = 20_000): Promise<T> {
    if (this.terminal) return Promise.reject(this.terminal);
    if (!this.socket) return Promise.reject(new GatewayError("Not connected"));
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new GatewayError(`Hermes RPC timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject, timer });
      try {
        this.socket!.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
      } catch {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(new GatewayError(`Could not send Hermes RPC: ${method}`));
      }
    });
  }

  onEvent(listener: (event: GatewayEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close(): void {
    this.socket?.close();
    this.fail(new GatewayError("Not connected"));
  }

  private fail(error: Error): void {
    const safe = new GatewayError(redactSecrets(error.message));
    this.terminal = safe;
    this.rejectConnect?.(safe);
    this.rejectConnect = undefined;
    this.pending.forEach(({ reject, timer }) => { clearTimeout(timer); reject(safe); });
    this.pending.clear();
  }
}
