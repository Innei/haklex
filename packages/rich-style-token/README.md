# @haklex/rich-style-token

Design tokens, CSS variables, and variant presets for the Haklex rich editor theme system.

## Installation

```bash
pnpm add @haklex/rich-style-token
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |

## Usage

```tsx
import { createThemeStyle, articleTheme, vars } from '@haklex/rich-style-token'
import { PortalThemeProvider } from '@haklex/rich-style-token'

// Generate inline style object from a theme
const style = createThemeStyle(articleTheme)

// Use CSS variables in your styles
// vars.fontSize, vars.lineHeight, vars.fontFamily, etc.

// Provide portal theme context for overlays
<PortalThemeProvider theme="light" variant="article">
  {children}
</PortalThemeProvider>
```

## Exports

### Theme Construction

| Export | Description |
| --- | --- |
| `createThemeStyle(tokens)` | Generate a CSS variable style object from theme tokens |

### Context Providers

| Export | Description |
| --- | --- |
| `PortalContainerProvider` | Provide a custom portal container element |
| `usePortalContainer()` | Access the portal container element |
| `PortalThemeProvider` | Provide theme context for portaled overlays |
| `PortalThemeWrapper` | Wrapper element that applies theme variables |
| `usePortalTheme()` | Access the current portal theme |

### Design Tokens

| Export | Description |
| --- | --- |
| `articleLayout` | Layout tokens for the `article` variant (sans-serif, 16px) |
| `noteLayout` | Layout tokens for the `note` variant (CJK serif, 16px) |
| `commentLayout` | Layout tokens for the `comment` variant (sans-serif, 14px) |
| `darkColors` | Color tokens for dark mode |
| `lightArticleColors` | Color tokens for light article/note mode |
| `lightCommentColors` | Color tokens for light comment mode |
| `fonts` | Font family definitions |

### Theme Objects

| Export | Description |
| --- | --- |
| `articleTheme` | Complete theme for the `article` variant |
| `noteTheme` | Complete theme for the `note` variant |
| `commentTheme` | Complete theme for the `comment` variant |
| `vars` | Typed CSS variable references (use in Vanilla Extract styles) |

### Types

| Export | Description |
| --- | --- |
| `ThemeTokens` | Shape of a complete theme token set |
| `PortalTheme` | Portal theme descriptor |

### Sub-path Exports

| Import Path | Description |
| --- | --- |
| `@haklex/rich-style-token` | All tokens, themes, providers, and utilities |
| `@haklex/rich-style-token/styles` | Vanilla Extract style definitions |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
