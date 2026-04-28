# Repository Guidelines

## Project Structure & Module Organization

This repository is a multi-platform banking monorepo. Use top-level folders by ownership: `apps/` for customer apps, `services/` for first-party backend services, `platforms/` for embedded third-party platforms, `shared/` for contracts, `infrastructure/` for deployment and gateway configuration, and `tests/` for cross-system suites. Examples: `apps/mobile/bank-app/`, `services/security/mfa-service/`, `platforms/midaz/`, and `platforms/ballerine/`.

Keep first-party code out of vendored platform trees unless intentionally forking. Preserve upstream structure under `platforms/`.

## Build, Test, and Development Commands

There is no single root build command; run commands from the relevant component:

- `cd apps/mobile/bank-app && pnpm install && pnpm start` — run the Expo mobile app.
- `cd apps/mobile/bank-app && pnpm check-all` — lint, type-check, translation lint, and Jest tests.
- `cd platforms/ballerine && pnpm install && pnpm test` — run Nx-managed tests.
- `cd platforms/midaz && make test` or `make build` — run Go tests or build Midaz components.
- `cd services/security/mfa-service && make run` — start a first-party Go service locally.

Use each component’s `README.md`, `Makefile`, or `package.json` for additional commands.

## Coding Style & Naming Conventions

Match the local tooling of the folder you edit. TypeScript/React areas use Prettier and ESLint; mobile code uses single quotes and `kebab-case` filenames. Ballerine uses 2-space indentation. Go services should stay `gofmt`-formatted and pass `golangci-lint` where configured.

Prefer `kebab-case` for directories, descriptive package names, and focused changes. Keep generated files, logs, and build artifacts out of version control.

## Testing Guidelines

Place cross-system tests in `tests/e2e/`, `tests/integration/`, `tests/performance/`, or `tests/security/`, grouped by domain such as `tests/integration/payment-domain/`. Keep unit tests next to the code when that package already follows that pattern.

Use the package-native test runner: `jest` for the mobile app, `nx`/Jest or Vitest in Ballerine, and `go test ./...` or `make test` for Go services. Name JS/TS tests `*.test.ts(x)` or `*.spec.ts(x)`; name Go tests `*_test.go`.

## Commit & Pull Request Guidelines

Recent history favors short, imperative subjects such as `restructure` or `adapt Stripe payment`. Where commitlint is enabled, prefer Conventional Commits, for example `feat(mobile): add bill payment receipt`.

Keep PRs focused and include: a clear summary, impacted paths, local verification steps, linked issues, and screenshots for UI changes. Call out config, schema, or infrastructure changes explicitly.

## Security & Configuration Tips

Never commit secrets, `.env` files, tokens, or generated credentials. Treat payment, auth, and gateway changes as sensitive; document required environment variables in the relevant component README instead of hardcoding values.
