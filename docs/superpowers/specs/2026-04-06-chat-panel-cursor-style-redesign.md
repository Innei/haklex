# Chat Panel Cursor-style Flat Redesign

**Date:** 2026-04-06
**Scope:** `packages/rich-agent-chat` styles + minor demo CSS

## Goal

Align the AI chat panel with the demo's visual language and adopt a Cursor-inspired flat aesthetic. The current chat panel uses a card-style composer with rounded bubble messages that feel disconnected from the rest of the demo's clean, bordered-panel design.

## Changes

### 1. Composer (Input Area)

**File:** `packages/rich-agent-chat/src/styles.css.ts`

| Property                             | Current                        | New                                         |
| ------------------------------------ | ------------------------------ | ------------------------------------------- |
| `composerDock` padding               | `10px 18px 14px`               | `0` (no padding, border-top separates)      |
| `composerDock` border                | none                           | `borderTop: 1px solid ${vars.color.border}` |
| `composerBox` border                 | `1px solid border`             | none                                        |
| `composerBox` borderRadius           | `16`                           | `0`                                         |
| `composerBox` boxShadow              | `0 2px 8px rgba(0,0,0,0.06)`   | none                                        |
| `composerTextArea` padding           | `14px 16px 48px`               | `12px 16px 44px`                            |
| `composerBottomBar` position offsets | `bottom:10, left:10, right:10` | `bottom:8, left:12, right:12`               |
| `composerSendButton` size            | `30x30`                        | `28x28`                                     |
| `composerSendButton` borderRadius    | `50%`                          | `8px`                                       |
| `composerAbortButton` size           | `30x30`                        | `28x28`                                     |
| `composerAbortButton` borderRadius   | `50%`                          | `8px`                                       |

### 2. User Bubble

**File:** `packages/rich-agent-chat/src/styles.css.ts`

| Property                  | Current                      | New                        |
| ------------------------- | ---------------------------- | -------------------------- |
| `bubbleUser` background   | `vars.color.text` (inverted) | `vars.color.fillSecondary` |
| `bubbleUser` color        | `vars.color.bg`              | `vars.color.text`          |
| `bubbleUser` borderRadius | `18px 18px 6px 18px`         | `10px`                     |
| `bubbleUser` fontSize     | `14px`                       | `13px`                     |

No border — dark mode uses subtle color difference (`fillSecondary`) to distinguish from background.

### 3. Spacing & Typography Alignment

**File:** `packages/rich-agent-chat/src/styles.css.ts`

| Property                    | Current          | New    |
| --------------------------- | ---------------- | ------ |
| `chatPanel` fontSize        | `14px`           | `13px` |
| `messageList` padding       | `20px 18px 24px` | `16px` |
| `messageList` gap           | `20`             | `16`   |
| `proseAssistant` fontSize   | `14px`           | `13px` |
| `proseAssistant` lineHeight | `1.75`           | `1.7`  |

### 4. No Changes Required

- **Tool call rows** — already 13px, style is fine
- **Thinking chain** — consistent with tool call style
- **Diff review bubble** — border + rounded already matches demo panels
- **Error bubble** — minimal, no change needed
- **Model selector** — already 12px flat style
- **Demo CSS** (`.agent-pane-chat`) — no changes needed

## Non-Goals

- No structural/component changes — purely CSS token updates
- No new components or props
- No changes to chat logic, store, or message handling
