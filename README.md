# HermesBot

A cross-platform desktop client for [Hermes Agent](https://github.com/NousResearch/hermes-agent), built with Tauri, React, and TypeScript.

This is a new application. The SwiftUI Herald project is its predecessor and behaviour reference, not a dependency.

## Status

Early development. The current milestone is a working shell that discovers a running Hermes backend, verifies its identity, connects to its WebSocket gateway, and lists bots with `profiles.list`.

Not implemented yet: spawning a missing backend, Bot Chat, Group Chat, Kanban, notifications, and packaged releases. The current UI implements the user-selected Press Sheet design direction for the connection and bot-profile shell.

## Requirements

- Hermes Agent with `hermes serve` running for the current attach-only milestone
- Node.js 22+
- Rust 1.77.2+
- The [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/)

## Run

```sh
npm install
npm run tauri dev
```

Click **Connect to Hermes**. The app reads Hermes's per-user gateway rendezvous records, accepts loopback backends only, checks the session-token fingerprint and `/api/host/identity`, then opens `/api/ws`.

## Verify

```sh
npm test
npm run test:ui
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

Unit and browser tests use fake gateways and never touch real Hermes data. Browser tests use the locally installed Chrome; set `CHROME_PATH` if Chrome is elsewhere. Live-backend and clean-machine quick-start verification have not been done yet.

## Design

The app uses the Press Sheet design system chosen through Impeccable. See [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md), and the application surface brief in `.impeccable/surfaces/`.

## Security

The backend session token is held in memory, never logged, and redacted from surfaced errors. Only loopback backend hosts are accepted. Attached backends are never stopped by the app.

## Reference

- Behaviour and wire contracts: `../hermes-bot-app/docs/` during development; relevant contracts will be copied into this repository as they are implemented.
- Upstream backend: [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent).

## License

Apache-2.0. See [LICENSE](LICENSE). Contributions are licensed under the same Apache-2.0 terms.
