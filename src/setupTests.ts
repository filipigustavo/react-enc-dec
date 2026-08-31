import '@testing-library/jest-dom'

const storageStore = new Map<string, string>()

const localStorageMock: Storage = {
  get length() {
    return storageStore.size
  },
  clear() {
    storageStore.clear()
  },
  getItem(key: string) {
    return storageStore.get(key) ?? null
  },
  key(index: number) {
    return [...storageStore.keys()][index] ?? null
  },
  removeItem(key: string) {
    storageStore.delete(key)
  },
  setItem(key: string, value: string) {
    storageStore.set(key, String(value))
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
})
