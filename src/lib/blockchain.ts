import crypto from 'crypto'

export interface Block {
  index: number
  timestamp: string
  data: Record<string, unknown>
  previousHash: string
  hash: string
  nonce: number
}

export function calculateHash(
  index: number,
  timestamp: string,
  data: Record<string, unknown>,
  previousHash: string,
  nonce: number
): string {
  return crypto
    .createHash('sha256')
    .update(`${index}${timestamp}${JSON.stringify(data)}${previousHash}${nonce}`)
    .digest('hex')
}

export function mineBlock(
  index: number,
  data: Record<string, unknown>,
  previousHash: string,
  difficulty = 2
): Block {
  let nonce = 0
  const timestamp = new Date().toISOString()
  let hash = ''

  do {
    nonce++
    hash = calculateHash(index, timestamp, data, previousHash, nonce)
  } while (!hash.startsWith('0'.repeat(difficulty)))

  return { index, timestamp, data, previousHash, hash, nonce }
}

export function createGenesisBlock(): Block {
  return mineBlock(0, { genesis: true, platform: 'FuelGuard AI' }, '0000000000000000')
}

export function verifyChain(chain: Block[]): boolean {
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i]
    const previous = chain[i - 1]
    const recalculated = calculateHash(
      current.index,
      current.timestamp,
      current.data,
      current.previousHash,
      current.nonce
    )
    if (current.hash !== recalculated) return false
    if (current.previousHash !== previous.hash) return false
  }
  return true
}
