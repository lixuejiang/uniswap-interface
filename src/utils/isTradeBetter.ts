import { ZERO_PERCENT, ONE_HUNDRED_PERCENT } from '../constants/misc'
import { Percent, Currency, TradeType } from 'xiabing-uniswap-sdk-core'
import { Trade as V2Trade } from 'xiabing-uniswap-v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export function isTradeBetter(
  tradeA: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined | null,
  tradeB: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT
): boolean | undefined {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeB.outputAmount.currency.equals(tradeB.outputAmount.currency)
  ) {
    throw new Error('Comparing incomparable trades')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  } else {
    return tradeA.executionPrice.asFraction
      .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
      .lessThan(tradeB.executionPrice)
  }
}
