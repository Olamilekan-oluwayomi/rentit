# RentIt Design System

A scalable, component-driven design system for RentIt, a peer-to-peer rental marketplace.

Built with **React**, **Tailwind CSS v4**, and custom design tokens defined in `src/index.css`.

---

## Principles

- **Warm & tactile** — paper surfaces, ink text, rust accents, sage tags
- **Spacious** — generous whitespace, clear hierarchy
- **Minimal** — no decorative clutter, purposeful motion
- **Accessible** — keyboard navigation, proper ARIA, focus rings
- **Mobile-first** — responsive primitives from the ground up
- **One source of truth** — every component consumes CSS custom properties from `@theme` in `index.css`

---

## Tokens

All colors, fonts, radii, shadows, and durations come from the `@theme` block in `src/index.css`.

| Token              | CSS Variable              | Value (light) |
|--------------------|---------------------------|---------------|
| Accent (rust)      | `--color-accent`          | `#C4531D`     |
| Sage               | `--color-sage`            | `#6B7A5E`     |
| Background         | `--color-background`      | `#F7F4EE`     |
| Surface            | `--color-surface`         | `#FFFFFF`     |
| Text primary       | `--color-text-primary`    | `#1C1B19`     |
| Heading font       | `--font-heading`          | Barlow Condensed |
| Body font          | `--font-body`             | Inter         |
| Mono font          | `--font-mono`             | IBM Plex Mono |

Dark mode overrides are handled automatically via `.dark` class on `<html>`.

---

## Components

### Button

**Purpose:** Triggers actions. Supports multiple visual styles and sizes.

**Props:**

| Prop       | Type       | Default     | Description                        |
|------------|------------|-------------|------------------------------------|
| variant    | string     | `primary`   | `primary` `secondary` `ghost` `outline` `danger` |
| size       | string     | `md`        | `sm` `md` `lg`                     |
| loading    | boolean    | `false`     | Shows a spinner, disables button   |
| disabled   | boolean    | `false`     | Grays out, prevents interaction    |
| fullWidth  | boolean    | `false`     | Stretches to container width       |
| leftIcon   | component  | —           | Icon component rendered before text |
| rightIcon  | component  | —           | Icon component rendered after text  |

**Examples:**
```jsx
<Button variant="primary">Rent Now</Button>
<Button variant="secondary" size="sm">Filter</Button>
<Button variant="danger" loading>Delete</Button>
<Button leftIcon={Plus}>New Listing</Button>
<Button variant="outline" fullWidth>Cancel</Button>
```

**Accessibility:**
- Buttons are `<button>` elements with proper `disabled` attribute
- Loading state uses `aria-hidden="true"` on the spinner
- Focus ring uses `--color-accent` with offset for high contrast

---

### Input

**Purpose:** Text entry fields for forms, search, and data input.

**Props:**

| Prop         | Type       | Default     | Description                        |
|--------------|------------|-------------|------------------------------------|
| type         | string     | `text`      | `text` `search` `email` `password` `number` `textarea` |
| label        | string     | —           | Visible label above the input      |
| helperText   | string     | —           | Hint text below the input          |
| error        | string     | —           | Error message (replaces helper, turns border red) |
| leadingIcon  | component  | —           | Icon inside left side of input     |
| trailingIcon | component  | —           | Icon inside right side of input    |
| disabled     | boolean    | `false`     | Grays out, prevents interaction    |

**Examples:**
```jsx
<Input label="Email" type="email" placeholder="you@example.com" />
<Input type="search" leadingIcon={Search} placeholder="Search rentals..." />
<Input label="Price" type="number" error="Must be a positive number" />
<Input type="textarea" rows={4} placeholder="Describe your item..." />
```

**Accessibility:**
- Uses `useId()` to generate unique label/input associations
- Error state uses `aria-invalid`, `role="alert"`, and `aria-describedby`
- Disabled state prevents interaction

---

### Card

**Purpose:** Content container with optional header, body, and footer. Generic — not opinionated about listing data.

**Variants:**

| Variant     | Description                          |
|-------------|--------------------------------------|
| `default`   | Surface background, border, small shadow |
| `outlined`  | Thicker border, no shadow            |
| `interactive` | Hover lift effect + shadow increase |
| `elevated`  | Medium shadow for visual depth       |

**Sub-components:** `CardHeader`, `CardBody`, `CardFooter`

```jsx
<Card variant="interactive">
  <CardHeader><h2>Title</h2></CardHeader>
  <CardBody><p>Content here</p></CardBody>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>
```

**Accessibility:**
- Cards are plain `<div>` elements; interactive cards use `cursor-pointer` but require custom `onClick`/`role` for actionable cards

---

### Badge

**Purpose:** Inline status indicator or label.

**Variants:** `success`, `warning`, `danger`, `neutral`, `accent`, `sage`

```jsx
<Badge variant="success">Approved</Badge>
<Badge variant="sage">Tools</Badge>
<Badge variant="accent">Featured</Badge>
```

**Accessibility:**
- Rendered as `<span>` with semantic color via CSS, not emoji
- Use `aria-label` for extra context if needed

