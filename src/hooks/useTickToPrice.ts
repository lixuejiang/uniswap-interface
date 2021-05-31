import { Token, Price } from 'xiabing-uniswap-sdk-core'
import { tickToPrice } from '@uniswap/v3-sdk'

export function getTickToPrice(
  baseToken: Token | undefined,
  quoteToken: Token | undefined,
  tick: number | undefined
): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || !tick) {
    return undefined
  }
  // @ts-ignore
  return tickToPrice(baseToken, quoteToken, tick)
}
