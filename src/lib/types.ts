import type AbstractGenerator from './AbstractGenerator'

/**
 * Hash parts persisted in localStorage by the default {@link HashGenerator}.
 */
export type THashKeys = {
  [key: string]: string
}

/**
 * Values accepted by {@link TEnc}. Non-string values are serialized with `JSON.stringify`.
 */
export type TStorageValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[]

/**
 * Successful decryption result.
 */
export type TDecResultOk = {
  /** Discriminator for a successful decryption. */
  status: 'ok'
  /** Decrypted value as a string. */
  value: string
}

/**
 * Result when the storage key does not exist.
 */
export type TDecResultMissing = {
  /** Discriminator for a missing key. */
  status: 'missing'
}

/**
 * Result when decryption fails or an operational error occurs.
 */
export type TDecResultError = {
  /** Discriminator for a decryption or operational error. */
  status: 'error'
  /** Error describing what went wrong. */
  error: Error
}

/**
 * Discriminated union returned by {@link TDec}.
 */
export type TDecResult = TDecResultOk | TDecResultMissing | TDecResultError

/**
 * Context passed to {@link TUseHashParams.onError} to identify where an error occurred.
 */
export type TErrorContext = 'key' | 'security' | 'index' | 'decrypt' | 'renew'

/**
 * Encrypts a value and stores it in localStorage under the namespaced key.
 */
export type TEnc = (key: string, value: TStorageValue) => void

/**
 * Decrypts a value from localStorage. Returns a discriminated union describing the outcome.
 */
export type TDec = (key: string) => TDecResult

/**
 * Removes a user key and its encrypted value from localStorage and the index.
 */
export type TRemove = (key: string) => void

/**
 * Regenerates the security hash and re-encrypts all indexed values.
 */
export type TRenew = () => void

/**
 * Removes all encrypted values for this namespace and clears the index list.
 * Does not remove the security hash or the index storage key itself.
 */
export type TClear = () => void

/**
 * Return value of the {@link useHash} hook.
 */
export type TUseHashResult = {
  /**
   * Reactive list of user keys stored in this namespace.
   */
  index: string[]
  enc: TEnc
  dec: TDec
  remove: TRemove
  renew: TRenew
  clear: TClear
}

/**
 * Configuration options for {@link useHash}.
 */
export type TUseHashParams<H> = {
  /**
   * Global prefix for localStorage keys. Defaults to `"ed"`.
   */
  globalPrefix?: string
  /**
   * Namespace prefix combined with `globalPrefix`. Defaults to `""`.
   */
  prefix?: string
  /**
   * Custom generator class for security hash parts. Defaults to the built-in HashGenerator.
   */
  Generator?: new (security: string) => AbstractGenerator<H>
  /**
   * Unified error handler for operational failures.
   * Defaults to a silent no-op.
   */
  onError?: (error: Error, context: TErrorContext) => void
}

/**
 * React hook that manages encrypted localStorage for a namespace.
 */
export type TUseHash = <H>(params?: TUseHashParams<H>) => TUseHashResult

/**
 * Generates the hash parts persisted in localStorage.
 */
export type TGenerateHashParts<H> = () => H

/**
 * Derives the passphrase used for AES encryption from persisted hash parts.
 * Must be a pure function — do not mutate `hashParts`.
 */
export type THandleHash<H> = (hashParts: H) => string

/**
 * Encrypts and persists a value under a storage key.
 */
export type THandleEncrypt = (key: string, value: TStorageValue, passPhrase: string) => void

/**
 * Decrypts a value from a storage key.
 */
export type THandleDecrypt = (key: string, passPhrase: string) => string

/**
 * Removes a value from localStorage.
 */
export type THandleRemove = (key: string) => void

/**
 * Builds a namespaced localStorage key.
 */
export type TGetKey = (params: {
  globalPrefix?: string
  prefix?: string
  key: string
}) => string
