/**
 * Clears localStorage in test environments.
 */
export function resetLocalStorage(): void {
  const storage = globalThis.localStorage

  if (typeof storage.clear === 'function') {
    storage.clear()
    return
  }

  for (let i = storage.length - 1; i >= 0; i -= 1) {
    const key = storage.key(i)
    if (key) {
      storage.removeItem(key)
    }
  }
}
