import { Currency, Token } from '@swipewallet/swipeswap-sdk'

export function currencyId(currency: Currency): string {
    if (currency === Currency.ETHER) return 'ETH'
    if (currency instanceof Token) return currency.address
    throw new Error('invalid currency')
}
