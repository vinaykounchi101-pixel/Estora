# ESTORA — FINAL HERO ART DIRECTION & VISUAL POLISH
## Final Task — Preserve Functionality, Perfect the Composition

### MISSION

Make the final visual refinement to Estora's existing website, focusing on the landing-page hero and any closely related typography, spacing, and responsive adjustments.

The implementation and Phase C work have already been completed. This is the final art-direction pass.

Use the provided reference screenshots as visual inspiration, particularly the oversized brand typography integrated naturally with architectural photography.

The goal is to make Estora feel like a premium, thoughtfully art-directed real-estate intelligence brand—not a generic AI-generated website.

This is a refinement of the existing implementation, NOT a redesign from scratch.

Work independently from inspection through implementation and verification. Do not stop at a plan, ask for intermediate approval, or create additional phases.

---

## 1. THE CORE VISUAL IDEA

The architectural photograph and oversized ESTORA wordmark should work together as one composition.

Study the supplied references for these principles:

- A very large brand name spanning much of the hero.
- Typography integrated into the architectural composition.
- The building naturally appearing in front of and obscuring parts of the lettering.
- Strong but restrained scale contrast.
- Simple, confident typography.
- Natural image colors and architectural details.
- Supporting copy that remains readable without dominating the hero.

The wordmark should feel like it belongs in the scene. It must not look like a large text layer that was randomly pasted over a photograph.

Do not copy the reference brands, their names, or their complete layouts. Translate the design principles into Estora's existing identity.

### Intended visual hierarchy

1. The architectural photograph and its composition.
2. The oversized ESTORA wordmark integrated behind the architecture.
3. The main headline: “Smarter Decisions for a Brighter Future”.
4. The supporting description and primary actions.
5. Small supporting metrics and metadata.

Keep this hierarchy intentional. The wordmark must be visually significant without overpowering the actual headline or hiding important architectural details.

---

## 2. OVERSIZED ESTORA WORDMARK

Introduce an oversized ESTORA wordmark into the landing-page hero.

### Typography and placement

- Make ESTORA large enough to span a substantial portion of the desktop hero.
- Use a deliberate position relative to the building, roofline, sky, and other architectural features.
- Use typography that complements the existing premium editorial identity.
- Inspect the current font setup before choosing the exact wordmark treatment.
- Keep letter spacing, font weight, and line height controlled.
- Use natural alignment and proportion rather than forcing the text to fit a rigid box.
- Let the wordmark interact with the building's geometry.
- Keep the text elegant and simple. Its scale and placement should create the impact.

The wordmark can be partially obscured by the building if the composition supports it. Do not make every letter equally visible at the expense of realism.

### Natural layering

The most important requirement is that the building should appear to sit in front of the wordmark.

Inspect the existing image asset and its actual composition before deciding how to implement this effect.

Choose the simplest technically sound solution that creates believable depth. Depending on the available image and architecture, this may involve:

- Carefully layered image and typography elements.
- A separate background wordmark layer.
- A foreground architectural image layer with an appropriate mask.
- Image segmentation or a manually prepared mask if genuinely necessary and feasible.
- Responsive positioning and clipping that preserve the composition.

Do not assume that setting the wordmark to a lower CSS z-index behind the entire photograph will produce the desired result. That would simply hide the text.

Do not introduce complicated image-processing infrastructure when a simpler, high-quality composition is possible.

If accurate foreground separation cannot be achieved with the existing image, implement the best visually convincing alternative and explain the limitation. Never fake a result by adding conspicuous outlines or artificial borders around the building.

### Wordmark appearance

- Use a restrained ivory, warm grey, or other low-contrast treatment suited to the actual image.
- Preserve enough contrast for the letters to be recognized.
- Avoid neon colors, glowing effects, heavy outlines, excessive shadows, and decorative gradients.
- Do not make the text look like a watermark stamped across the whole page.
- Avoid a second competing ESTORA logo that makes the branding repetitive.

The existing header logo should remain functional. The oversized hero wordmark is a distinct visual element, not a replacement for navigation or the brand identity in the header.

---

## 3. HERO PHOTOGRAPH — SHOW THE FULL IMAGE

The current hero uses a modern architectural photograph with a reflecting pool.

Preserve the existing asset if its quality is adequate.

The full architectural scene should remain visible as intended, including the building, roofline, sky, surroundings, and pool/reflection wherever present in the original image.

### Fix the current treatment

The previous design had a broad white overlay that washed out too much of the photograph. That treatment was reduced in Phase C, but the final composition still needs careful art direction.

Requirements:

- Preserve the photograph's natural colors, contrast, and detail.
- Avoid unnecessary cropping of important architectural features.
- Use a subtle, localized warm-ivory haze near the left edge where the text requires additional contrast.
- Let the haze dissolve gradually into the photograph.
- Do not cover the entire left half with an opaque white gradient.
- Do not blur the entire photograph.
- Do not reduce the photograph's contrast merely to make the headline readable.
- Do not place a large opaque text panel over the architecture.
- Avoid a visible vertical boundary between the haze and the image.
- Keep the center and right portions of the photograph crisp and naturally colored.

