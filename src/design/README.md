# RentIt Design System

A component-driven design system built with **React**, **Tailwind CSS v4**, and custom design tokens defined in `src/index.css`.

All components are re-exported from `src/design/index.js`.

## Available Components

| Component | Description |
|-----------|-------------|
| `Avatar` | User avatar with image, initials fallback, and optional status dot. Sizes: `sm` `md` `lg` `xl` `2xl`. |
| `Badge` | Inline status indicator. Variants: `success` `warning` `danger` `neutral` `accent` `sage`. |
| `Button` | Action trigger. Variants: `primary` `secondary` `ghost` `outline` `danger`. Sizes: `sm` `md` `lg`. Supports `loading`, `fullWidth`, `leftIcon`, `rightIcon`. |
| `Card` | Content container. Variants: `default` `outlined` `interactive` `elevated`. Sub-components: `CardHeader`, `CardBody`, `CardFooter`. |
| `Chip` | Filter/tag pill. Supports `selected`, `onRemove` (shows X), `onClick`. |
| `Container` | Max-width centered wrapper with responsive padding. |
| `Divider` | Visual separator. Supports `horizontal` (default) and `vertical`. |
| `EmptyState` | Placeholder for empty lists or search results. Props: `icon`, `title`, `description`, `action` (ReactNode slot). |
| `IconButton` | Compact icon-only button. Requires `label` (aria-label). Sizes: `sm` `md` `lg`. Supports `active` state. |
| `Input` | Text entry fields. Types: `text` `search` `email` `password` `number` `textarea`. Props: `label`, `helperText`, `error`, `leadingIcon`, `trailingIcon`. |
| `Section` | Vertical section with optional `title`, `subtitle`, and `action` slot. |
| `Skeleton` | Loading placeholders. Variants: `Skeleton` (base), `CardSkeleton`, `AvatarSkeleton`, `TextSkeleton`, `GridSkeleton`. All `aria-hidden="true"`. |
| `StarRating` | Interactive star rating input. |
| `Typography` | `Heading` and `Text` components with semantic tag mapping. |

## Design Tokens Philosophy

Tokens are defined as CSS custom properties in the `@theme` block of `src/index.css`:

- **Surface** — `--color-surface` (white), `--color-surface-secondary`, `--color-surface-tertiary`
- **Accent** — `--color-accent` (rust `#C4531D`), used for primary actions and highlights
- **Danger** — `--color-danger`, used for destructive actions and error states
- **Text** — `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- **Border** — `--color-border`, used for dividers and card outlines

Dark mode is handled automatically by the `.dark` class on `<html>`.

## Best Practices

1. **No new tokens** — Use only the CSS custom properties from `@theme` in `index.css`.
2. **No new dependencies** — Built with React + Tailwind only. `lucide-react` is already available for icons.
3. **Composition over props** — Use sub-components (e.g. `CardHeader`, `CardBody`) instead of a single component with dozens of props.
4. **Accessibility first** — Every component has keyboard support, ARIA attributes, and focus styles.
5. **Import from `src/design`** — Use `import { Button, Card } from "../../design"` rather than deep imports.
