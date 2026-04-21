# Repository Restructure Migration Plan

## Objective

Restructure the repository so it reflects engineering ownership and deployable units instead of mixing business taxonomy, imported platforms, and live runtime state.

## Target Outcomes

- First-party apps and services live in stable top-level locations.
- Imported or externally maintained platforms are isolated from first-party code.
- Infrastructure contains config and provisioning assets, not mutable runtime data.
- Shared code, docs, tests, and scripts become real top-level areas instead of placeholders.
- Git noise from logs, databases, caches, and generated state is eliminated.

## Current Problems

### Structure problems

- First-party code is spread across `channels/`, `business_system/`, and `core_banking/`.
- Imported platforms are embedded deep inside business folders:
  - `core_banking/midaz`
  - `business_system/support/fraud_management/kyc/ballerine`
- Runtime and vendor state is committed under `infrastructure/gateway/wso2am-4.6.0`.
- `services/`, `shared/`, `docs/`, `tests/`, and `scripts/` exist at the repo root but are mostly unused.

### Repository hygiene problems

- No root `.gitignore`.
- Generated artifacts exist inside service folders:
  - `.gradle`
  - `bin`
  - `logs`
- WSO2 runtime state is creating persistent git churn:
  - logs
  - embedded databases
  - Solr indexes
  - diagnostics zips
  - temp files

## Target Repository Layout

```text
digital-bank-hub/
  apps/
    mobile/
      bank-app/
  services/
    core-banking/
      account-service/
      card-service/
      transaction-service/
      banking-integration/
    security/
      auth-service/
      iam-service/
      mfa-service/
    communications/
      notification-service/
  platforms/
    midaz/
    ballerine/
  infrastructure/
    gateway/
      wso2/
        config/
        overlays/
        scripts/
    docker/
    kubernetes/
    terraform/
    monitoring/
    ci-cd/
  shared/
    api-contracts/
    configs/
    libs/
    utils/
  docs/
    architecture/
    api/
    deployment/
    development/
  tests/
    e2e/
    integration/
    performance/
    security/
  scripts/
    setup/
    migration/
    tooling/
  assets/
```

## Migration Principles

1. Move by ownership, not by business category.
2. Keep imported platforms intact internally during the first migration.
3. Separate repository cleanup from service relocation.
4. Prefer staged `git mv` migrations over big-bang rewrites.
5. Keep builds green after every phase.
6. Add compatibility documentation for any path changes that affect scripts or CI.

## Proposed Classification

### First-party apps

- `channels/mobile/BankApp` -> `apps/mobile/bank-app`

### First-party services

- `business_system/core/account_management/account_service` -> `services/core-banking/account-service`
- `business_system/core/account_management/card_service` -> `services/core-banking/card-service`
- `business_system/core/transactions/transaction_service` -> `services/core-banking/transaction-service`
- `business_system/core/banking_integration` -> `services/core-banking/banking-integration`
- `business_system/core/communications_management/alerts_notifications/notification_service` -> `services/communications/notification-service`
- `business_system/support/identity_security_management/single_sign-on/auth_service` -> `services/security/auth-service`
- `business_system/support/identity_security_management/single_sign-on/iam_service` -> `services/security/iam-service`
- `business_system/support/identity_security_management/single_sign-on/mfa-service` -> `services/security/mfa-service`

### Imported or external platforms

- `core_banking/midaz` -> `platforms/midaz`
- `business_system/support/fraud_management/kyc/ballerine` -> `platforms/ballerine`

### Infrastructure assets to keep

- `infrastructure/docker`
- `infrastructure/kubernetes`
- `infrastructure/terraform`
- `infrastructure/monitoring`
- `infrastructure/ci-cd`

### Infrastructure assets to redesign

- `infrastructure/gateway/wso2am-4.6.0`
  - keep only reproducible config, overlay, provisioning, and bootstrap assets
  - remove mutable runtime installation data from version control

## Phase Plan

## Phase 0: Freeze And Inventory

### Goals

- Prevent path churn during active feature work.
- Identify all path-sensitive tooling before moves begin.

### Tasks

- Create a short-lived migration branch.
- Announce a temporary freeze on large refactors.
- Inventory references to current paths in:
  - CI workflows
  - Docker files
  - shell scripts
  - README files
  - IDE launch configs
  - deployment manifests
- Capture current build and test entry points for each active project.

### Exit criteria

- All path-sensitive references are documented.
- Owners are assigned for each major area.

## Phase 1: Repository Hygiene

### Goals

- Stop tracking generated and runtime state.
- Reduce git noise before moving directories.

### Tasks

- Add a root `.gitignore`.
- Extend ignore rules for:
  - `**/.gradle/`
  - `**/build/`
  - `**/bin/`
  - `**/logs/`
  - `**/.idea/`
  - `**/tmp/`
  - `**/*.mv.db`
  - `**/diagnostics-tool/data/`
  - `**/repository/logs/`
  - `**/solr/data/`
  - `node_modules/`
- Remove tracked generated/runtime artifacts from git index without deleting intended source files.
- Document which WSO2 assets are source-of-truth versus disposable runtime state.

### Exit criteria

- `git status` is clean after local runtime usage.
- No runtime databases, logs, or indexes are tracked.

## Phase 2: Establish New Top-Level Homes

### Goals

