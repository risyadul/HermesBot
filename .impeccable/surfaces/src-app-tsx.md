---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/styles.css","src/gateway/client.ts","src/gateway/profiles.ts"]
---

# HermesBot application shell

## Scope and mode

Operate. One shared desktop workspace for Bot Chat, Group Chat, and bot management, hosted in Tauri. The first implementation replaces the scaffold's visual world while preserving backend discovery and `profiles.list` behavior.

## Direction contract

THESIS: Press Sheet. Every conversation reads as a live job sheet: compact, accountable, and visibly moving between bots. It refuses the generic dark developer-console shell and decorative card mosaic.

OWN-WORLD: Graphite stock #202421, off-white #e7e5dc, chartreuse #d8ff63 reserved for current work and primary action, slate #668797, and coral #d87763. Flat ink fields, fine registration rules, compact grotesque type, square-to-small-radius controls, and bot identity colors retained in avatars. No gradients, glass, or ornamental illustrations.

STORY: The user connects to their local Hermes backend, sees their bots and current working state, and moves directly into a conversation. Errors explain the failed connection and the next action. Bot Chat and Group Chat not yet implemented are shown honestly as unavailable, never as working conversations.

FIRST VIEWPORT: A desktop-native shell with bot and room navigation on the left, a readable central workspace, and a narrow context area when relevant. The connection screen is an operational job ticket, not a marketing hero. After connection, a slim job-ticket strip above Group Chat shows only backend-known stages and handoffs. The primary Connect action is visible once; status and recovery remain close to it.

FORM: Grounded candidate 5 from the first direction roll, seed:fa2e4892a9460c7e. The user explicitly selected the original Press Sheet after reviewing a bolder re-roll; that user-pinned decision supersedes the re-roll and every newer concept roll. No elements from the second hand are carried over.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Signature interaction

The job-ticket stage advances only when a new backend event identifies a real turn state or active member. It never invents per-bot progress from aggregate state. Switching bots or rooms updates the ticket immediately and keeps navigation interactive. Motion respects reduced-motion settings and is omitted for static connection/error states.

## Constraints

- Existing backend attach and bot listing must keep working.
- No fake bots, rooms, messages, connection success, or backend status in the production app.
- Keyboard focus, accessible names, readable contrast, and reduced motion are required.
- The design system will also cover disconnected, connecting, connected, empty-roster, error, and narrow-window states.

## Open decisions

- Bot Chat and Group Chat information architecture will be detailed with their implementations.
- Native OS menus, shortcuts, notification treatment, and signed packaging are not part of this visual pass.
