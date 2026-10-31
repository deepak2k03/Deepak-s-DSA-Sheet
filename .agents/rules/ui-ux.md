---
description: UI/UX design rules, CSS variables, dark/light theme tokens, responsive layouts, and modals
globs: client/src/**/*.{tsx,css}
---

# UI & UX Design Rules

These rules govern styling, responsiveness, theme adherence, and interaction design.

## 1. Design Token System
- Always style using CSS custom properties defined in `client/src/index.css`:
  - Surfaces: `var(--bg-base)`, `var(--bg-canvas)`, `var(--bg-surface)`, `var(--bg-surface-muted)`
  - Typography: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`
  - Borders: `var(--border-subtle)`, `var(--border-default)`, `var(--border-strong)`
  - Accents: `var(--accent)`, `var(--accent-surface)`, `var(--accent-text)`
- Never introduce hardcoded white/black backgrounds (`bg-white` or `bg-black`) without explicit dark mode variants (e.g. `bg-white dark:bg-[#101614]`).

## 2. Responsive Multi-Column Layouts
- High-density admin screens (like `AdminProblemsTab.tsx`) should utilize a 2-column layout on desktop:
  - Left column (`300px` to `320px`): Collapsible categorized sidebar / explorer with search.
  - Right column (`minmax(0, 1fr)`): Management view, action hero banner, search/filter bar, and data table.
- On mobile/tablet screens (`< lg`), stack the columns cleanly with full width.

## 3. Modals & Portals
- Implement modal overlays using `createPortal(..., document.body)`.
- Modals must include:
  - Backdrop blur with click-outside-to-dismiss behavior (when not actively saving).
  - Explicit header with icon and close (`X`) button.
  - Form validation with inline error callouts.
  - Distinct Primary (Save/Create) and Secondary (Cancel) action buttons.

## 4. Loading States & Empty States
- Always show a spinner or skeleton loader during async data fetches.
- Never display an empty white container.
- Always provide an empty state card with:
  - A friendly icon.
  - Clear message ("No problems found matching the selected filters").
  - An actionable recovery button ("Clear Filters", "Add Problem", or "Choose Another Topic").

## 5. Visualizer Frames
- `VisualizerFrame.tsx` must sandbox the animation iframe.
- Provide a loading indicator while the HTML bundle streams from R2/backend.
- Support fullscreen mode and responsive 16:9 / height-adaptive containers.

