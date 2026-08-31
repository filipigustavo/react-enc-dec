import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { resetLocalStorage } from './resetLocalStorage'
import { getKey } from '../helpers'
import useHash from '../useHash'

const prefix = 'vitest'

function securityKey() {
  return getKey({ prefix, key: 'security' })
}

function indexKey() {
  return getKey({ prefix, key: 'index' })
}

describe('useHash', () => {
  beforeEach(() => {
    resetLocalStorage()
  })

  it('initializes secKey on first render', () => {
    const { result } = renderHook(() => useHash({ prefix }))

    act(() => {
      result.current.enc('init-key', 'value')
    })

    expect(result.current.dec('init-key')).toEqual({ status: 'ok', value: 'value' })
  })

  it('round-trips string values', () => {
    const { result } = renderHook(() => useHash({ prefix }))

    act(() => {
      result.current.enc('token', 'secret')
    })

    expect(result.current.dec('token')).toEqual({ status: 'ok', value: 'secret' })
  })

  it('round-trips object values via JSON serialization', () => {
    const { result } = renderHook(() => useHash({ prefix }))
    const payload = { role: 'admin', id: 1 }

    act(() => {
      result.current.enc('user', payload)
    })

    const decoded = result.current.dec('user')
    expect(decoded.status).toBe('ok')
    if (decoded.status === 'ok') {
      expect(JSON.parse(decoded.value)).toEqual(payload)
    }
  })

  it('updates index after enc, remove, and clear', () => {
    const { result } = renderHook(() => useHash({ prefix }))

    act(() => {
      result.current.enc('a', '1')
      result.current.enc('b', '2')
    })

    expect(result.current.index).toEqual(['a', 'b'])

    act(() => {
      result.current.remove('a')
    })

    expect(result.current.index).toEqual(['b'])

    act(() => {
      result.current.clear()
    })

    expect(result.current.index).toEqual([])
    expect(localStorage.getItem(indexKey())).toBe('[]')
    expect(localStorage.getItem(securityKey())).not.toBeNull()
  })

  it('returns missing status for unknown keys', () => {
    const { result } = renderHook(() => useHash({ prefix }))

    expect(result.current.dec('missing')).toEqual({ status: 'missing' })
  })

  it('rejects reserved keys', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useHash({ prefix, onError }))

    act(() => {
      result.current.enc('index', 'value')
    })

    expect(onError).toHaveBeenCalled()
  })

  it('allows myindex as a user key', () => {
    const { result } = renderHook(() => useHash({ prefix }))

    act(() => {
      result.current.enc('myindex', 'ok')
    })

    expect(result.current.dec('myindex')).toEqual({ status: 'ok', value: 'ok' })
  })

  it('renews hash and keeps values readable', () => {
    const { result } = renderHook(() => useHash({ prefix }))

    act(() => {
      result.current.enc('k1', 'v1')
      result.current.enc('k2', 'v2')
    })

    const securityBefore = localStorage.getItem(securityKey())

    act(() => {
      result.current.renew()
    })

    expect(localStorage.getItem(securityKey())).not.toBe(securityBefore)
    expect(result.current.dec('k1')).toEqual({ status: 'ok', value: 'v1' })
    expect(result.current.dec('k2')).toEqual({ status: 'ok', value: 'v2' })
  })

  it('regenerates corrupted security data', () => {
    localStorage.setItem(securityKey(), '{invalid-json')

    const { result } = renderHook(() => useHash({ prefix }))

    act(() => {
      result.current.enc('after-corruption', 'works')
    })

    expect(result.current.dec('after-corruption')).toEqual({ status: 'ok', value: 'works' })
  })

  it('reports renew errors when security is missing', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useHash({ prefix, onError }))

    act(() => {
      localStorage.removeItem(securityKey())
      result.current.renew()
    })

    expect(onError).toHaveBeenCalledWith(expect.any(Error), 'renew')
  })
})
