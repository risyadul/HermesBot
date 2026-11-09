---
version: alpha
name: HermesBot
description: The Live Press Sheet — a compact, accountable desktop workspace rendered in graphite, off-white stock, and signal chartreuse.
colors:
  graphite: "#202421"
  paper: "#e7e5dc"
  primary: "#d8ff63"
  primary-hover: "#c8ee50"
  slate: "#668797"
  coral: "#d87763"
  line: "#b8b9af"
  muted: "#5d655f"
  sidebar-muted: "#b5bcb4"
  dark-rule: "#444a43"
  sheet: "#f0efe7"
  topbar: "#eeede5"
  inspector: "#deded4"
  nav-hover: "#2c322b"
  nav-selected: "#343b2d"
  bot-slate: "#87aebe"
  bot-blue: "#89a7c5"
  bot-sand: "#d7c47f"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.045em"
  bot-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.045em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.62
  supporting:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  nav-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  action:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 750
rounded:
  none: "0px"
  sm: "3px"
  md: "4px"
  lg: "5px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "30px"
  3xl: "38px"
components:
  primary-action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    padding: "9px 15px"
    height: "40px"
  primary-action-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    padding: "9px 15px"
    height: "40px"
  text-button:
    backgroundColor: "{colors.topbar}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "6px 8px"
  text-button-hover:
    backgroundColor: "{colors.inspector}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.sm}"
    padding: "6px 8px"
  bot-row:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 13px"
    width: "100%"
  bot-row-hover:
    backgroundColor: "{colors.nav-hover}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 13px"
    width: "100%"
  bot-row-selected:
    backgroundColor: "{colors.nav-selected}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 13px"
    width: "100%"
  connection-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "0px"
  bot-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "0px 0px 24px"
  inspector:
    backgroundColor: "{colors.inspector}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "20px 18px"
    width: "280px"
  search-dialog:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0px"
---

# Design System: HermesBot

## Overview

**Creative North Star: "The Live Press Sheet"**

HermesBot is an Operate-mode desktop workspace: a bot register, a central job sheet, and an optional inspector. Its visual identity comes from the language of a live production sheet—compact, accounted for, and directly tied to the local Hermes backend—rather than a marketing hero, generic developer console, or mosaic of decorative cards.

Graphite ink fields sit against off-white stock. Acid chartreuse is a sparse operational signal, while bot-owned colors remain visible in avatars. Fine registration rules, square sheets, compact type, and small-radius controls provide structure without ornamental illustration, glass, blur, or decorative gradient washes. The workspace does use two CSS `linear-gradient` declarations, but only as hard-stop 1px registration-grid lines on a 32px grid; they are not color-fade surfaces.

Motion is brief and state-led: 120ms control transitions, 220ms sheet entry, 160ms dialog entry, and a 900ms connecting indicator. All are gated behind `prefers-reduced-motion: no-preference`. Static connection and error states do not need motion to appear active.

**Key Characteristics:**
- Operational press sheets with visible registration, state, and recovery.
- Sparse acid signals alongside deterministic bot identity colors.
- Flat graphite and paper fields, fine rules, square sheets, and small-radius controls.
- Compact system-sans typography with tight headlines and readable explanatory copy.
- Backend-truthful states, responsive shell constraints, and reduced-motion support.

## Colors

The palette behaves like ink, stock, registration marks, and a small set of accountable signals.

