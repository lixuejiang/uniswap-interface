import { Currency, CurrencyAmount, Price, Token } from 'xiabing-uniswap-sdk-core'
import { useMemo } from 'react'
import { USDC } from '../constants/tokens'
import { useV2TradeExactOut } from './useV2Trade'
import { useBestV3TradeExactOut } from './useBestV3Trade'
import { useActiveWeb3React } from './web3'

// USDC amount used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const USDC_CURRENCY_AMOUNT_OUT = CurrencyAmount.fromRawAmount(USDC, 100_000e6)

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price<Currency, Token> | undefined {
  const { chainId } = useActiveWeb3React()

  const v2USDCTrade = useV2TradeExactOut(currency, chainId === 1 ? USDC_CURRENCY_AMOUNT_OUT : undefined, {
    maxHops: 2,
  })
  const v3USDCTrade = useBestV3TradeExactOut(currency, chainId === 1 ? USDC_CURRENCY_AMOUNT_OUT : undefined)

  return useMemo(() => {
    if (!currency || !chainId) {
      return undefined
    }

    // return some fake price data for non-mainnet
    if (chainId !== 1) {
      const fakeUSDC = new Token(chainId, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'fUSDC', 'Fake USDC')
      return new Price(
        currency,
        fakeUSDC,
        10 ** Math.max(0, currency.decimals - 6),
        15 * 10 ** Math.max(6 - currency.decimals, 0)
      )
    }

    // handle usdc
    if (currency?.wrapped.equals(USDC)) {
      return new Price(USDC, USDC, '1', '1')
    }

    // use v2 price if available, v3 as fallback
    if (v2USDCTrade) {
      const { numerator, denominator } = v2USDCTrade.route.midPrice
      return new Price(currency, USDC, denominator, numerator)
    } else if (v3USDCTrade.trade) {
      const { numerator, denominator } = v3USDCTrade.trade.route.midPrice
      return new Price(currency, USDC, denominator, numerator)
    }

    return undefined
  }, [chainId, currency, v2USDCTrade, v3USDCTrade])
}

export function useUSDCValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
  const price = useUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || !currencyAmount) return null
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, price])
}
