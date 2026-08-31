# @filipigustavo/react-enc-dec

React hook to hide values in `localStorage` using AES encryption and a persisted security hash.

**Live demo:** [filipigustavo.github.io/react-enc-dec](https://filipigustavo.github.io/react-enc-dec/)

## Overview

`useHash` creates a namespace in `localStorage` where values are encrypted before storage. A security hash is generated on first use, persisted under a `security` key, and transformed into the AES passphrase by your app logic. User keys are tracked in a reactive `index` array.

This library **obfuscates** data in the browser. It does not protect against XSS, DevTools, or malicious extensions. Do not use it for secrets that require server-side protection.

## Install

```bash
npm install @filipigustavo/react-enc-dec
```

**Peer dependencies:** `react` and `react-dom` ^19.x

## Quick start

```tsx
import { useState } from 'react'
import { useHash } from '@filipigustavo/react-enc-dec'

function App() {
  const { enc, dec, index, remove } = useHash({ prefix: 'app' })
  const [raw, setRaw] = useState('')
  const [decrypted, setDecrypted] = useState('')

  const handleEncrypt = () => enc('token', raw)

  const handleDecrypt = () => {
    const result = dec('token')
    if (result.status === 'ok') {
      setDecrypted(result.value)
    }
  }

  return (
    <div>
      <input value={raw} onChange={(e) => setRaw(e.target.value)} />
      <button type="button" onClick={handleEncrypt}>Encrypt</button>
      <button type="button" onClick={handleDecrypt}>Decrypt</button>
      <p>Decrypted: {decrypted}</p>
      <ul>
        {index.map((key) => (
          <li key={key}>
            {key}
            <button type="button" onClick={() => remove(key)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## How it works

1. On init, `useHash` reads or creates hash parts via `Generator.generateHashParts()`.
2. Hash parts are persisted in `localStorage` under `[globalPrefix]_[prefix]_security`.
3. `Generator.handleHash(parts)` derives the AES passphrase (not stored directly).
4. `enc` encrypts values under `[globalPrefix]_[prefix]_[yourKey]`.
5. User key names are stored in `[globalPrefix]_[prefix]_index` and exposed as reactive `index: string[]`.

## API reference

### `useHash(params?)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `globalPrefix` | `string` | `"ed"` | Prefix for all keys in this namespace |
| `prefix` | `string` | `""` | Additional namespace segment |
| `Generator` | `AbstractGenerator<H>` | `HashGenerator` | Custom hash generator class |
| `onError` | `(error, context) => void` | no-op | Error handler |

**`onError` contexts:** `key`, `security`, `index`, `decrypt`, `renew`

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `index` | `string[]` | Reactive list of user keys in this namespace |
| `enc` | `(key, value) => void` | Encrypt and store a value |
| `dec` | `(key) => TDecResult` | Decrypt a value |
| `remove` | `(key) => void` | Remove one user key and its value |
| `renew` | `() => void` | Regenerate security hash and re-encrypt all values |
| `clear` | `() => void` | Remove all user values and clear `index`; keeps `security` |

### `enc(key, value)`

- `value` accepts `string | number | boolean | null | object | array`
- Non-string values are stored via `JSON.stringify`
- Reserved user keys: `index`, `security` (exact match)

### `dec(key)` → `TDecResult`

```ts
type TDecResult =
  | { status: 'ok'; value: string }
  | { status: 'missing' }
  | { status: 'error'; error: Error }
```

```ts
const result = dec('token')
switch (result.status) {
  case 'ok':
    console.log(result.value)
    break
  case 'missing':
    console.log('Not found')
    break
  case 'error':
    console.error(result.error)
}
```

### Multiple namespaces

```ts
const defaultNs = useHash({})
const appNs = useHash({ prefix: 'my-app' })
const customNs = useHash({ globalPrefix: 'advanced', prefix: 'vault' })
```

Always use the same `globalPrefix` and `prefix` to read data from a namespace.

## Custom `Generator`

Extend `AbstractGenerator<H>` and implement:

| Method | Description |
|--------|-------------|
| `generateHashParts(): H` | Creates parts persisted in `security` |
| `handleHash(parts: H): string` | Pure function that derives the AES passphrase |

```ts
import {
  AbstractGenerator,
  type TGenerateHashParts,
  type THandleHash,
} from '@filipigustavo/react-enc-dec'

class MyGenerator extends AbstractGenerator<string[]> {
  generateHashParts: TGenerateHashParts<string[]> = () => ['1', '2', '3']

  handleHash: THandleHash<string[]> = (parts) => [...parts].sort().join('')
}

const { enc, dec } = useHash({ Generator: MyGenerator })
```

## Security limitations

- Data is hidden from casual `localStorage` inspection, not from script access.
- Anyone with access to persisted hash parts and your `handleHash` logic can decrypt values.
- XSS in your app can read encrypted data and hash parts.
- `renew` in one tab updates `security` for other tabs via the `storage` event.

## Migration from 0.1.x

| 0.1.x | 0.2.0 |
|-------|-------|
| `index: string` (storage key name) | `index: string[]` (user keys, reactive) |
| `dec(key): string` | `dec(key): TDecResult` |
| `notAllowedKeyCallback` | `onError(error, context)` |
| `enc(value: string)` | `enc(value: TStorageValue)` with auto serialization |
| Default errors via `alert()` | Default `onError` is silent |

**Before:**

```ts
const { index, dec } = useHash({ notAllowedKeyCallback: (e) => alert(e) })
const keys = JSON.parse(localStorage.getItem(index) ?? '[]')
const value = dec('token')
```

**After:**

```ts
const { index, dec } = useHash({
  onError: (error, context) => console.error(context, error),
})
index.map((key) => ...)
const result = dec('token')
if (result.status === 'ok') {
  console.log(result.value)
}
```

## License

MIT
