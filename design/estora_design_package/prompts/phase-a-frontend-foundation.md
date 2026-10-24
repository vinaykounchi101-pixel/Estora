ESTORA — PHASE A: FRONTEND FOUNDATION

Inspect the actual repository and working tree before making changes. Read the frontend package manifest and lockfile, Next.js routing structure, existing backend FastAPI routes, Pydantic schemas, authentication behavior, CORS configuration, and OpenAPI specification. Do not assume prior reports are current. Preserve existing user changes and do not commit, push, reset, or delete unrelated files.

DESIGN INPUTS
1. Follow design/design-tokens.json as the machine-readable design-token baseline.
2. Follow design/design-tokens.md for visual and component principles.
3. Use the Estora visual reference board from the ChatGPT conversation as a moodboard, not a pixel-perfect screenshot to copy.
4. Light editorial theme is the default: warm ivory, charcoal, muted sage, earthy neutrals, refined serif headlines, readable sans-serif UI, generous whitespace, and architectural photography that blends naturally into the background with theme-aware gradients.
5. Support a complete dark theme using deep charcoal surfaces and restrained warm bronze/sage accents. Keep the same information architecture in both themes.
6. Use balanced motion: short hero entrance, subtle image movement, restrained scroll reveals, smooth theme changes, accessible focus states, and reduced-motion support. Inspect existing dependencies before selecting animation tools.

PHASE A SCOPE
1. Audit the current frontend structure, package scripts, dependencies, routing, existing components, backend contracts, environment configuration, and test setup.
2. Implement the design-token system and theme provider with persistence, system preference fallback, and no visible theme flash.
3. Establish a typed API client using a validated environment variable such as NEXT_PUBLIC_API_URL. Never hardcode production URLs, expose secrets, or put database credentials in the browser.
4. Establish request/response contracts from actual backend Pydantic schemas or generated OpenAPI types. Do not guess API paths, fields, response shapes, or authentication semantics.
5. Establish centralized handling for network errors, structured API errors, expired sessions, loading states, empty states, and unavailable services.
6. Create accessible shared UI primitives and a responsive application shell/navigation.
7. Build the public landing page using only real supported capabilities. Do not fabricate property listings, testimonials, market metrics, prediction accuracy, locality rankings, or prediction results. If no real content/data endpoint exists, use truthful explanatory copy rather than fake statistics.
8. Document environment variables and local setup. Do not require seeded data for the application to start or render correctly.

INTEGRATION REQUIREMENTS
The existing backend is the source of truth. Inspect actual API routes and permissions before connecting screens. Sale-price inference must use the real model service. A persisted prediction must use the correct persistence endpoint. Rental prediction and genuine market analytics must not be represented as operational until their backend functionality and data sources exist. Saved properties must not be wired to a nonexistent API. Admin actions must remain protected by server-side authorization.

QUALITY GATES
Run the available frontend lint, typecheck, tests, and production build. Add tests for theme behavior and API client error handling. Verify keyboard navigation, semantic HTML, visible focus, responsive layouts, reduced motion, and color contrast. Test empty database/API responses without seeding records. Report exact changed files, commands run, test results, known gaps, and backend contract blockers. Do not claim a check passed unless it was actually run.

STOP CONDITION
Phase A only. Do not build all dashboard pages in this phase, do not modify ML training or model artifacts, do not seed the database, and do not change backend contracts silently. Present any required backend changes separately for review. Preserve all existing work and do not commit or push.
