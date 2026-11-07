# Nexo Rebalancer

Small client-side calculator for estimating how many **NEXO tokens** to buy or sell to move from a current portfolio allocation to a chosen target.

**Live app:** https://falker47.github.io/nexo-rebalancer/

## Nexo Loyalty Program

Nexo's public documentation, reviewed on **2026-11-07**, describes the Platinum Loyalty Tier as requiring a NEXO allocation of at least 10%. Its support examples express this as the value of NEXO relative to the **other assets in the portfolio**.

Nexo's updated product information also refers to real-time tier adjustments and additional eligibility conditions. Requirements, benefits, and availability can vary by product and jurisdiction.

**Important: this calculator uses a different denominator.**

The calculator defines NEXO allocation as:

`NEXO value / total portfolio value (including NEXO)`

This differs from:

`NEXO value / value of all other assets`

For example:

- NEXO worth 10% of the other assets represents approximately **9.09% of the total portfolio**.
- NEXO worth 10.5% of the total portfolio represents approximately **11.73% of the other assets**.

The app's default target of **10.5% of total portfolio value** is a configurable, illustrative buffer. It is not an official Nexo threshold or a guaranteed margin of protection.

Do not enter a percentage based on NEXO versus other assets into a field that expects NEXO versus total portfolio value without converting it first.

The calculator does not determine official Loyalty Tier eligibility. Check your actual tier, applicable conditions, and current rules directly in your Nexo account before acting.

Official references:

- [Nexo — What is the NEXO Token?](https://nexo.com/blog/what-is-nexo-token)
- [Nexo — Fixed-term Savings and Platinum requirements](https://support.nexo.com/article/how-to-earn-interest-with-fixed-term-savings)
- [Nexo — Loan FAQ and Loyalty Tier calculation example](https://support.nexo.com/article/nexo-loans-faq-uk)

## How the calculator works

The calculation assumes that the entered percentages represent **NEXO value divided by total portfolio value**, including NEXO itself.

It models a rebalance performed by swapping assets **within the same portfolio**, without adding or withdrawing funds. Total portfolio value is assumed to remain constant.

Given:

- `Q` = current NEXO quantity
- `c` = current NEXO percentage of total portfolio value
- `t` = target NEXO percentage of total portfolio value

The calculator uses:

```text
target NEXO quantity = Q × t / c
token delta          = target quantity - Q
```

The result is interpreted as:

- **BUY:** positive token delta
- **SELL:** negative token delta
- **BALANCED:** negligible calculated difference

This is a mathematical estimate, not a trade execution or verification of actual account allocation.

### Optional EUR estimate

The NEXO price cancels out of the token calculation under the fixed-portfolio assumption.

A price is therefore not required to estimate the token quantity.

If a positive NEXO/EUR price is supplied manually, the app also calculates:

```text
estimated EUR value = |token delta| × NEXO/EUR price
```

The EUR estimate is not an executable quote and excludes trading costs.

Automatic market-price retrieval is not implemented.

### Model limitations

The calculation assumes:

- A positive, internally consistent NEXO holding and current allocation.
- The same portfolio valuation basis for current and target percentages.
- No deposits, withdrawals, or external funding during rebalancing.
- Unchanged asset prices during the simulated swap.
- No trading fees, spread, slippage, or rounding effects in the mathematical result.

The model is not reliable for zero NEXO holdings or inconsistent quantity/allocation inputs. The current implementation can accept some inconsistent inputs and return a misleading result.

Displayed token quantities are rounded to two decimal places, so very small differences may not be visible.

Actual transactions can change the resulting allocation. The calculator does not guarantee that any target percentage or Loyalty Tier will be maintained.

## Features

- NEXO quantity and current/target allocation inputs
- Configurable target percentage, defaulting to 10.5%
- BUY, SELL, and BALANCED calculation results
- Optional manually entered NEXO/EUR price
- Local persistence of NEXO quantity and target percentage
- Installable Progressive Web App where supported
- Offline calculation after the required assets are cached
- No backend, Nexo account connection, or API credentials

The current allocation percentage and optional price are not saved between sessions.

## Privacy and security

All calculator inputs are processed in the browser.

The NEXO quantity and target percentage are stored in browser `localStorage`. They are not synchronized with a Nexo account and may remain accessible to anyone using the same browser profile.

The application does not request wallet credentials, private keys, or Nexo login information.

No Nexo API requests or automated transactions are implemented. Normal requests to the static hosting provider still occur when loading the application.

## Local use

The application uses JavaScript ES modules and a service worker. Serve the repository through a local HTTP server rather than opening `index.html` directly as a file.

With Python 3 installed, run from the repository root:

```bash
python -m http.server 8000
```

Open:

http://localhost:8000

A compatible browser is required for PWA installation and offline capabilities.

## Tests and verification

The calculation logic is isolated in `js/rebalance.js` and tested using Node.js's built-in test runner.

No external npm dependencies are required.

Run:

```bash
npm test
```

The automated tests cover:

- BUY and SELL calculations
- Already-balanced allocations
- Independence of token quantity from the optional price
- Selected invalid percentage inputs

GitHub Actions runs JavaScript syntax checks and the Node test suite on pushes to `main` and on pull requests.

These tests verify the calculation logic. They do not constitute end-to-end browser testing, PWA installation testing, live Nexo integration testing, or verification of financial outcomes.

## License

No explicit software license is currently included in this repository. Public availability of the source code does not itself grant a license to redistribute or modify it.

## Disclaimer

Nexo Rebalancer is an independent utility and is **not affiliated with or endorsed by Nexo**.

It does not access your Nexo account, verify your actual Loyalty Tier, execute transactions, or provide personalized financial advice.

All results are estimates based on user-supplied data and simplified assumptions. Cryptocurrency prices and platform conditions can change, and transactions may involve significant financial risk.

Always verify your account balances, eligibility, current Nexo rules, and transaction details before making financial decisions.
