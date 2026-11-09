# Architecture

## Decisions

- **New Tauri application.** Herald (SwiftUI) is the predecessor and behaviour reference. This is not an incremental port of its UI.
- **Thin Rust core.** Rust owns host discovery, backend process lifecycle, and OS integration. It does not duplicate the gateway protocol or UI state.
- **TypeScript gateway client.** React and the WebSocket client share one protocol implementation, tested with fake gateways. Herald's Swift tests are the behaviour specification.
- **Backend remains authoritative.** No group-chat or agent engine is reimplemented in the app.

## Current flow

1. Rust reads `host-serve` then `host-desktop-serve` from Hermes's per-user gateway-lock directory.
2. It rejects non-loopback hosts, incompatible protocol versions, non-owner-only token files, and token fingerprint mismatches.
3. It verifies `/api/host/identity` against the record's PID, role, and protocol version.
4. The token is returned to the in-process frontend, which opens `ws://<loopback>/api/ws?token=...` and waits for `gateway.ready`.
5. React calls `profiles.list {include_sessions:false}` and renders the bot roster.

## Deliberate gaps in this milestone

- No spawn-if-absent yet; a running `hermes serve` is required.
- PID start-time fingerprint validation is not ported yet. Identity/PID matching is implemented; stale-process hardening remains required before claiming full Herald connection parity.
- No automatic reconnect, request routing, chat, rooms, or release packaging.
- Windows and Linux builds are untested. Discovery permission checks beyond file existence are currently Unix-specific.

## Next milestones

1. **M0 complete:** spawn an owned `hermes serve --isolated` when discovery fails, graceful shutdown, and a live `profiles.list` round trip.
2. **M1:** canonical Bot Chat with streaming, durable sessions, approvals, and busy-submit protection.
3. **M2:** hosted Group Chat using polling, monotonic logs, and room lifecycle controls.
4. **Design and distribution:** reviewed UI mockups, accessibility, platform integration, CI, and signed installers.
