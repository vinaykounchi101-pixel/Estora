# Estora Design Tokens

Initial design-system baseline. `design-tokens.json` is the machine-readable source of truth; validate contrast and refine tokens during implementation.

## Visual direction
- Light editorial theme by default.
- Premium architectural photography that softly blends into the page background.
- Dark theme as a first-class alternative, not a separate layout.
- Refined serif display typography paired with readable sans-serif UI typography.
- Balanced motion, generous whitespace, restrained borders and accessible controls.

## Typography
- Display: Playfair Display.
- UI/body: Inter.
- Use the scale in `design-tokens.json`; responsive hero sizes should use CSS `clamp()`.

## Color usage
- Use semantic theme tokens in components.
- Light theme: ivory, off-white, charcoal, muted sage and earthy neutrals.
- Dark theme: charcoal surfaces, warm off-white text, sage and restrained bronze.
- Verify contrast, especially for muted text and accent colors.

## Components
- Buttons: primary, secondary, quiet/ghost, disabled, loading.
- Inputs: text, select, checkbox/toggle, field hint, validation error.
- Surfaces: card, panel, table, chart container, empty state, error state.
- Navigation: public header, dashboard sidebar, mobile navigation, theme switch.
- Feedback: skeleton/loading, toast/alert, API unavailable, no data.

## Data integrity
- Never invent property records, market statistics, testimonials, prediction values, confidence scores or user activity.
- Use real API responses, honest explanatory copy, or explicit empty/unavailable states.
- A screen is not complete until loading, success, empty, error and unauthorized states are handled.
