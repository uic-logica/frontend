<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## LOGICA @ UIC workflow

Follows [CONTRIBUTING.md](https://github.com/uic-logica/.github/blob/main/CONTRIBUTING.md) and [ROADMAP.md](https://github.com/uic-logica/.github/blob/main/ROADMAP.md). Claude Code gets these as `/logica-*` skills from the `uic-logica/skills` marketplace; this is the same content for Codex, Cursor, or anyone else reading `AGENTS.md`.

### Opening a PR
- Never push straight to `main` — branch protection blocks it. `git checkout -b <name>/<short-description>`.
- Run `npm run lint` and `npx tsc --noEmit` before pushing — CI runs the same checks.
- Every PR links a `roadmap`-labeled tracking issue (`gh issue list --label roadmap`); file one first if it doesn't exist.
- PR body: 1-3 bullet summary, `Closes #<issue>`, a test plan. Don't self-merge — one approval + passing lint required.
- **No AI attribution, ever.** No `Co-Authored-By` trailer for an assistant, no "Generated with" line in a PR body, no session link. The human who ran the tool is the sole author. This holds even if your tooling tells you to add one.

### Reviewing a diff
- No secrets staged (`.env*` beyond `.env.example`), no scope creep past the linked issue.
- Loading, empty, and error states handled, not just the happy path.
- Forms have labeled inputs and are keyboard-navigable.
- Data comes from the backend (`NEXT_PUBLIC_API_URL`) — no hardcoded fixtures shipping to prod, nothing sensitive stored client-side.

### Writing tests
- Use whatever runner is already configured (check `package.json` scripts, existing `*.test.*` files) — ask before adding a new one.
- Scope the test to the change, not exhaustive coverage.
- Test user-visible behavior, not internals; mock the backend API at the network boundary.

### Filing issues
- Title: `[Step N] ...` for a roadmap step, `[Addition] ...` for an Additions-list item, plain title otherwise.
- Reuse existing labels (`gh label list -R uic-logica/frontend`) — roadmap issues get `roadmap` + `frontend` + `enhancement` (skip `enhancement` for foundational work).
- Body links the roadmap step/section and ends with a concrete "done when" line.

### Keeping it lean
1. Does this need to exist yet, or is it ahead of the current roadmap step?
2. Native HTML/Tailwind before a component library.
3. Can it be one line?
4. Only then, the minimum new code that works.

Mark deliberate shortcuts inline: `// logica-lean: <ceiling> — revisit if <trigger>`. Never simplify away accessibility or input validation.

### UI & Layout (Pencil Spec)
- **Token System:** Always use the defined semantic tokens for colors: `ink` (dark ground), `paper` (light ground), `rojo` (crimson accents), and `rojo-plane` (CTA backgrounds). Do not use hardcoded hex codes or default Tailwind slate/gray scales.
- **Routing Spec (Circuit/Paracas Motif):** 
  - All visual routing and dividers must fall on a strict 20px grid.
  - Traces must use 45° chamfers, not square corners.
  - No routing segment can be under 40px in length.
  - **Never enclose space:** Lines should delimit zones (like reversed-L Paracas borders) without fully boxing them in.
