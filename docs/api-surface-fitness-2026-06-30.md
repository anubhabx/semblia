# Semblia v2 API Surface Fitness - 2026-06-30

## Target

Move the API surface out of blind bug-fix mode by scoring five executable
layers, fixing P0/P1 findings inline, and leaving a reviewable record.

Target for this pass:

- Overall score at least 90/100.
- Zero open P0/P1 findings in the API surface.
- No layer below 18/20.
- API gates green from database generation through worker smoke.

## Final Score

| Layer | Score | Evidence |
| --- | ---: | --- |
| Build and executable health | 20/20 | Database generate/validate, shared types build, API typecheck/lint/test/build, and worker smoke all pass. |
| Contract and route coverage | 19/20 | Health route contract coverage added; full API suite is now 65 files / 420 tests. Residual point held for broader black-box route coverage. |
| Authz and trust boundaries | 19/20 | Media upload boundary tests cover project capability, user-only account-default logo uploads, public-submit activation, and actor-owned deletion. Fixed credential actors being allowed to mint account-default logo upload intents. |
| Data and workflow correctness | 18/20 | Moderation telemetry and ops budget now read real `FormModerationRun` state; stale billing webhook TODO removed. Residual points held for non-exhaustive workflow invariant coverage. |
| Operations and dependency readiness | 19/20 | Worker smoke passes, health degradation contract is covered, and production audit has 0 remaining `apps__api_v2` advisory paths. Residual point held because the wider monorepo still has non-API advisories. |
| **Total** | **95/100** | Target met. |

## Severity Summary

| Severity | Open before pass | Fixed or closed | Open after pass |
| --- | ---: | ---: | ---: |
| P0 | 0 | 0 | 0 |
| P1 | 1 | 1 | 0 |
| P2 | 3 | 3 | 0 API scoped |
| P3 | 1 | 1 | 0 API scoped |

## Fixes Landed

- `bf518730 fix(api_v2): report moderation telemetry`
  - Queue telemetry now groups real `formModerationRun` rows instead of returning empty moderation stats.
  - Ops-admin moderation budget now reports suppressed moderation runs and latest suppression time from the database.
- `4467fd5a test(api_v2): cover media upload boundaries`
  - `ACCOUNT_DEFAULTS_LOGO` upload intents now require a user actor, not merely any actor with a `userId`.
  - Added coverage for project upload intent capability checks, internal export artifact rejection, public-submit asset activation, and actor-owned deletion.
- `7673b9b6 test(api_v2): cover health status contract`
  - Added coverage for public/throttled route metadata and OK/degraded dependency states.
- `f0ca0256 chore(api_v2): drop stale billing webhook todo`
  - Removed stale module TODO after confirming the Razorpay webhook controller and route metadata test already exist.
- `287e3221 chore(api_v2): pin vulnerable transitive deps`
  - Moved patched transitive overrides into `pnpm-workspace.yaml`.
  - Lockfile now resolves API-relevant vulnerable paths away from `axios`, `follow-redirects`, `form-data`, `qs`, `multer`, `js-yaml`, `js-cookie`, and `uuid` advisory floors.

## Audit Result

Command:

```powershell
pnpm audit --prod --json
```

Result:

- Audit process exit code: `1`.
- Workspace production advisories: `6`.
- Remaining advisory paths containing `apps__api_v2`: `0`.

The remaining workspace advisories are outside this API-surface pass:

| Module | Severity | Path family |
| --- | --- | --- |
| `lodash` | high/moderate | `packages__ui > recharts > lodash` |
| `postcss` | moderate | `apps__admin` / `apps__web_v2` via Next |
| `ip-address` | moderate | `packages__semblia-mcp-server` |
| `@babel/core` | low | `apps__admin` / `apps__web_v2` via Next styled-jsx |

## Verification

| Command | Result |
| --- | --- |
| `corepack.cmd pnpm --filter @workspace/database generate` | pass |
| `corepack.cmd pnpm --filter @workspace/database exec prisma validate` | pass |
| `corepack.cmd pnpm --filter @workspace/types build` | pass |
| `corepack.cmd pnpm --filter api_v2 typecheck` | pass |
| `corepack.cmd pnpm --filter api_v2 lint` | pass |
| `corepack.cmd pnpm --filter api_v2 test` | pass, 65 files / 420 tests |
| `corepack.cmd pnpm build --filter api_v2` | pass, 6/6 tasks |
| `corepack.cmd pnpm --filter api_v2 smoke:worker` | pass |

## Residual Debt

- The workspace still has non-API production advisories listed above; handle them in a dedicated web/UI/MCP dependency pass.
- The API score is intentionally not 100 because route-level black-box tests and cross-workflow invariant coverage remain incomplete.
- `node_modules` had stale local install metadata from the old `C:\workspace\semblia` checkout and pnpm 11.7.0. It was rebuilt with the repo-pinned Corepack pnpm 11.1.3 before final gates.
