import type { TDec, TStorageValue } from './lib'

type TProps = {
  keys: string[]
  onRemove: (key: string) => void
}

const RemoveItem = ({ keys, onRemove }: TProps) => {
  const handleRemove = (key: string) => () => {
    onRemove(key)
    globalThis.dispatchEvent(new CustomEvent('update-localstorage'))
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row">
          <div className="col-12">
            <h4>Remove data from localStorage</h4>
            {!keys.length ? (
              <p>Save some keys</p>
            ) : (
              keys.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="btn btn-danger me-1"
                  onClick={handleRemove(item)}
                >
                  {item}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemoveItem
