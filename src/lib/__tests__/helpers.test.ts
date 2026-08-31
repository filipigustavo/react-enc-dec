import { getKey, NOT_ALLOWED_KEY, safeParse, testKey } from '../helpers'
import { readIndex, writeIndex } from '../storage'
import { resetLocalStorage } from './resetLocalStorage'

describe('getKey', () => {
  it('builds namespaced keys', () => {
    expect(getKey({ globalPrefix: 'ed', prefix: 'app', key: 'token' })).toBe('ed_app_token')
    expect(getKey({ key: 'token' })).toBe('ed__token')
  })
})

describe('safeParse', () => {
  it('returns fallback for null and invalid JSON', () => {
    expect(safeParse(null, [])).toEqual([])
    expect(safeParse('{invalid', [])).toEqual([])
  })

  it('parses valid JSON', () => {
    expect(safeParse('["a"]', [])).toEqual(['a'])
  })
})

describe('testKey', () => {
  it('allows keys that contain reserved words as substrings', () => {
    expect(() => testKey('myindex')).not.toThrow()
    expect(() => testKey('security-token')).not.toThrow()
  })

  it('rejects exact reserved keys', () => {
    expect(() => testKey('index')).toThrow(NOT_ALLOWED_KEY)
    expect(() => testKey('security')).toThrow(NOT_ALLOWED_KEY)
  })
})

describe('readIndex / writeIndex', () => {
  beforeEach(() => {
    resetLocalStorage()
  })

  it('reads and writes index arrays', () => {
    writeIndex('ed__index', ['a', 'b'])
    expect(readIndex('ed__index')).toEqual(['a', 'b'])
  })

  it('returns empty array for invalid index data', () => {
    localStorage.setItem('ed__index', '{"not":"array"}')
    expect(readIndex('ed__index')).toEqual([])
  })
})