---

### Chip

**Purpose:** Filter, tag, or category pill. Removable when `onRemove` is provided.

**Props:**

| Prop     | Type       | Default | Description                  |
|----------|------------|---------|------------------------------|
| selected | boolean    | `false` | Rust highlight when active   |
| onRemove | function   | —       | Shows X icon, calls on click |
| onClick  | function   | —       | Makes chip clickable as button |

```jsx
<Chip selected>Power Tools</Chip>
<Chip onRemove={() => {}}>Category: Drills</Chip>
<Chip onClick={() => setFilter(cat)}>All</Chip>
```

**Accessibility:**
- Rendered as `<button>` when `onClick` is provided, `<span>` otherwise
- Dismiss button uses `stopPropagation` to prevent chip click

---

### Avatar

**Purpose:** User avatar with image, initials fallback, and status dot.

**Sizes:** `sm` `md` `lg` `xl` `2xl`

**Props:**

| Prop   | Type    | Default | Description                   |
|--------|---------|---------|-------------------------------|
| src    | string  | —       | Image URL                     |
| alt    | string  | —       | Alt text for image            |
| name   | string  | —       | Full name for initials        |
| size   | string  | `md`    | Avatar dimensions             |
| status | string  | —       | `online` `away` `busy` `offline` |

```jsx
<Avatar src="/user.jpg" name="Jane Doe" size="xl" />
<Avatar name="John Smith" status="online" />
<Avatar name="?" size="sm" />
```

**Accessibility:**
- Image has proper `alt` text derived from `alt` or `name`
- Status dot has `aria-label`
- Initials are `select-none` to prevent text selection

---

### Container

**Purpose:** Max-width centered wrapper with responsive padding.

```jsx
<Container>
  <p>Page content is nicely constrained.</p>
</Container>
```

**Accessibility:**
- Plain `<div>` — no semantic impact

---

### Section

**Purpose:** Consistent vertical section with optional title, subtitle, and action slot.

```jsx
<Section
  title="My Listings"
  subtitle="Manage your rental items"
  action={<Button size="sm">Add New</Button>}
>
  {/* Section content */}
</Section>
```

---

### Divider

**Purpose:** Visual separator. Supports `horizontal` (default) and `vertical` orientations.

```jsx
<Divider />
<Divider orientation="vertical" className="h-8" />
```

**Accessibility:**
- Uses `<hr>` with `role="separator"` and `aria-orientation`

---

### IconButton

**Purpose:** Compact icon-only button for toolbars, toggles, and actions.

**Sizes:** `sm` `md` `lg`

**Props:**

| Prop   | Type       | Default | Description                   |
|--------|------------|---------|-------------------------------|
| icon   | component  | —       | Icon component (e.g. from lucide-react) |
| label  | string     | required | Accessible label             |
| size   | string     | `md`    | `sm` `md` `lg`               |
| active | boolean    | `false` | Highlighted state            |

```jsx
<IconButton icon={Sun} label="Toggle theme" onClick={toggleTheme} />
<IconButton icon={X} label="Close" size="sm" />
<IconButton icon={Bell} label="Notifications" active={hasUnread} />
```

**Accessibility:**
- Requires `label` prop which becomes `aria-label`
- `<button>` element with proper focus ring

---

### EmptyState

**Purpose:** Placeholder content when lists or searches return no results.

**Props:**

| Prop        | Type       | Description                   |
|-------------|------------|-------------------------------|
| icon        | component  | Large icon in circle          |
| title       | string     | Heading text                  |
| description | string     | Body text                     |
| action      | ReactNode  | Button or link to resolve     |

```jsx
<EmptyState
  icon={Search}
  title="No results found"
  description="Try adjusting your search or filter criteria."
  action={<Button variant="outline">Clear Filters</Button>}
/>
```

---

### Skeleton

**Purpose:** Loading placeholder that mirrors content layout.

**Variants:**
- `Skeleton` — base block
- `CardSkeleton` — mimics a listing card
- `AvatarSkeleton` — circular placeholder
- `TextSkeleton` — multi-line text
- `GridSkeleton` — responsive grid of card skeletons

```jsx
<GridSkeleton count={8} />
<TextSkeleton lines={4} />
<AvatarSkeleton size="xl" />
```

**Accessibility:**
- All skeletons have `aria-hidden="true"` so screen readers ignore them
- Use `role="status"` on a wrapper with `aria-live="polite"` if announcing loading

---

## Composition over props

These primitives favor composition. For example, rather than a single `Card` component with 20 props, use `CardHeader`, `CardBody`, and `CardFooter` sub-components. Rather than `EmptyState` taking an `actionLabel` + `actionTo`, it takes a full ReactNode `action` slot.

## Usage guidelines

1. **No new tokens** — Use only the CSS custom properties defined in `@theme` in index.css
2. **No new dependencies** — Built with React + Tailwind only (lucide-react already in the project)
3. **Dark mode works automatically** — CSS variables in `.dark` override in index.css
4. **Accessibility first** — Every component has keyboard support, ARIA attributes, and focus styles
