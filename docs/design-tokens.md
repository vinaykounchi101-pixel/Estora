# Real Estate Price Prediction — Design Tokens
Version: 1.0
Purpose: Shared visual design system for the entire web application.

## 1. Design Direction

Create a premium, editorial real-estate analytics product: understated luxury, warm neutral surfaces, architectural imagery, restrained sage/olive accents, refined typography, and clear data visualization.

The interface must feel trustworthy and sophisticated—not like a generic admin template. Keep marketing pages spacious and image-led; keep prediction forms focused; make results and analytics precise and readable.

Reference direction: the supplied premium real-estate website UI concept and Dribbble “Real Estate Website Template” by Sajibur Rahman / Oripio. Use as visual inspiration, not as a pixel-for-pixel copy.

## 2. Color Tokens

Use semantic tokens in components. Avoid hardcoding hex values inside individual components.

### Core palette
- `canvas`: `#F2F2F0` — app/page background
- `surface`: `#FBFAF7` — cards and elevated content
- `surface-muted`: `#EAEAE4` — secondary panels and subtle fills
- `ink`: `#0F0F09` — primary text and dark surfaces
- `ink-soft`: `#585E5F` — secondary text
- `sage`: `#C4CEB8` — soft accent and selected states
- `sage-deep`: `#78866F` — accessible sage for emphasis
- `olive`: `#453F22` — brand accent, active states, chart series
- `warm-brown`: `#8D7658` — secondary accent
- `blue-gray`: `#9EA9B2` — neutral chart series
- `border`: `#DEDED6` — borders and separators
- `white`: `#FFFFFF`
- `success`: `#47745A`
- `warning`: `#A77732`
- `danger`: `#A64D43`
- `info`: `#526E80`

### Semantic mapping
- Page background: `canvas`
- Main card: `surface`
- Subtle card/field background: `surface-muted`
- Main text: `ink`
- Supporting text: `ink-soft`
- Primary CTA: `ink` background + `surface` text
- Secondary CTA: transparent/surface background + `ink` text + `border`
- Selected/soft highlight: `sage`
- Brand/data emphasis: `olive`
- Positive movement: `success`
- Negative movement: `danger`

Accessibility: never use `sage` or `blue-gray` as small text on `surface` without checking contrast. Use `ink` or `olive` for text on pale backgrounds. Status must not be communicated by color alone.

## 3. Typography

Use a refined editorial serif for display headings and a clean sans-serif for interface text.

Recommended web fonts:
- Display/headings: `DM Serif Display` or `Playfair Display`
- Body/UI: `Inter` or `DM Sans`
- Numeric values: UI font with tabular numerals enabled

Fallback stacks:
- Display: `Georgia, 'Times New Roman', serif`
- UI: `Inter, 'DM Sans', system-ui, sans-serif`

Type scale:
- `display-xl`: clamp(3rem, 6vw, 5.5rem), line-height 0.98, weight 400
- `display-lg`: clamp(2.5rem, 4vw, 4rem), line-height 1.05, weight 400
- `heading-xl`: 2.25rem / 1.15, weight 500
- `heading-lg`: 1.75rem / 1.2, weight 500
- `heading-md`: 1.25rem / 1.3, weight 600
- `heading-sm`: 1rem / 1.35, weight 600
- `body-lg`: 1.125rem / 1.65, weight 400
- `body`: 0.9375rem / 1.6, weight 400
- `body-sm`: 0.8125rem / 1.5, weight 400
- `label`: 0.75rem / 1.4, weight 600
- `micro`: 0.6875rem / 1.4, weight 500

Use sentence case for headings and labels. Avoid excessive all-caps. Use serif typography sparingly for high-impact headings and important valuation numbers; use sans-serif for forms, tables, navigation, and chart labels.

## 4. Spacing and Layout

Base spacing unit: `4px`.

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px
- `space-10`: 40px
- `space-12`: 48px
- `space-16`: 64px
- `space-20`: 80px
- `space-24`: 96px

Layout:
- Desktop page gutter: 40–64px, responsive
- Tablet page gutter: 24–32px
- Mobile page gutter: 16–20px
- Main content max width: 1440px
- Reading/content width: 680–760px
- Standard section spacing: 72–112px on marketing pages; 24–40px in application dashboards
- Dashboard grid gap: 16–24px
- Form field vertical gap: 16–20px