### Primary
- **Acid Chartreuse** (#d8ff63): Primary actions, selected-bot registration, connected status, keyboard focus, text selection, and the small brand mark. **Acid Hover** (#c8ee50) is its implemented hover state.

### Secondary
- **Utility Slate** (#668797): Thin scrollbar color; it stays subordinate to content.
- **Bot Slate** (#87aebe), **Bot Blue** (#89a7c5), and **Bot Sand** (#d7c47f): Three entries in the implemented avatar identity rotation, alongside acid, paper, and coral.

### Tertiary
- **Registration Coral** (#d87763): Error status and one bot identity color. The connection sheet's error register uses a deeper coral-brown (#804b3f) in the component snippet rather than introducing a broad error surface.

### Neutral
- **Graphite Stock** (#202421): Sidebar, search dialog, sheet register, and primary text on light stock.
- **Press Paper** (#e7e5dc): Main workspace ground, dark-field text, and one avatar identity color.
- **Sheet Stock** (#f0efe7), **Topbar Stock** (#eeede5), and **Inspector Stock** (#deded4): Close-valued working surfaces distinguished by role rather than floating cards.
- **Registration Line** (#b8b9af) and **Dark Rule** (#444a43): Fine separators on light and dark fields respectively.
- **Operational Muted** (#5d655f) and **Sidebar Muted** (#b5bcb4): Supporting copy and metadata on their corresponding light or dark grounds.
- **Register Hover** (#2c322b) and **Register Selected** (#343b2d): Restrained row-state fields inside graphite navigation.

**The Acid Accountability Rule.** Acid is a signal, not a surface wash: use it for the primary action, current selection, connected state, focus, selection, and the small brand mark, never as a full-page background.

**The Bot Identity Rule.** Preserve the avatar color derived from the bot's name; the product accent does not replace bot identity colors.

## Typography

**Display Font:** Host system sans (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, then `sans-serif`)
**Body Font:** The same host system sans stack
**Label/Mono Font:** Keyboard hints alone use `ui-monospace, monospace`

**Character:** The implementation loads no external font and has no separate display face. Hierarchy comes from tight headlines, explicit weight changes, compact operational copy, and measured line lengths rather than a font pairing.

### Hierarchy
- **Display** (700, clamp(28px, 3vw, 40px), 1.06, -0.045em): Connection, empty-roster, and error headlines on the central sheet; balanced wrapping is enabled.
- **Bot Title** (700, 34px, 1.06, -0.045em): Selected bot identity on the bot sheet.
- **Navigation Title** (700, 13px): Bot names, document titles, and inspector headings.
- **Body** (400, 14px, 1.62): Sheet explanation and bot descriptions, capped at 55ch.
- **Supporting** (400, 12px, 1.5): Job-ticket explanation and inspector values; action help uses 12px at 1.45 with a 32ch cap.

**The Measured Line Rule.** Keep explanatory sheet copy within 55ch and action help within 32ch; bot-row names and metadata truncate with ellipsis rather than disturbing the register.

## Layout

The shell is a full-height grid (100vh, minimum 560px) with a 54px top bar and a remaining workspace row. At the widest implemented setting, a 236px bot register sits beside a fluid workspace with a 390px minimum; the optional inspector adds 280px, and the top bar spans both workspace and inspector. The workspace centers a sheet up to 660px wide inside 38px padding and a 32px registration grid.

At 1050px and below, the register becomes 216px, the workspace minimum becomes 360px, the inspector becomes 238px, workspace padding becomes 24px, the sheet index column narrows from 76px to 60px, and the sheet action area stacks. At 850px and below, the register becomes 210px, workspace padding becomes 20px, and both the inspector and its Details control are hidden so no inactive control remains visible. At 620px and below, the register becomes 176px, workspace padding becomes 12px, secondary title/edition metadata is hidden, and the sheet body becomes one column without its large index.

The spacing rhythm is compact rather than card-like: 8px and 12px handle local gaps, 16px and 20px handle chrome and control separation, and 24px, 30px, and 38px handle sheet and workspace composition.

## Elevation & Depth

The shell, navigation, top bar, and inspector are flat tonal fields separated by 1px rules. Only the central press sheet and modal search dialog lift above their grounds: the sheet uses a soft offset working-paper shadow, while search uses a deeper modal shadow over a translucent graphite overlay. There is no glass or backdrop blur.

### Shadow Vocabulary
- **Working Paper** (`box-shadow: 7px 9px 24px #2024211c`): The centered connection or bot sheet above the registration grid.
- **Modal Search** (`box-shadow: 0 16px 50px #0005`): The dark search dialog above the workspace overlay.

**The Flat Shell Rule.** Use rules and stock changes for ordinary structure; reserve shadows for the central sheet and modal search.

## Shapes

Press sheets, dialogs, navigation rows, and inspector fields are square. Controls and standard avatars use a small 4px radius; text buttons and the brand mark use 3px; the large bot avatar uses 5px. Status and completed-ticket dots are the only circular forms. Fine 1px borders and registration rules do more structural work than corner rounding.

## Components

### Primary Action
- **Shape:** Small-radius operational control (4px) with a 40px minimum height and 9px 15px padding.
- **Primary:** Graphite text on acid with a muted acid border; the arrow icon establishes forward action, replaced by a refresh icon while connecting.
- **States:** Hover darkens to acid hover; disabled controls switch to gray stock and text. The label changes across Connect, Connecting, Retry, and Refresh without adding a second competing action.
- **Focus / Motion:** The global focus treatment is a 2px acid outline with a 3px offset. Background and border transitions last 120ms when motion is allowed.

### Navigation and Bot Rows
- **Structure:** Full-width rows with 8px 13px padding, a 31px identity avatar, two-line bot copy, and an optional default marker. Names and secondary metadata stay single-line and truncate.
- **States:** Hover uses register hover stock; selection uses register selected stock plus a 3px acid left rule. Rows expose pressed state to assistive technology.
- **Behavior:** Selection comes from the backend-loaded bot list. The same row language appears in search results, with description or model metadata and an arrow icon.

### Connection and Bot Sheets
- **Shared Form:** Square sheet stock, a 1px outer border, working-paper shadow, dark registration header, and a maximum width of 660px.
- **Connection Sheet:** A numbered 76px index column introduces responsive state-specific copy; a ruled action area keeps the primary action and recovery guidance together. The bottom strip records loopback-only, token-safe-error, and backend-authoritative commitments as product copy, not independent verification claims.
- **Bot Sheet:** A 62px identity avatar, backend-provided profile copy, a ruled job ticket, and one disabled next-step action. The implemented ticket marks only “Profile loaded” complete; “Bot Chat” and “Reply” are not live stages.
- **Backend Truth:** Bot Chat, Group Chat, bot editing, and session creation are not implemented in this artifact. Empty, connecting, connected, and error presentations must not be read as working conversations or fabricated progress.

### Inspector
- **Form:** A flat 280px context column with 20px 18px padding and a 1px left rule; it narrows to 238px at the first breakpoint and disappears at 850px.
- **Content:** Definition-list rows use top rules and wrap long values anywhere. Service notes describe actual attach-only behavior; bot notes show profile name, model, provider, skill count, and the honest absence of a session.
- **State:** The Details control toggles the column at desktop widths and exposes its pressed state. At 850px and below, both the control and inspector are hidden together.

### Search Dialog
- **Form:** A square graphite dialog, at most 560px wide with a 40px viewport margin allowance, positioned 14vh from the top over a translucent dark overlay. Results scroll within a 350px maximum height.
- **Input:** The search field combines an inline SVG search icon, a borderless input with a visible acid focus outline, and an Escape hint. Opening the dialog focuses the input.
- **Behavior:** Cmd/Ctrl+K toggles search when bots exist, Escape closes it, clicking the overlay closes it, and choosing a result selects that bot and clears the query. Background regions are inert while open, Tab and Shift+Tab wrap within the dialog, and closing restores focus to the invoking control. No-match copy is explicit.

## Do's and Don'ts

### Do:
- **Do** use acid as a sparse action, selection, connection, or focus signal while preserving bot identity colors in avatars.
- **Do** build structure from flat stock, square sheets, fine registration rules, and the established compact spacing rhythm.
- **Do** keep empty, connecting, connected, error, and unavailable-workflow copy tied to real backend state and the next available action.
- **Do** gate interface motion behind `prefers-reduced-motion: no-preference` and keep keyboard focus visible.

### Don't:
- **Don't** add decorative gradient washes, glass, backdrop blur, ornamental illustrations, or a decorative card mosaic; the existing grid gradients are registration lines only.
- **Don't** invent bots, rooms, messages, sessions, live ticket stages, or chat progress beyond what the backend and implementation report.
- **Don't** generalize the incumbent 9–10px all-caps register labels into a microtype, kicker, or eyebrow system.
- **Don't** expose an inactive Details control below 850px; hide it with the inspector. Don't leave dialog background controls tabbable or lose focus to the invoking control on close.
