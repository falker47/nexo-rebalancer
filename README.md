# Nexo Rebalancer

Small client-side calculator for estimating how many **NEXO tokens** to buy or sell to move from a current NEXO portfolio share to a chosen target share.

**Live app:** https://falker47.github.io/nexo-rebalancer/

## Current Nexo assumption

As checked on **2026-09-21**, current Nexo materials describe the Platinum Loyalty Tier as requiring at least **10% NEXO** relative to the portfolio, with the tier checked on a daily snapshot. Product eligibility and benefits can have additional requirements and vary by jurisdiction.

Official references:

- Nexo — Earn on Bitcoin: https://nexo.com/earn-crypto/bitcoin
- Nexo — Loyalty-tier comparison: https://nexo.com/blog/nexo-vs-salt-lending

The default target in this app is **10.5%**. The extra 0.5 percentage points are only a user-selected volatility buffer; they are not an official Nexo requirement.

Nexo can change its rules. Check the current Nexo app/website before acting.

## What the calculator assumes

The calculation treats the entered percentages as **NEXO value / total portfolio value** and assumes a rebalance is performed by swapping assets *inside the same portfolio*, so total portfolio value stays approximately constant before fees, spread, slippage, and price movement.

If:

- `Q` = current NEXO quantity
- `c` = current NEXO share
- `t` = target NEXO share

then:

```
target NEXO quantity = Q × t / c
token delta          = target quantity - Q
```

A positive delta means **BUY**; a negative delta means **SELL**.

### Price is optional

The NEXO/EUR price cancels out of the token calculation. It is therefore **not required** to determine the NEXO quantity to rebalance.

If you enter a price manually, the app also shows an approximate EUR value for the suggested token delta.

This replaced the original automatic-price chain because its assumptions had become stale:

- CoinGecko's Demo API now requires an API key;
- the old Kraken `NEXO/EUR` fallback is not a reliable trading-price source for this app.

Keeping price optional also preserves the app's offline/privacy-first behavior.

## Features

- NEXO quantity + current/target portfolio-share calculation
- configurable target buffer
- optional EUR estimate
- local-only saved quantity and target via `localStorage`
- installable PWA
- offline calculator after assets are cached
- no backend and no account/API credentials

## Verification

The core mathematics is isolated in `js/rebalance.js` and covered by zero-dependency Node tests.

```bash
npm test
```

The test suite covers:

- sell rebalancing;
- buy rebalancing;
- already-balanced portfolios;
- price invariance of the token delta;
- invalid allocation inputs.

GitHub Actions runs syntax checks and the tests on every push to `main`.

## Local use

Because the app uses ES modules and a service worker, serve it through a local HTTP server:

```bash
python -m http.server
```

Then open `http://localhost:8000`.

## Disclaimer

This is an independent calculation utility and is **not affiliated with Nexo**.

It does not access your Nexo account, verify your actual Loyalty Tier, place trades, account for fees/slippage, or provide financial advice. Always verify the current platform rules and the values shown in your Nexo account before making a transaction.
