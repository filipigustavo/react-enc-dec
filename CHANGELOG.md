## 0.2.0 (August 30, 2026)

### Breaking changes

- `index` is now `string[]` (reactive user keys) instead of the localStorage key name.
- `dec` returns `TDecResult` (`ok` | `missing` | `error`) instead of `string`.
- `notAllowedKeyCallback` replaced by `onError(error, context)`.
- Default error handler is a silent no-op (no `alert`).
- `enc` accepts `TStorageValue` and serializes non-string values with `JSON.stringify`.

### Added

- Lazy initialization of security hash on first render (no empty passphrase race).
- `parseSecurity`, `readIndex`, `writeIndex`, and `safeParse` utilities.
- Multi-tab sync for `security` and `index` via the `storage` event.
- Vitest test suite for helpers and `useHash`.
- JSDoc/TSDoc on public API types and exports.
- npm-focused README with API reference and migration guide.

### Fixed

- `renew()` no longer crashes when security data is missing or corrupted.
- `testKey` uses exact match for reserved keys (`index`, `security`).
- `clear()` writes an empty index in a single operation.
- `HashGenerator.handleHash` sorts keys before building the passphrase.
- Custom generators no longer mutate persisted arrays in `handleHash`.

### Changed

- Index management moved from `AbstractGenerator` to `useHash`.
- Runtime dependencies (`crypto-js`, `uuid`, `lorem-ipsum`) listed in `dependencies`.
- CI runs `pack`, `build`, and `test` before deploy.

## 0.1.1 (August 20, 2025)

Fix README file.

## 0.1.0 (August 20, 2025)

New package generated with all the corrections needed to be correctly installed by users.
