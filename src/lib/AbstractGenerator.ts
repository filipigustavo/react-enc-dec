import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'

import { INVALID_VALUE } from './helpers'
import type {
  TGenerateHashParts,
  THandleDecrypt,
  THandleEncrypt,
  THandleHash,
  THandleRemove,
  TStorageValue,
} from './types'

/**
 * Serializes a storage value to a string payload for AES encryption.
 *
 * @throws {Error} When value is `undefined` or a function (`INVALID_VALUE`).
 */
function serializeValue(value: TStorageValue): string {
  if (value === undefined || typeof value === 'function') {
    throw new Error(INVALID_VALUE)
  }

  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value)
}

/**
 * Base class for security hash generation and AES encryption helpers.
 *
 * Extend this class to customize how hash parts are generated and combined
 * into the passphrase used by {@link useHash}.
 *
 * @example
 * ```ts
 * class MyGenerator extends AbstractGenerator<string[]> {
 *   generateHashParts = () => ['1', '2', '3']
 *   handleHash = (parts) => [...parts].sort().join('')
 * }
 * ```
 */
abstract class AbstractGenerator<H> {
  /**
   * @param security - Full localStorage key where hash parts are persisted.
   */
  constructor(public security: string) {}

  /**
   * Persists hash parts in localStorage under the security key.
   */
  persistData = (hashParts: H): void => {
    globalThis.localStorage.setItem(this.security, JSON.stringify(hashParts))
  }

  /** Generates new hash parts. Called when no security entry exists. */
  abstract generateHashParts: TGenerateHashParts<H>

  /**
   * Derives the AES passphrase from persisted hash parts.
   * Must not mutate `hashParts`.
   */
  abstract handleHash: THandleHash<H>

  /**
   * Returns an AES-encrypted string without writing to localStorage.
   */
  encryptToString = (value: string, passPhrase: string): string => {
    return AES.encrypt(value, passPhrase).toString()
  }

  /**
   * Encrypts a value and stores it in localStorage.
   */
  handleEncrypt: THandleEncrypt = (key, value, passPhrase) => {
    const payload = serializeValue(value)
    globalThis.localStorage.setItem(key, this.encryptToString(payload, passPhrase))
  }

  /**
   * Decrypts a value from localStorage. Returns an empty string when missing or invalid.
   */
  handleDecrypt: THandleDecrypt = (key, passPhrase) => {
    const encrypted = globalThis.localStorage.getItem(key) ?? ''
    return AES.decrypt(encrypted, passPhrase).toString(Utf8)
  }

  /** Removes an entry from localStorage. */
  handleRemove: THandleRemove = (key) => {
    globalThis.localStorage.removeItem(key)
  }
}

export default AbstractGenerator
