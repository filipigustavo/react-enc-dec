import { useState } from 'react'

import type { TDec } from './lib'

type TProps = {
  onGet: TDec
}

const formatResult = (result: ReturnType<TDec>): string => {
  if (result.status === 'ok') {
    return `Decrypted: ${result.value}`
  }

  if (result.status === 'missing') {
    return 'Key not found in localStorage'
  }

  return `Error: ${result.error.message}`
}

const Getter = ({ onGet }: TProps) => {
  const [key, setKey] = useState<string>('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = onGet(key)
    globalThis.alert(formatResult(result))
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <form className="row" onSubmit={handleSubmit}>
          <div className="col-12 mb-3">
            <h4>Get data from localStorage</h4>
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Key (same one used to save data)</label>
            <input
              required
              placeholder="Ex.: local-key"
              className="form-control"
              onChange={(event) => setKey(event.target.value)}
            />
          </div>

          <div className="col-12">
            <button className="btn btn-primary" type="submit">Get</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Getter