The intended result is a full, atmospheric architectural image with a gentle left-edge haze—not a washed-out image behind a white panel.

### Image rendering

Inspect the actual image dimensions, aspect ratio, `object-fit`, `object-position`, masks, overlays, and responsive CSS.

Adjust these based on real browser rendering rather than guessing.

Preserve image sharpness and avoid introducing new assets without a demonstrated need.

---

## 4. MAIN HEADLINE AND SUPPORTING CONTENT

Preserve the established headline:

“Smarter Decisions for a Brighter Future”

Do not replace it with a generic luxury-property slogan.

The headline should be composed deliberately around the oversized wordmark and building.

### Headline requirements

- Use the existing Playfair Display editorial typography direction where appropriate.
- Choose a natural line break and controlled width.
- Keep the font size dramatic but balanced against the architecture.
- Correct awkward tracking, line height, and alignment.
- Ensure the headline does not collide awkwardly with rooflines or important architectural features.
- Do not force the headline into a narrow column merely because that is the easiest layout.
- Preserve its readability over both light sky and darker architectural regions.

### Eyebrow text

The existing eyebrow communicates Estora's identity and Pune market scope.

Keep it concise and legible.

Correct any overlapping labels, low-contrast text, excessive uppercase tracking, and awkward alignment.

Do not add additional badges simply to fill space.

### Supporting paragraph

Preserve the existing product message about residential property prices, spatial trends, and empirical machine-learning models.

- Use readable Inter typography.
- Keep the paragraph visually secondary to the headline.
- Use a deliberate line length and natural wrapping.
- Prevent text from crossing visually busy parts of the image without sufficient contrast.
- Avoid a large solid background panel unless the composition genuinely requires one.
- Use only the minimum local contrast treatment necessary.

### Calls to action

Preserve the existing working calls to action, including the valuation entry point and methodology/provenance action.

- Maintain clear primary and secondary action hierarchy.
- Use consistent button heights, padding, and typography.
- Ensure both buttons are readable against the photograph.
- Keep hover, focus, and active states subtle.
- Verify that both buttons navigate to their intended destinations.

Do not replace working actions with decorative elements.

### Supporting metrics

Keep existing verified metrics only.

Review the contrast and spacing of the audited-record count, cross-validation information, and inference benchmark.

Avoid placing small, low-contrast text over visually complex parts of the photograph.

Do not add unsupported performance claims or fabricated metrics.

---

## 5. REMOVE THE REMAINING GENERIC DESIGN FEEL

Make small, intentional improvements to the landing page wherever the current composition needs them.

Review:

- Typography consistency.
- Headline-to-paragraph spacing.
- Eyebrow placement.
- Button alignment.
- Section margins.
- Header spacing.
- Logo and navigation alignment.
- Hero height and vertical balance.
- Contrast and text readability.
- Image and text composition.
- Redundant visual decoration.
- Excessive tracking and inconsistent font weights.

Avoid:

- Generic AI-generated gradient blobs.
- Excessive rounded cards.
- Unnecessary borders and shadows.
- Arbitrary uppercase labels.
- Excessive pill badges.
- Randomly placed icons.
- Overly symmetrical layouts without visual purpose.
- Unnecessary motion.
- Large empty regions that make the design feel unfinished.
- Decorative content with no functional or compositional purpose.

Use restrained editorial design, purposeful asymmetry, natural typography, and precise alignment.

Do not redesign the entire application or change unrelated page layouts just to introduce novelty.

---

## 6. PRESERVE THE ESTABLISHED ESTORA IDENTITY

Maintain the existing brand direction:

- Premium real-estate intelligence.
- Editorial serif headlines.
- Inter for interface text and supporting information.
- Warm ivory and cream.
- Charcoal and near-black.
- Muted sage and olive accents.
- Restrained earth tones.
- Warm-charcoal dark mode.

Do not copy the HESTIA or ARKO visual identity. The references are inspiration for typography, architectural composition, and layering—not templates to reproduce.

The final design must still look unmistakably like Estora.

---

## 7. RESPONSIVE COMPOSITION

The oversized wordmark and layered hero must work across desktop, tablet, and mobile.

Verify at:

- 375px mobile width.
- 768px tablet width.
- 1440px desktop width.

Test additional widths if needed.

### Desktop

- Let the wordmark span the architectural scene.
- Preserve the relationship between the building, letters, headline, and supporting text.
- Avoid clipping that removes important letters or architectural features without compositional intent.
- Maintain readable navigation and well-positioned calls to action.

### Tablet

- Rebalance the wordmark and headline instead of merely scaling the desktop layout.
- Prevent collisions between the text, building, and navigation.
- Maintain sufficient space for the main actions.

### Mobile

