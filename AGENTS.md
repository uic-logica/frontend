<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Work from the implementation

Read the affected page/component and its API calls before changing it. `PRODUCT.md`, `CONTENT.md`, and `DESIGN.md` describe the current code, including gaps; older comments may describe retired plans.

- Keep browser API calls same-origin through `next.config.ts` and `src/lib/api.ts`. Configure the backend origin with `NEXT_PUBLIC_API_URL`.
- Dashboard layout is persistent: `src/app/dashboard/layout.tsx` mounts `Dashboard.tsx`, which reads the section from the pathname. Reuse that shell rather than mounting a second dashboard in each page.
- `src/components/dashboard/types.ts` mirrors backend stages and board shapes. `runsWorkspace()` is MEMBER + EXEC_BOARD only; BOARD receives member navigation. Backend checks remain authoritative.
- Money and outreach share `Board.tsx`. Officer titles change home tiles in `BoardHome.tsx`, not access. Do not introduce duplicate pipelines or permission rules per officer.
- Preserve loading, empty, signed-out, and error states. Keep labeled fields, keyboard access, focus indicators, and reduced-motion alternatives when modifying UI.
- Reuse the route's existing shell and styles: `ClubShell`/`globals.css` for public pages, `dashboard.css` for the workspace, `AppShell` for standalone tools. Fonts are loaded in `src/app/layout.tsx`.
- Operational data comes from the backend. Public home/team copy is currently authored in page arrays; do not describe it as live analytics or use it as an authenticated-data fallback.
- Do not add credentials or env files to git. `.env.example` contains public frontend configuration only.

## Known boundaries

`src/app/signin/page.tsx` still calls retired OTP endpoints, while the backend requires issued member passwords. `Members.tsx` lacks issuance controls, and legacy `/attendance` omits the required check-in code. Do not describe these as complete flows or quietly change auth during an unrelated task. Guest invitation claims and speaker password login have separate pages.

## Checks

`.github/workflows/ci.yml` uses Node 24: `npm ci`, `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, `npm run build`. Run lint, typecheck and tests before pushing; generate route types first in a fresh checkout. The runner is vitest (`npm test` → `vitest run`), added in #56; it covers pure helpers in `src/lib/` only — there is no component or browser testing set up, so do not reach for one without asking. For UI work, check the affected role, keyboard flow, narrow layout, and error/empty states against the backend.

## Branches and PRs

Use `<name>/<short-description>`, not `main`; keep an already-supplied task branch. Open a PR against `main` with 1–3 summary bullets, the linked tracking issue (`Closes #<issue>` when completed), and a test plan. Do not self-merge. `.github/CODEOWNERS` assigns `@uic-logica/maintainers`; it does not specify an approval count.

Link a roadmap-labeled tracking issue; reuse an existing one or file one for the task. Keep changes within its scope. Native HTML and current Tailwind/CSS patterns come before another component library. Add only what the current behavior needs. Preserve accessibility and validation when simplifying. Existing deliberate deferrals use `// logica-lean: <ceiling> — revisit if <trigger>`.
