# Overlay Unification — Design

Date: 2026-10-29
Status: approved (artboard review)
Artboard: https://claude.ai/artifact/CpheJq6toDMGzzJ16x3EHR

Every floating surface the editor shows — popovers, dropdowns, typeahead menus, node toolbars, dialogs, sheets — moves onto one skeleton. The artboard has a "now" and "next" board per area; this document records what the "next" boards decided. Copy stays English (no i18n in this pass).

## A. Foundation (`@haklex/rich-style-token`, `@haklex/rich-editor-ui`)

- **Widths.** `chromeWidth = { sm: 280, md: 320, lg: 400 }` (px). S for single-field popovers (ruby, mention, file name), M for links, inspectors, color, L for KaTeX, chart config, dynamic.
- **Surface.** Every popup: radius `chromeRadius.lg` (12), `bgElevated`, `boxShadow.menu`, side offset 8. Modals use `boxShadow.modal`. No other radius on a popup surface; controls inside use `md` (8) or `sm` (4).
- **Chrome font.** Overlays always use the system sans chrome font (`fontFamilySans` + `chromeTypography`), never the content font, so the note variant stays sans.
- **One text input.** `TextInput` primitive: 28px, radius 8, `bg`, `xs` ring, focus ring, `aria-invalid` → caution ring. `Field` wraps a visible `label` (12/500, `textSecondary`), the control, and optional hint / error text (error in caution color).
- **One button system.** `ActionButton` only (24/28/32, radius 8). Primary = `solid`.
- **Popover anatomy.** `PopoverHeader` (44px: icon, title 13/600, trailing actions), `PopoverBody` (padding 12, gap 12), `PopoverFooter` (hint left, actions right, top border).
- **Close semantics.**
  | Kind                                                               | Applies when   | Enter        | Esc                        | Outside click |
  | ------------------------------------------------------------------ | -------------- | ------------ | -------------------------- | ------------- |
  | Inline field (S)                                                   | on commit      | save + close | revert + close             | save          |
  | Inspector (M/L)                                                    | live, undoable | —            | revert changes since open  | keep          |
  | Modal                                                              | on Save        | ⌘↵ / ⌘S save | dirty → "Discard changes?" | same as Esc   |
  | KaTeX is a popover that follows the Modal row (explicit Save, ⌘↵). |
- **Toast.** One stack (`toast()` + `ToastViewport`), bottom center, `role="status"`, optional action (e.g. Retry, Undo). Image / video / file upload and paste feedback use it.
- **Dialog width.** `presentDialog` accepts `width` (px or token); the popup reads it from `--rc-dialog-width` so a consumer width is never capped by the 28rem default (fixes image upload rendering at 448 instead of 560).
- **Discard guard.** `presentDialog` accepts `confirmDismiss?: () => boolean | Promise<boolean>`; dirty editors return a confirm ("Discard changes?" / "Your edits haven't been saved." / Keep editing · Discard).

## B. Selection toolbar, color, ruby

- Floating toolbar groups: marks (B I U S) | inline (code, highlight, spoiler) | link · ruby | color | overflow `…` (superscript, subscript, clear formatting) | host slot (Ask AI with label). Surface radius 12, buttons 28/radius 8, icons 16, active = `fill` only (no underline).
- Real Tooltip with shortcut on every button. Buttons activate on click (Enter/Space work); Tab reaches the toolbar, ←/→ move.
- Positioned with flip + shift: below the selection when there is no room above.
- Link (⌘K) morphs the same toolbar into a URL input (prefilled from clipboard if it is a URL); Save ↵ / Esc returns to formatting. Ruby uses the same inline-input mode, English copy ("Reading"), Remove in danger tone, no colored confirm buttons. Clicking an existing ruby opens it.
- Color picker: Text | Background segmented; theme-token presets that adapt to dark mode; "Default" swatch drawn half text/half bg; recent colors; Custom… keeps the existing custom view. Background color applies a highlight style.

