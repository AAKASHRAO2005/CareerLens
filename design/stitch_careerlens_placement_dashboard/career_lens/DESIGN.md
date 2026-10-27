---
name: Career Lens
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style

This design system embodies structured productivity, combining the razor-sharp functional clarity of Linear with the serene, spatial calm of Notion. It is crafted for ambitious job seekers and university students managing high-stakes recruiting pipelines. 

The aesthetic is minimalist, modern, and information-dense without feeling overwhelming. The visual language conveys order, competence, and forward momentum. Every element sits on an intentional grid, prioritizing legibility, rapid data scanning, and micro-delight through crisp transitions and tactile borders.

Key qualities:
- **Atmospheric Clarity**: Soft off-white to slate canvases establish a calm, focused backdrop for dense application boards, interview schedules, and career roadmaps.
- **Precision Engineering**: 1px hairline dividers, precise typography scales, and geometric layouts replace heavy fills and aggressive elevation.
- **Purposeful Color Shifts**: High-contrast, vibrant functional accents highlight pipeline milestones, keeping status updates immediately legible.

## Colors

The palette is rooted in cold slates and balanced neutrals, energized by a focused set of semantic tokens:

### Surfaces & Backgrounds
- Canvas Background: `#f8fafc` (Slate 50) transitioning to `#f1f5f9` (Slate 100) for nested regions and sidebar wells.
- Elevated Surfaces: `#ffffff` for floating modals, kanban cards, and interactive rows.
- Surface Borders: `#e2e8f0` (Slate 200) for primary structural hairlines; `#cbd5e1` (Slate 300) for interactive control borders.

### Typography & Content
- Primary Text: `#0f172a` (Slate 900) — high-contrast headlines and active metrics.
- Secondary Text: `#334155` (Slate 700) — body copy, labels, and regular interface text.
- Muted/Metadata Text: `#64748b` (Slate 500) — timestamps, placeholders, keyboard shortcuts, and table captions.

### Accents & Semantics
- Primary Accent: `#4f46e5` (Indigo 600) with `#6366f1` (Indigo 500) hover state — reserved for focal call-to-actions, active pipeline stages, and primary controls.
- Success & Offers: `#10b981` (Emerald 500) — accepted applications, received offers, completed stages.
- Warning & Interviewing: `#f59e0b` (Amber 500) — pending assessments, upcoming rounds, urgent deadlines.
- Critical & Rejection: `#ef4444` (Rose 500) — rejections, withdrawn candidacies, destructive actions.

## Typography

Inter powers all typographical layers, leveraging its precise tracking and open aperture to ensure data-dense screens remain legible. 

- **Display & Headlines**: Tightly tracked (`-0.02em` to `-0.025em`) with medium-to-semibold weights, keeping larger sizes compact and structural.
- **Body Text**: Relaxed letter spacing at 13px and 14px sizes to support sustained reading across resumes, job descriptions, and interview notes.
- **Labels & Microcopy**: Medium weights (`500`) with neutral to slightly expanded tracking for badges, table column headers, and breadcrumb markers.
- **Numerical Alignment**: Use tabular numerals (`tnum`, `font-variant-numeric: tabular-nums`) across pipeline counts, compensation metrics, and dates to preserve column verticality.

## Layout & Spacing

The layout is built on a 4px/8px incremental grid. Density balances high productivity with breathing room.

### Layout Model
- **Application Shell**: Sticky horizontal command bar (56px) and collapsible left navigation sidebar (240px wide).
- **Workspace Layout**: Fluid kanban and multi-column dashboard layouts. Boards utilize horizontal scroll containers with auto-snapping columns (280px minimum width).
- **Content Max-Width**: Focused article, application detail, or resume editor panels constrain readable content to a maximum width of `768px` within the expansive workspace canvas.

### Breakpoints & Adaptive Reflow
- **Mobile (< 768px)**: 1-column layout, bottom navigation bar replacing the sidebar, edge margins collapse to `margin` (1rem), kanban boards transform into vertical accordion views or tab-filtered lists.
- **Tablet (768px - 1024px)**: Collapsed icon-only sidebar, 2-column dashboard grids, `margin-md` (1.5rem).
- **Desktop (> 1024px)**: Multi-column kanban or detailed 3-panel split views (Navigation - Application List - Stage Detail Drawer).