Prefer generous whitespace and strong alignment. Do not cram cards together or add decorative containers without purpose.

## 5. Borders, Radius, and Elevation

- `radius-sm`: 6px — compact controls, tags
- `radius-md`: 10px — inputs and standard cards
- `radius-lg`: 16px — feature cards and panels
- `radius-xl`: 22px — hero/large feature surfaces
- `radius-pill`: 999px — pills and status badges
- `border-width`: 1px
- `shadow-card`: `0 2px 12px rgba(15, 15, 9, 0.04)`
- `shadow-floating`: `0 12px 32px rgba(15, 15, 9, 0.08)`

Prefer thin warm-gray borders over heavy shadows. Avoid glassmorphism, neon glows, thick outlines, and excessive gradients. Use dark/olive surfaces selectively for navigation and primary actions.

## 6. Components

### Buttons
- Primary: ink background, surface text, radius-md, medium/semibold text, 44–48px height.
- Secondary: surface background, ink text, 1px border.
- Tertiary: transparent background, ink-soft text; hover surface-muted.
- Hover: subtle brightness/background shift; transition 160–220ms.
- Focus: clearly visible 2px focus ring using `sage-deep` or another contrast-checked color.
- Disabled: reduced contrast and no hover animation.
- Buttons must have clear labels; do not rely on icons alone for critical actions.

### Inputs and selects
- Minimum height: 46px.
- Background: surface; border: border; radius-md.
- Label above field; supporting/error text below.
- Placeholder uses ink-soft at readable contrast.
- Focus changes border and shows visible focus ring.
- Error state uses danger plus descriptive text, not color alone.
- Keep prediction form calm and compact. Group optional features in a collapsible section.

### Cards
- Surface background, thin border, radius-lg, 20–24px padding.
- Use consistent card headers and spacing.
- KPI cards should contain a clear label, prominent value, and optional period-over-period context.
- Avoid making every section a card; use whitespace and dividers to establish hierarchy.

### Navigation
- Marketing header: wordmark left, primary links, account actions right.
- Dashboard: dark ink/olive sidebar on desktop with clear active item; responsive drawer or bottom navigation on mobile.
- Active navigation uses a restrained sage highlight and readable text.
- Keep navigation labels explicit and icons consistent (Lucide).

### Tables
- Clear column headers, subtle row dividers, aligned numeric values, tabular numerals.
- Right-align prices and numeric metrics.
- Use compact density for admin/ML screens, comfortable density for user-facing history.
- On mobile, switch to responsive cards or allow deliberate horizontal scrolling.

### Badges
- Small pill with radius-pill.
- Use restrained semantic colors for statuses (success, warning, danger, info).
- Always include text such as “Active”, “Needs review”, or “Low confidence”.

### Property imagery
- Use high-quality architectural photography with natural light, calm colors, and consistent crops.
- Prefer 4:3 or 3:2 for property cards; wide 16:9 for hero imagery.
- Use `object-fit: cover`; provide meaningful alt text.
- Avoid overly saturated stock imagery and inconsistent image treatments.

## 7. Data Visualization

Charts must feel editorial, quiet, and legible. The data should lead—not decoration.

Suggested series:
1. `olive`: `#453F22`
2. `sage-deep`: `#78866F`
3. `warm-brown`: `#8D7658`
4. `blue-gray`: `#9EA9B2`
5. `sage`: `#C4CEB8`

Chart rules:
- Use a consistent series order across the product.
- Use thin grid lines in `border`; avoid heavy chart borders.
- Use direct labels or a clear legend.
- Format Indian currency correctly where applicable (₹, lakh, crore) and label units.
- Always label time range, location, and metric.
- Include accessible text summaries for important charts.
- Do not fabricate analytics, market trends, confidence values, or model metrics. Use clearly marked demo data in prototypes.
- Model evaluation screens should show the metric name, definition/units, dataset split, model version, and evaluation date.

## 8. Product-Specific Screen Guidance

### Landing page
- Large serif headline, concise supporting copy, one primary CTA.
- Architectural hero image with calm neutral overlay only if needed for legibility.
- Follow with trust indicators, how it works, sale/rent prediction entry points, and selected market insights.
- Do not make the landing page look like an admin dashboard.

