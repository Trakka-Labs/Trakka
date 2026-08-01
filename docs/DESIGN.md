---
name: Kinetic Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001e2c'
  on-tertiary-container: '#008ebf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for the high-stakes world of global logistics and supply chain management. It embodies **Professionalism, Reliability, and Efficiency**. The visual language is "Enterprise-Grade Modern," striking a balance between the industrial strength of global shipping and the precision of advanced data analytics.

The aesthetic utilizes a refined **Corporate / Modern** style. It favors clarity over decoration, using ample whitespace and structural alignment to reduce cognitive load for users managing complex datasets. The emotional response should be one of "command and control"—providing the user with a sense of absolute oversight and stability through a clean, systematic interface.

## Colors

The palette is anchored by **Deep Navy (#0F172A)**, chosen to evoke the traditional trust and authority of established global institutions. This is contrasted by **Logistics Orange (#F97316)**, a high-visibility accent color used exclusively for primary actions, critical alerts, and movement indicators.

**Cool Gray Neutrals** (based on Slate and Blue-Gray scales) provide depth to the background and define the structural boundaries of the UI without the harshness of pure black. A **Tertiary Sky Blue (#38BDF8)** is used for data visualization and secondary information markers, representing technology and "blue-sky" thinking in logistics optimization.

## Typography

This design system utilizes **Inter** as its primary typeface due to its exceptional legibility at small sizes and its neutral, systematic character. It ensures that complex shipping manifests and tracking numbers remain readable under all conditions.

To emphasize the technical nature of logistics data, **JetBrains Mono** is introduced for labels, tracking IDs, and tabular data. This monospaced secondary font provides a clear visual distinction between narrative text and actionable data points.

Headlines should use tight letter-spacing and bold weights to convey strength. Body copy maintains standard spacing to maximize reading endurance.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop, optimized for a maximum width of 1440px to ensure data density doesn't become overwhelming on ultra-wide monitors. On mobile devices, the layout transitions to a single-column stack with 16px side margins.

A **4px baseline grid** governs all vertical rhythm. Spacing between major sections (e.g., dashboard widgets) should use `xl` (40px) to provide clear visual separation. Data-heavy tables and forms should use `sm` (8px) and `md` (16px) padding to maintain high information density while preserving touch-target accessibility.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** to create depth. Heavy shadows are avoided to maintain a clean, professional "SaaS" aesthetic.

1.  **Level 0 (Canvas):** The base background layer (#F8FAFC).
2.  **Level 1 (Cards/Sections):** White surfaces with a 1px border (#E2E8F0). These represent the primary workspace.
3.  **Level 2 (Dropdowns/Modals):** White surfaces with a soft, diffused ambient shadow (10% opacity Deep Navy) to indicate temporary overlay.

Depth is also communicated through "Status Accents"—thin 2px vertical strokes on the left edge of cards to indicate priority or status (e.g., Orange for "In Transit," Green for "Delivered").

## Shapes

The design system adopts a **Soft (Level 1)** roundedness profile. A 4px (0.25rem) radius is the standard for buttons and input fields, reflecting an industrial, precise feel.

Larger containers, such as dashboard cards and feature blocks, utilize an 8px (0.5rem) radius to soften the enterprise environment slightly, making it feel more modern and approachable. Icons should follow a consistent 2px stroke weight with slightly rounded joins to match the UI components.

## Components

**Buttons:**
- *Primary:* Solid Logistics Orange with white text. High-contrast, sharp corners (4px).
- *Secondary:* Deep Navy outline with Navy text. Used for secondary actions like "Export" or "View Details."

**Cards:**
- Clean white containers with 1px border. No heavy shadows.
- Hero sections in the dashboard should use a Deep Navy background with white text and Orange accents.

**Inputs & Search:**
- High-contrast 1px borders (#CBD5E1).
- Active state uses a 2px Deep Navy border.
- Search bars should be prominent, often spanning 6-8 columns in dashboard headers.

**Data-Driven Dashboard Elements:**
- **Status Chips:** Use a "Pastel-on-Dark" approach (e.g., a light orange background with dark orange text) for quick scanning of shipment statuses.
- **Progress Bars:** Thin, 4px height bars using Tertiary Blue for progress and Orange for bottlenecks.

**Visuals:**
- Photography must be realistic and high-resolution.
- Images should be treated with a subtle cool-tone overlay to ensure they sit harmoniously behind Deep Navy UI elements.
- Avoid generic "tech" stock photos; prioritize images showing tangible assets like cargo planes, container ships, and clean warehouse floors.