## Elevation & Depth

Depth is established primarily through crisp 1px borders and subtle, ultra-soft drop shadows. Avoid aggressive, blurry elevations or colored glow effects.

- **Level 0 (Canvas Base)**: Flat `#f8fafc` background. Nested section dividers utilize 1px solid `#e2e8f0`.
- **Level 1 (Surface Cards & Kanban Columns)**: `#ffffff` surface, bounded by a 1px solid `#e2e8f0` border, paired with an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hover State & Interactive Cards)**: Applied when dragging cards or hovering list items: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`, border shifts subtly to `#cbd5e1`.
- **Level 3 (Dropdowns & Popovers)**: Bounded by 1px solid `#e2e8f0`, backed with `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modals & Overlays)**: `#ffffff` surface, backdrop blur of `4px` with a `#0f172a` 20% alpha underlay, card elevation of `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The geometric signature uses tight, measured radii reflecting modern productivity tools:

- **Interactive Controls (Inputs, Buttons, Badges)**: 6px border radius (`0.375rem`) for compact, surgical precision.
- **Cards & Data Containers**: 8px border radius (`0.5rem`) balancing structured grid alignment with softened boundaries.
- **Large Panels & Dialogs**: 12px border radius (`0.75rem`) for high-level modals and overlay sheets.
- **Status Pills**: Fully rounded pill shapes (`9999px`) are strictly reserved for status indicator tags and avatar frames to contrast against rectangular geometry.

## Components

### Buttons
- **Primary**: Background `#4f46e5`, text `#ffffff`, height 36px (medium) / 32px (small). Hover: `#4338ca`. Active: scale transform down to `0.98`. Focus ring: 2px offset with `#6366f1` ring.
- **Secondary / Outline**: Background `#ffffff`, text `#334155`, border 1px solid `#e2e8f0`. Hover: background `#f8fafc`, text `#0f172a`, border `#cbd5e1`.
- **Ghost**: Transparent background, text `#64748b`. Hover: background `#f1f5f9`, text `#0f172a`.

### Status Badges & Chips
- Crisp 20px height, 11px font size, medium weight, padded `space-xs` vertically and `space-sm` horizontally.
- **Offer / Accepted**: Background `#ecfdf5`, border 1px solid `#a7f3d0`, text `#065f46`, leading 6px dot `#10b981`.
- **Interview / In-Progress**: Background `#fffbeb`, border 1px solid `#fde68a`, text `#92400e`, leading 6px dot `#f59e0b`.
- **Rejected**: Background `#fef2f2`, border 1px solid `#fecaca`, text `#991b1b`, leading 6px dot `#ef4444`.
- **Neutral / Draft**: Background `#f1f5f9`, border 1px solid `#e2e8f0`, text `#475569`.

### Kanban Application Cards
- Surface `#ffffff`, border 1px solid `#e2e8f0`, radius 8px, padding `space-md`.
- Top row: Company favicon or initials badge (24x24px, rounded 4px) paired with title; bottom row: stage badge and salary/applied date metadata.
- Transition: 150ms ease-out on box-shadow and border color during cursor hover.

### Inputs & Form Fields
- Height 36px, background `#ffffff`, border 1px solid `#cbd5e1`, radius 6px, padding horizontal 12px, font size 14px.
- Focus: Border color `#4f46e5`, box-shadow `0 0 0 1px #4f46e5`.
- Placeholder text: `#94a3b8`.

### Checkboxes & Radios
- Size 16x16px, border 1px solid `#cbd5e1`, radius 4px (checkbox) / 50% (radio).
- Checked state: Background `#4f46e5`, border `#4f46e5`, inner white checkmark icon.

### Application Pipeline Stages (Linear-Style Progress)
- Breadcrumb-style segmented pipeline indicator.
- Chevron dividers using `#cbd5e1`, inactive stages in `#64748b`, current stage in `#0f172a` with an indigo underline dot indicator.