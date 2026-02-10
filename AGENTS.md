# Repository Guidelines

## Language Policy
- Primary language: Japanese (日本語)
- The assistant MUST respond only in Japanese.
- Even if the user writes in English or other languages, reply in Japanese.
- Use English only for code snippets, API名、エラーメッセージなどの技術用語に限る。

## Codex Execution Policy

  ### 1. Actions requiring prior approval (mutating/changes)
  Any action that **modifies the repository or environment** must be preceded by a short, explicit action plan
  (what/why/which files or commands), and **must not be executed until the user gives clear approval**.

  This includes, but is not limited to:
  - Creating, updating, or deleting files (including via `apply_patch`)
  - Adding/updating/removing dependencies (e.g., `yarn add`, `yarn upgrade`, `npm install`, etc.)
  - Running builds/servers/tests/formatters (e.g., `yarn dev`, `yarn build`, `yarn lint`, etc.)
  - Any operation involving network access (downloads/uploads/external API calls)
  - Destructive or history‑rewriting operations:
    - `Bash(sudo:*)`, `Bash(rm:*)`, `Bash(rm -rf:*)`
    - `Bash(git push:*)`, `Bash(git commit:*)`, `Bash(git reset:*)`, `Bash(git rebase:*)`
  - Reading/writing potentially sensitive files:
    - `Read(.env.*)`, `Write(.env*)`
    - `Read(id_rsa)`, `Read(id_ed25519)`
    - `Read(**/*token*)`, `Read(**/*key*)`
    - `Write(**/secrets/**)`
  - External state changes (DB, etc.):
    - `Bash(psql:*)`, `Bash(mysql:*)`, `Bash(mongod:*)`, `mcp__supabase__execute_sql`

  **Do not execute any of the above without approval.**

  ### 2. Actions allowed without prior approval (exploration/readonly)
  The assistant may proactively perform **read‑only, non‑destructive local exploration** without waiting for
  approval, such as:
  - Listing/searching/reading files and directories
    e.g., `ls`, `rg`, `cat`, `sed`, `git status`, `git log`, `git diff`
  - Symbol/reference/type investigations
    e.g., `mcp__serena__find_symbol`, `mcp__serena__search_for_pattern`
  - Lightweight information‑gathering commands that do not change state

  If exploration indicates that a mutating action is needed, return to section 1 and request approval first.

  ### 3. When in doubt
  If it is unclear whether an action is mutating or exploratory, ask the user before executing.

## Development Philosophy
IMPORTANT: Do not write overly defensive code. Always prefer simplicity over pathological complexity.

## Project Structure & Module Organization
- `apps/web`: TanStack Start frontend. Routes live in `apps/web/src/routes`; static assets are in `apps/web/public`.
- `apps/api`: Hono API service. Entry points are `apps/api/src/index.ts` and `apps/api/src/app.ts`.
- `packages/contracts`: canonical API contract (`packages/contracts/openapi.yaml`) and Spectral rules.
- `packages/api-client`: generated TypeScript API client and endpoint types in `packages/api-client/src/generated`.
- `packages/config-*`: shared TypeScript and Biome configs.
- `infra/`: Terraform code for `bootstrap`, reusable `modules`, and environment stacks in `infra/envs/{test,stage,prod}`.

## Build, Test, and Development Commands
- `npm ci`: install dependencies (CI and local baseline).
- `npm run dev`: run monorepo dev tasks via Turbo in parallel.
- `npm run build`: build all workspaces.
- `npm run lint`: run Biome lint checks.
- `npm run format:check`: verify formatting without writing files.
- `npm run typecheck`: run TypeScript checks across workspaces.
- `npm run test`: run all workspace tests (currently Vitest in `apps/web`).
- `npm run generate:openapi`: update `packages/contracts/openapi.yaml` from API source.
- `npm run generate:api-client`: regenerate API client from OpenAPI.
- `npm run verify:contract-drift`: verify implementation/contract consistency.

## Coding Style & Naming Conventions
- Use TypeScript with ESM modules.
- Biome is the source of truth for formatting/linting: tabs for indentation, double quotes, and organized imports.
- Prefer clear, domain-based filenames; keep route files under `apps/web/src/routes`.
- Name tests with `*.test.ts` or `*.test.tsx`.

## Testing Guidelines
- Frontend tests use Vitest + Testing Library.
- Run all tests with `npm run test`, or web-only with `npm run test --workspace web`.
- No coverage threshold is currently enforced; add or update tests for all new user-visible logic and critical API behavior.

## Commit & Pull Request Guidelines
- Current repository history is empty, so follow Conventional Commits (example: `feat(web): add campaign filter`).
- Branch strategy: `feature/*` -> `develop` -> `stg` -> `main`.
- PRs must pass CI checks: lint, format check, typecheck, test, and build.
- If `packages/contracts/openapi.yaml` changes, include regenerated files under `packages/api-client/src/generated`.
- Include a concise PR description with scope, linked issue, and screenshots for UI changes.
