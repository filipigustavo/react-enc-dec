import { v4 as uuidv4 } from 'uuid'
import MD5 from 'crypto-js/md5'
import { LoremIpsum } from 'lorem-ipsum'

import AbstractGenerator from './AbstractGenerator'
import type { TGenerateHashParts, THandleHash, THashKeys } from './types'

const lorem = new LoremIpsum()

/**
 * Default security hash generator used by {@link useHash}.
 *
 * Persists five MD5-derived parts keyed by random lorem words and derives
 * the passphrase from sorted hash values.
 */
class HashGenerator extends AbstractGenerator<THashKeys> {
  generateHashParts: TGenerateHashParts<THashKeys> = () => {
    const keys: string[] = lorem.generateWords(5).split(' ')
    const initialHash: string = uuidv4()
    const hashs: THashKeys = {}

    initialHash.split('-').forEach((item: string, index: number) => {
      hashs[keys[index]] = MD5(item).toString()
    })

    return hashs
  }

  handleHash: THandleHash<THashKeys> = (localhashs: THashKeys) => {
    return Object.keys(localhashs)
      .sort()
      .map((key) => localhashs[key])
      .join('')
  }
}

export default HashGenerator
