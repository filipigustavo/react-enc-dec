import { useEffect, useMemo, useState } from 'react'

import HashGenerator from './HashGenerator'
import { getKey, NOT_ALLOWED_KEY, testKey } from './helpers'
import { parseSecurity, readIndex, writeIndex } from './storage'
import type { TClear, TDec, TEnc, TErrorContext, TRemove, TRenew, TUseHash } from './types'
import AbstractGenerator from './AbstractGenerator'

const defaultOnError = (): void => undefined

/**
 * React hook for encrypting and managing hidden values in localStorage.
 *
 * Each instance creates a namespace (`globalPrefix` + `prefix`) with a persisted
 * security hash and an index of user keys. Values are encrypted with AES using
 * a passphrase derived from the security hash parts.
 *
 * @example
 * ```tsx
 * const { enc, dec, index, remove } = useHash({ prefix: 'app' })
 *
 * enc('token', 'secret-value')
 * const result = dec('token')
 * if (result.status === 'ok') {
 *   console.log(result.value)
 * }
 * ```
 */
const useHash: TUseHash = ({
  globalPrefix = 'ed',
  prefix = '',
  Generator = HashGenerator,
  onError = defaultOnError,
} = {}) => {
  const securityKey = getKey({ globalPrefix, prefix, key: 'security' })
  const indexKey = getKey({ globalPrefix, prefix, key: 'index' })
  const HGen = useMemo(
    () => new Generator(securityKey),
    [securityKey, Generator]
  ) as AbstractGenerator<any>

  const [secKey, setSecKey] = useState(() => {
    const gen = new Generator(securityKey) as AbstractGenerator<any>
    return parseSecurity(gen, securityKey).secKey
  })

  const [index, setIndex] = useState<string[]>(() => readIndex(indexKey))

  useEffect(() => {
    const { secKey: key } = parseSecurity(HGen, securityKey)
    setSecKey(key)
    setIndex(readIndex(indexKey))
  }, [securityKey, indexKey, HGen])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === securityKey && event.newValue) {
        try {
          const parts = JSON.parse(event.newValue)
          setSecKey(HGen.handleHash(parts))
        } catch {
          onError(new Error('SECURITY_CORRUPTED'), 'security')
        }
      }

      if (event.key === indexKey) {
        setIndex(readIndex(indexKey))
      }
    }

    globalThis.addEventListener('storage', onStorage)
    return () => globalThis.removeEventListener('storage', onStorage)
  }, [securityKey, indexKey, HGen, onError])

  const reportError = (error: unknown, context: TErrorContext): void => {
    const normalized = error instanceof Error ? error : new Error(String(error))
    onError(normalized, context)
  }

  const enc: TEnc = (key, value) => {
    try {
      testKey(key)
      const itemKey = getKey({ globalPrefix, prefix, key })
      HGen.handleEncrypt(itemKey, value, secKey)

      setIndex((prev) => {
        if (prev.includes(key)) {
          return prev
        }

        const next = [...prev, key]
        writeIndex(indexKey, next)
        return next
      })
    } catch (error) {
      reportError(error, 'key')
    }
  }

  const dec: TDec = (key) => {
    try {
      testKey(key)
      const itemKey = getKey({ globalPrefix, prefix, key })
      const encrypted = globalThis.localStorage.getItem(itemKey)

      if (!encrypted) {
        return { status: 'missing' }
      }

      const decrypted = HGen.handleDecrypt(itemKey, secKey)

      if (!decrypted) {
        const decryptError = new Error('DECRYPT_FAILED')
        reportError(decryptError, 'decrypt')
        return { status: 'error', error: decryptError }
      }

      return { status: 'ok', value: decrypted }
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error))
      reportError(normalized, 'decrypt')
      return { status: 'error', error: normalized }
    }
  }

  const remove: TRemove = (key) => {
    try {
      testKey(key)
      const itemKey = getKey({ globalPrefix, prefix, key })
      HGen.handleRemove(itemKey)

      setIndex((prev) => {
        const next = prev.filter((item) => item !== key)
        writeIndex(indexKey, next)
        return next
      })
    } catch (error) {
      reportError(error, 'key')
    }
  }

  const renew: TRenew = () => {
    try {
      if (!secKey) {
        reportError(new Error('HASH_NOT_READY'), 'renew')
        return
      }

      const raw = globalThis.localStorage.getItem(securityKey)

      if (!raw) {
        reportError(new Error('SECURITY_NOT_FOUND'), 'renew')
        return
      }

      let parsedCurrent: unknown

      try {
        parsedCurrent = JSON.parse(raw)
      } catch {
        reportError(new Error('SECURITY_CORRUPTED'), 'security')
        return
      }

      const currentKey = HGen.handleHash(parsedCurrent)
      const newHashs = HGen.generateHashParts()
      const newKey = HGen.handleHash(newHashs)

      index.forEach((userKey) => {
        const itemKey = getKey({ globalPrefix, prefix, key: userKey })
        const decryptedValue = HGen.handleDecrypt(itemKey, currentKey)
        const encrypted = HGen.encryptToString(decryptedValue, newKey)
        globalThis.localStorage.setItem(itemKey, encrypted)
      })

      HGen.persistData(newHashs)
      setSecKey(newKey)
    } catch (error) {
      reportError(error, 'renew')
    }
  }

  const clear: TClear = () => {
    try {
      index.forEach((userKey) => {
        HGen.handleRemove(getKey({ globalPrefix, prefix, key: userKey }))
      })
      writeIndex(indexKey, [])
      setIndex([])
    } catch (error) {
      reportError(error, 'index')
    }
  }

  return { index, enc, dec, remove, renew, clear }
}

export default useHash
export { NOT_ALLOWED_KEY }
