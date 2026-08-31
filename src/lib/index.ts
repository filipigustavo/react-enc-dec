/**
 * @packageDocumentation
 * React hook and utilities for hiding values in localStorage with AES encryption.
 *
 * @module @filipigustavo/react-enc-dec
 */

import useHash, { NOT_ALLOWED_KEY } from './useHash'
import AbstractGenerator from './AbstractGenerator'

export { useHash, AbstractGenerator, NOT_ALLOWED_KEY }

export type {
  THashKeys,
  TStorageValue,
  TDecResult,
  TDecResultOk,
  TDecResultMissing,
  TDecResultError,
  TErrorContext,
  TEnc,
  TDec,
  TRemove,
  TRenew,
  TClear,
  TUseHashResult,
  TUseHashParams,
  TUseHash,
  TGenerateHashParts,
  THandleHash,
  THandleEncrypt,
  THandleDecrypt,
  THandleRemove,
  TGetKey,
} from './types'
