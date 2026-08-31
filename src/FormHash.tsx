import type { ReactNode } from 'react'

import ClearAll from './ClearAll'
import Getter from './Getter'
import KeyValue from './KeyValue'
import RemoveItem from './RemoveItem'
import RenewHash from './RenewHash'
import type { TUseHashParams } from './lib'
import { useHash } from './lib'

type TProps = {
  title: string
  description: ReactNode
  hashConfig?: TUseHashParams<unknown>
}

const FormHash = ({ title, description, hashConfig }: TProps) => {
  const { index, enc, dec, remove, renew, clear } = useHash(hashConfig ?? {})

  return (
    <div className="tabbed">
      <h2>{title}</h2>
      {description}
      <KeyValue onSave={enc} />
      <Getter onGet={dec} />
      <RemoveItem keys={index} onRemove={remove} />
      <RenewHash onRenew={renew} />
      <ClearAll onClear={clear} />
    </div>
  )
}

export default FormHash