## C. Inline value popovers

- Link view (M): favicon/host + title/URL, then a row: `Link | Card` segmented, Open, Copy, Edit, Remove (danger). Replaces "To Card" / "To Link" buttons.
- Link edit: `Text` and `URL` fields, Cancel / Save ↵. Inline-field semantics. Popover flips.
- Link card opens on click, never hover; same view as a link with `Card` selected.
- Mention typeahead: `@query` lists one row per platform ("innei · GitHub") — no platform codes needed. Mention edit popover: platform segmented, Handle, Display name fields.

## D. Menus

- One command registry feeds block menu "Turn into", toolbar insert menu and slash menu: same names (sentence case: Text, Heading 1–3, Bulleted list, Numbered list, To-do list, Quote, Code block, Callout, Divider, Math block), same icons, same groups.
- Block menu: Turn into ▸ (submenu, current type checked; Divider not in it), Color ▸ (optional), Duplicate ⌘D, Copy link to block (when host supports), Move up/down, Delete ⌫ last.
- Toolbar "+" shows the slash list with a search field, sections and descriptions.
- Slash menu: Title-case section labels; zero results shows a "No blocks match" row with "Esc keep as text" instead of vanishing; distinct icons per type.

## E. Node inspectors

- Node toolbars appear when the node is selected (click / keyboard), not only on hover; grouped; tooltips.
- Image toolbar: size (opens inspector) | align/wrap | Alt · Replace | `…` (Duplicate, Open original, Download, Delete).
- Inspector template (M/L): header icon + node name + `…` menu, labeled fields, footer hint "Changes apply as you type · Esc revert". Live apply. Applies to image details/size, video, file, link card, mention, dynamic.
- KaTeX (L): header with `Edit | Snippets` segmented + `…` (delete), labeled LaTeX field, preview, footer char count + Cancel / Save ⌘↵. All text ≥ 12px.
- Delete never confirms; it is undoable and shows an Undo toast.

## F. Image insertion

- One dialog (520) replaces the upload dialog, insert sheet and replace popover. Step 1: drop zone (Choose files, "or press ⌘V to paste" on its own line below) + Image URL field that previews as you paste, Add. Step 2 in the same dialog: review rows (thumb, name, meta, Edited tag, per-row location checkbox via the Checkbox primitive in warn tone, Edit, remove), Add more, footer Back / Insert n images ⌘↵. Replace reuses it titled "Replace image", single file. Upload progress goes to the toast. `sheet: 'auto'` below 640px.

## G. Editor modals

- One `ModalShell`: header 48 (icon, title, center slot, secondary actions / `…`, close X), body, footer 52 (status left: dirty dot, counts; Cancel / Save ⌘S ⌘↵ right).
- Dirty Esc / X / backdrop → Discard guard. Clean close just closes. X never saves (fixes Code snippet), Esc never leaves an empty node (Chat).
- Mermaid templates confirm before overwriting; Excalidraw storage modes move into `…` → Advanced; Gallery "Add images" opens a file picker.
- `sheet: 'auto'`: below 640px modals become full-height sheets; split panes become tabs.

## H. Table and AI review

- Fix: column insert actions insert columns.
- Handles 20×20 with aria-labels, follow the focused cell (keyboard reachable), click opens the menu. Row menu: Insert above/below, Header row toggle, Delete row. Column menu: Insert left/right, Header column toggle, Delete column. Append bars after the last row / column. Resizer uses accent token.
- AI review: hunk actions in a right gutter (Reject left, Accept right everywhere, chat bubble included); review bar with ‹ n / total › navigation, ⌘⌫ reject, ⌘↵ accept, ⌥↑/⌥↓ jump, "All…" for bulk.

## Non-goals

- i18n, new block types, downstream (Yohaku / mx-core) changes. Public component props stay backward compatible; new options are additive.