- Do not shrink the oversized desktop wordmark until it becomes meaningless.
- Scale, crop, reposition, or partially clip the wordmark intentionally.
- Preserve the headline and primary action as the main readable content.
- Keep the architecture visible to the extent supported by the viewport.
- Stack content naturally.
- Prevent horizontal scrolling.
- Ensure the text does not overlap in an uncontrolled way.

The desktop design may be more dramatic than the mobile version. Responsive adaptation is preferable to forcing identical composition at every size.

---

## 8. LIGHT MODE, DARK MODE, ACCESSIBILITY, AND MOTION

Preserve the existing theme system.

Verify the hero in both themes. The wordmark, headline, supporting text, and buttons must retain adequate contrast.

Do not use a fixed white haze that becomes visually inappropriate in dark mode. Adapt the contrast treatment carefully while preserving the photograph's natural appearance.

Maintain:

- Semantic heading hierarchy.
- Accessible navigation.
- Keyboard-operable calls to action.
- Visible focus indicators.
- Appropriate text contrast.
- Meaningful image alt text.
- Reduced-motion support.

Keep motion subtle. If the wordmark animates, use a restrained entrance or reveal that supports the composition without delaying content or distracting from the architecture.

Respect `prefers-reduced-motion`.

Do not introduce continuous animation, dramatic zooming, excessive parallax, or motion that causes layout shifts.

---

## 9. IMPLEMENTATION RULES

Before editing:

1. Inspect the current branch and working tree.
2. Read the current hero component, landing-page implementation, relevant design tokens, and image assets.
3. Inspect existing uncommitted changes.
4. Preserve the completed Phase C work and all unrelated user changes.
5. Identify the smallest set of files that needs to change.

Then implement the final composition.

Reuse the existing component architecture and design tokens wherever practical.

Avoid adding unnecessary dependencies.

Do not replace the existing hero image without a clear reason.

Do not rewrite the entire landing page or shared design system.

Do not modify backend or ML behavior unless a specific issue directly affects a claim displayed in the hero.

Do not change authentication, database configuration, prediction logic, or API contracts as part of this visual task.

Do not commit, push, merge, reset, or discard user changes.

Do not ask for intermediate approval.

---

## 10. VISUAL VERIFICATION

After implementation, run the application using the existing project workflow and inspect the actual browser rendering if browser tooling is available.

Check:

1. The architectural photograph remains crisp and fully visible.
2. The left-side haze is subtle and localized.
3. The oversized ESTORA wordmark is integrated into the composition.
4. The building appears to overlap the wordmark where the chosen implementation supports it.
5. The wordmark does not compete excessively with the headline.
6. The headline remains readable over the photograph.
7. The supporting paragraph and eyebrow have adequate contrast.
8. Buttons and supporting metrics remain legible.
9. The hero has deliberate vertical balance.
10. The composition works at 375px, 768px, and 1440px.
11. Light and dark themes render correctly.
12. No new hydration errors, broken assets, horizontal overflow, or browser console errors have been introduced.
13. Existing navigation and calls to action still work.
14. The dashboard and Valuation Studio have not regressed.

Capture and inspect screenshots after the final changes where possible.

Do not claim that visual verification passed if you did not inspect the actual rendered page.

Run the relevant frontend tests, type check, and production build. Fix regressions introduced by the changes.

If browser verification is unavailable, report the limitation honestly.

---

## 11. DEFINITION OF DONE

This final task is complete when:

- The oversized ESTORA wordmark is incorporated into the hero composition.
- The typography feels integrated with the architecture rather than forced onto the photograph.
- The building naturally obscures the wordmark where technically feasible.
- The full architectural photograph remains visible and crisp.
- The broad white wash is absent.
- The left-edge haze is subtle, localized, and natural.
- The main headline, paragraph, calls to action, and metrics are readable.
- The existing Estora brand identity is preserved.
- Responsive layouts and both themes are checked.
- Existing functionality remains intact.
- Relevant tests and the production build pass, or any environment-related blockers are explicitly documented.
- No unrelated user work has been discarded.
- No commit or push has occurred.

Do not declare success solely because the page compiles.

---

## 12. FINAL REPORT

After completing the work, provide a concise report containing:

1. Overall result: COMPLETE or PARTIALLY COMPLETE.
2. Files changed.
3. How the oversized ESTORA wordmark was implemented.
4. How the architecture/wordmark layering was achieved.
5. How the hero image and left-edge haze were refined.
6. Responsive and theme checks performed.
7. Exact tests and build commands run, with actual results.
8. Any remaining limitations.
9. Confirmation that no commit or push was performed.

Do not invent verification results.

---

## FINAL INSTRUCTION

Make the final art-direction pass now.

The intended result is simple but distinctive: a crisp architectural photograph, an oversized ESTORA wordmark integrated naturally behind the building, elegant editorial typography, a subtle localized haze, and carefully placed supporting content.

The typography should feel as though it was designed for the architecture from the beginning.

Do not make the composition look forced. Do not obscure the photograph. Do not copy the reference literally. Do not redesign the entire product.

Finish this task in one continuous execution and leave the completed work in the working tree for review.
