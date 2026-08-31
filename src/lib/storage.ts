import type AbstractGenerator from './AbstractGenerator'
import { safeParse } from './helpers'

/**
 * Returns true when `value` is an array of strings.
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/**
 * Reads and validates the index list from localStorage.
 *
 * @param indexKey - Full localStorage key for the index entry.
 * @returns Array of user keys, or an empty array when missing or invalid.
 */
export function readIndex(indexKey: string): string[] {
  const parsed = safeParse<unknown>(globalThis.localStorage.getItem(indexKey), [])
  return isStringArray(parsed) ? parsed : []
}

/**
 * Writes the index list to localStorage.
 *
 * @param indexKey - Full localStorage key for the index entry.
 * @param keys - User keys to persist.
 */
export function writeIndex(indexKey: string, keys: string[]): void {
  globalThis.localStorage.setItem(indexKey, JSON.stringify(keys))
}

/**
 * Reads security hash parts from localStorage or generates and persists new ones.
 *
 * @param HGen - Generator instance for the security key namespace.
 * @param securityKey - Full localStorage key for the security entry.
 * @returns Persisted hash parts and the derived passphrase.
 */
export function parseSecurity<H>(
  HGen: AbstractGenerator<H>,
  securityKey: string
): { parts: H; secKey: string } {
  const raw = globalThis.localStorage.getItem(securityKey)

  if (raw) {
    try {
      const parts = JSON.parse(raw) as H
      return { parts, secKey: HGen.handleHash(parts) }
    } catch {
      // Security entry is corrupted — regenerate below.
    }
  }

  const parts = HGen.generateHashParts()
  HGen.persistData(parts)
  return { parts, secKey: HGen.handleHash(parts) }
}
