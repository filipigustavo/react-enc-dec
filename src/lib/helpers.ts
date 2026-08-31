import type { TGetKey } from './types'

/** Error code thrown when a reserved key name is used. */
export const NOT_ALLOWED_KEY = 'NOT_ALLOWED_KEY'

/** Error code thrown when an unsupported value is passed to enc. */
export const INVALID_VALUE = 'INVALID_VALUE'

const RESERVED_KEYS = new Set(['security', 'index'])

/**
 * Parses JSON from localStorage safely.
 *
 * @param raw - Raw string from localStorage, or null when missing.
 * @param fallback - Value returned when raw is null or invalid JSON.
 */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * Builds a namespaced localStorage key: `[globalPrefix]_[prefix]_[key]`.
 *
 * @example
 * getKey({ globalPrefix: 'ed', prefix: 'app', key: 'token' })
 * // => 'ed_app_token'
 */
export const getKey: TGetKey = ({ globalPrefix = 'ed', prefix = '', key }) =>
  `${globalPrefix}_${prefix}_${key}`

/**
 * Validates that a user key is not a reserved name (`security` or `index`).
 *
 * @throws {Error} When the key is reserved (`NOT_ALLOWED_KEY`).
 */
export function testKey(key: string): void {
  if (RESERVED_KEYS.has(key)) {
    throw new Error(NOT_ALLOWED_KEY)
  }
}
