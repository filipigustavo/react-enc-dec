import { useEffect, useState } from 'react'

const isSystemKey = (key: string): boolean => key.endsWith('_index') || key.endsWith('_security')

const getLocalData = (): string => {
  const local: Record<string, string> = { ...globalThis.localStorage }

  Object.keys(local)
    .filter((item) => !!item)
    .forEach((item) => {
      if (isSystemKey(item)) {
        delete local[item]
      }
    })

  return JSON.stringify(local, null, 2)
}

const LocalstorageContent = () => {
  const [local, setLocal] = useState(getLocalData)

  useEffect(() => {
    const handleChangeLocalstorage = () => setLocal(getLocalData())

    globalThis.addEventListener('update-localstorage', handleChangeLocalstorage)

    return () => {
      globalThis.removeEventListener('update-localstorage', handleChangeLocalstorage)
    }
  }, [])

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">localStorage content</h5>
        <pre>{local}</pre>
      </div>
    </div>
  )
}

export default LocalstorageContent