- Turn placeholder folders into real ownership boundaries.

### Tasks

- Create and document:
  - `apps/`
  - `services/`
  - `platforms/`
  - `shared/`
  - `docs/`
  - `tests/`
  - `scripts/`
- Add a short README to each top-level area describing what belongs there.

### Exit criteria

- The target structure exists and is documented.

## Phase 3: Move Imported Platforms

### Goals

- Isolate externally maintained products before touching first-party services.

### Tasks

- Move `core_banking/midaz` to `platforms/midaz`.
- Move `business_system/support/fraud_management/kyc/ballerine` to `platforms/ballerine`.
- Preserve each platform's internal structure on the first pass.
- Update root documentation to treat these as embedded platforms, not ordinary subfolders.
- Decide whether either should become:
  - a git submodule
  - a subtree
  - a periodic mirror
  - a pinned external dependency with local overlays

### Exit criteria

- Platform code is isolated under `platforms/`.
- Ownership model is defined for future updates.

## Phase 4: Move First-Party App

### Goals

- Put customer-facing delivery surfaces under `apps/`.

### Tasks

- Move `channels/mobile/BankApp` to `apps/mobile/bank-app`.
- Update paths in:
  - README files
  - CI workflows
  - mobile build scripts
  - any deployment automation
- Verify package manager and native mobile commands still run from the new location.

### Exit criteria

- Mobile app builds and tests from `apps/mobile/bank-app`.

## Phase 5: Move First-Party Services

### Goals

- Consolidate owned backend services under `services/`.

### Tasks

- Move core banking services:
  - account-service
  - card-service
  - transaction-service
  - banking-integration
- Move security services:
  - auth-service
  - iam-service
  - mfa-service
- Move communications service:
  - notification-service
- Remove local build artifacts from moved services.
- Normalize folder naming to kebab-case at destination.

### Exit criteria

- First-party deployable services all live under `services/`.

## Phase 6: Refactor Infrastructure Gateway Layout

### Goals

- Replace committed runtime installation state with reproducible gateway infrastructure.

### Tasks

- Extract reusable WSO2 assets into:
  - `infrastructure/gateway/wso2/config`
  - `infrastructure/gateway/wso2/overlays`
  - `infrastructure/gateway/wso2/scripts`
- Remove live runtime files from version control.
- Add bootstrap instructions for creating a local WSO2 instance from clean inputs.
- If full local packaging is needed, build it through Docker or setup scripts instead of storing the exploded runtime tree.

### Exit criteria

- Gateway infrastructure is reproducible from source-controlled config.
- Runtime state is no longer tracked.

## Phase 7: Consolidate Shared Assets

### Goals

- Start using `shared/`, `tests/`, and `scripts/` intentionally.

### Tasks

- Identify duplicated DTOs, configs, utilities, and API contracts across services and apps.
- Move only stable reusable assets into:
  - `shared/api-contracts`
  - `shared/configs`
  - `shared/libs`
  - `shared/utils`
- Move cross-system test suites into `tests/`.
- Move repo-level helper scripts into `scripts/`.

### Exit criteria

- Shared folders contain real reusable assets, not speculative placeholders.

## Phase 8: Documentation And Governance

### Goals

- Make the new structure understandable and enforceable.

### Tasks

- Rewrite the root README around the new structure.
- Add contribution guidance for where new code belongs.
- Add architecture notes explaining:
  - what is first-party
  - what is platform
  - what is infrastructure
- Add CODEOWNERS if desired.

### Exit criteria

- New contributors can place code correctly without tribal knowledge.

## Validation Checklist Per Phase

- Builds still run for changed projects.
- Tests still run for changed projects.
- CI paths are updated.
- README and setup instructions are updated.
- No generated/runtime files are newly tracked.
- `git status` remains stable after local runs.

## Risks And Mitigations

### Risk: Broken CI and scripts after moves

Mitigation:

- Inventory path references in Phase 0.
- Update CI in the same PR as each move.

### Risk: Imported platform updates become harder

Mitigation:

- Move platforms intact first.
- Decide explicit update strategy after relocation.

### Risk: Large rename diffs obscure logic changes

Mitigation:

- Keep migration PRs path-only where possible.
- Avoid mixing behavior changes with moves.

### Risk: Team confusion during the transition

Mitigation:

- Publish the migration sequence.
- Freeze ad hoc directory creation outside the target layout.

### Risk: WSO2 reproducibility gaps

Mitigation:

- Extract config before deleting tracked runtime data.
- Test fresh environment bootstrap from scripts or containers.

## Recommended PR Sequence

1. PR 1: Add root `.gitignore` and remove tracked runtime artifacts.
2. PR 2: Add top-level READMEs and define target structure.
3. PR 3: Move `midaz` to `platforms/midaz`.
4. PR 4: Move `ballerine` to `platforms/ballerine`.
5. PR 5: Move mobile app to `apps/mobile/bank-app`.
6. PR 6: Move core banking services to `services/core-banking`.
7. PR 7: Move security and communications services to `services/`.
8. PR 8: Replace tracked WSO2 runtime with reproducible gateway config.
9. PR 9: Update root docs, contribution guidance, and ownership rules.

## Recommended First Execution Step

Start with Phase 1. The current repository state is too noisy for safe directory migration, and the lack of a root `.gitignore` will keep producing false diffs until that is fixed.
