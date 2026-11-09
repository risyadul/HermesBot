# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Tauri hosts the shared React UI. Window chrome, menus, shortcuts, and notifications follow each desktop OS's conventions; the product design system itself is shared.

## Stack

Tauri 2, Rust, React, and TypeScript, chosen by the user for a new cross-platform desktop application backed by the existing Hermes Agent backend.

## Users

Engineers and power users who run multiple Hermes bots themselves and frequently switch between one-to-one Bot Chat and multi-bot Group Chat.

## Product Purpose

HermesBot is an open-source desktop client for Hermes Agent. It gives bot operators a lightweight, responsive place to manage bots and work across direct and group conversations without replacing the backend's agent or room engines.

The first public release must prove useful Bot Chat, Group Chat, and bot management across desktop operating systems. Kanban and Routines follow later.

## Positioning

A cross-platform, user-controlled desktop client that talks directly to the user's existing Hermes backend. It shares Bot Chat state with Hermes tooling and uses backend-hosted rooms rather than maintaining a separate agent or group-chat engine.

## Operating Context

The app is used during active engineering work: checking several bots, switching conversations, reviewing responses and tool activity, steering work, and coordinating multiple bots in a room. Hermes remains the source of profiles, sessions, rooms, credentials, and model execution.

## Capabilities and Constraints

- Required for the first public release: Bot Chat, Group Chat, and bot management.
- Deferred: Kanban, Routines, full Herald feature parity, and a mobile product.
- The UI connects only to loopback Hermes backends. Backend session tokens must stay out of logs and surfaced errors.
- A running backend is required in the current scaffold; spawn-if-absent and graceful owned-backend shutdown are planned.
- One product design system is shared, while window chrome, menus, shortcuts, and notifications follow macOS, Windows, and Linux conventions.
- Windows and Linux support must be verified on those platforms, not inferred from the Tauri stack.

## Brand Commitments

- Product name: HermesBot.
- Open source under Apache-2.0.
- The UI should feel native to its desktop host without losing the product's own identity.
- Bot identity colors should remain legible and should not be displaced by a dominant product accent.

## Evidence on Hand

- Existing Hermes Agent gateway behavior and contracts in the predecessor Herald repository.
- Herald's SwiftUI implementation and tests as behavioral references, not runtime dependencies.
- The new Tauri scaffold in this repository.
- No user research, public adoption claims, performance benchmarks, or cross-platform verification results yet.

## Product Principles

- The backend is authoritative; do not fork its state or reimplement its engines in the UI.
- Optimize for frequent, low-friction switching between bots and rooms.
- Show real working state, failures, and next actions instead of decorative approximations.
- Scope the first release around the core conversation and bot-management workflows.
- Preserve user ownership of data, credentials, backend lifecycle, and local configuration.

## Accessibility & Inclusion

Keyboard navigation, OS-appropriate shortcuts, reduced-motion behavior, readable contrast, and accessible names are required for the shared UI. Platform-specific verification remains open.
