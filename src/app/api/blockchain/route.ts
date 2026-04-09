import { NextResponse } from 'next/server'
import { mineBlock, createGenesisBlock, verifyChain, Block } from '@/lib/blockchain'

// In-memory chain for demo (persists across API calls in dev)
const globalChain = globalThis as unknown as { blockChain: Block[] }
if (!globalChain.blockChain) {
  globalChain.blockChain = [createGenesisBlock()]
}

export async function GET() {
  const isValid = verifyChain(globalChain.blockChain)
  return NextResponse.json({
    chain: globalChain.blockChain,
    length: globalChain.blockChain.length,
    isValid,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type, data } = body

  const chain = globalChain.blockChain
  const previousBlock = chain[chain.length - 1]
  const newBlock = mineBlock(
    previousBlock.index + 1,
    { type, ...data, recordedAt: new Date().toISOString() },
    previousBlock.hash,
    2 // difficulty
  )

  chain.push(newBlock)

  return NextResponse.json({
    success: true,
    block: newBlock,
    chainLength: chain.length,
    isValid: verifyChain(chain),
  })
}