### Prediction form
- Separate modes/tabs for Sale Price and Monthly Rent.
- Ask only for supported input features; explain required fields.
- Use locality/city selection, property type, area, bedrooms, bathrooms, and optional features only if supported by the trained model.
- Clearly state unsupported locations/features before prediction.

### Prediction results
- Put estimated value and currency/unit first.
- Show prediction range or uncertainty only if the model supports and has been validated for it.
- Show input summary, comparable market context if backed by data, and relevant trends.
- Label the model output as an estimate—not a guaranteed sale/rental value.
- Confidence must not be displayed unless a meaningful, calibrated confidence measure is actually implemented.

### User dashboard and history
- Summary KPIs, price/rent trend chart, recent predictions, saved properties.
- Clearly distinguish sale and rent values.
- Provide filters and timestamps; show model version where useful.

### Admin and ML analytics
- Information-dense but structured, with compact tables and clear sections.
- Show model versions, evaluation metrics, data freshness, training runs, and health states.
- Separate operational system metrics from model-quality metrics.
- Restrict sensitive admin actions and clearly confirm destructive actions.

## 9. Motion

- Standard transition: 160–220ms, ease-out.
- Use small opacity/translate transitions for menus, cards, and dialogs.
- Avoid parallax-heavy interfaces, continuous animation, bouncing effects, and motion that delays core tasks.
- Respect `prefers-reduced-motion`.
- Motion must never be required to understand data or complete a form.

## 10. Responsive Behavior

- Mobile-first and fully usable at 360px width.
- Desktop analytics may use multi-column grids; collapse to one column on mobile.
- Sidebar becomes a drawer or compact mobile navigation.
- Keep primary actions visible and forms easy to complete with touch.
- Avoid clipped charts, tables, headings, and currency values.
- Touch targets should generally be at least 44×44px.

## 11. Accessibility and Content

- Meet WCAG 2.2 AA contrast targets where applicable.
- All controls need accessible names, keyboard operation, and visible focus.
- Do not communicate meaning through color alone.
- Use plain, honest wording for estimates and uncertainty.
- Format dates, areas, and currency consistently. For India, use INR formatting and Indian digit grouping when appropriate.
- Avoid fake reviews, invented market statistics, fabricated model accuracy, and unsupported “AI confidence” claims.

## 12. Implementation Guidance for Antigravity

1. Treat these tokens as the single source of truth for visual styling.
2. Define CSS variables and map them to Tailwind theme tokens; use semantic names rather than raw hex values in components.
3. If using shadcn/ui, customize its semantic CSS variables to this palette rather than leaving default blue/purple accents.
4. Build reusable primitives for buttons, inputs, cards, badges, tabs, tables, chart wrappers, and page containers.
5. Keep visual consistency across landing, prediction, results, user dashboard, admin dashboard, and ML analytics.
6. Use Lucide icons consistently.
7. Preserve the project's chosen architecture and business logic; this document defines the visual system, not backend or ML behavior.
8. Before considering a screen complete, check desktop, tablet, and mobile layouts plus loading, empty, error, and success states.
9. Do not invent real property data or model outputs. Use explicit demo labels until real data and trained models are connected.
10. Avoid redesigning each page independently; establish shared components and tokens first.

## 13. CSS Token Starter

```css
:root {
  --color-canvas: #F2F2F0;
  --color-surface: #FBFAF7;
  --color-surface-muted: #EAEAE4;
  --color-ink: #0F0F09;
  --color-ink-soft: #585E5F;
  --color-sage: #C4CEB8;
  --color-sage-deep: #78866F;
  --color-olive: #453F22;
  --color-warm-brown: #8D7658;
  --color-blue-gray: #9EA9B2;
  --color-border: #DEDED6;
  --color-white: #FFFFFF;
  --color-success: #47745A;
  --color-warning: #A77732;
  --color-danger: #A64D43;
  --color-info: #526E80;

  --font-display: "DM Serif Display", "Playfair Display", Georgia, serif;
  --font-ui: "Inter", "DM Sans", system-ui, sans-serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --radius-pill: 999px;

  --shadow-card: 0 2px 12px rgba(15, 15, 9, 0.04);
  --shadow-floating: 0 12px 32px rgba(15, 15, 9, 0.08);
}
```
