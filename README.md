# 🦁 Nexo Platinum Rebalancer

> **A PWA (Progressive Web App) tool to maintain the Platinum Tier on Nexo by optimizing market fluctuations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Stable](https://img.shields.io/badge/Status-Stable-success.svg)]()
[![Privacy: Local](https://img.shields.io/badge/Privacy-100%25_Local-blue.svg)]()

This tool calculates the exact amount of NEXO tokens to sell or buy to maintain a target percentage (e.g., 10%) of your total portfolio. It addresses the **portfolio invariance** mathematical problem: it calculates rebalancing while considering that the swapped capital remains within the ecosystem (does not leave the wallet).

🔗 **[Open Web App](https://falker47.github.io/nexo-rebalancer/)**

---

## 🚀 Features

* **📊 Real Differential Calculation:** It doesn't just calculate 10% of the current value but simulates the *post-swap* portfolio to ensure the target is mathematically achieved.
* **🛡️ Safety Buffer:** Allows setting an "over-platinum" target (e.g., 10.5%) to absorb volatility and exchange fees without losing the tier.
* **📡 Live Price Fetching:** Retrieves real-time `NEXO/EUR` price via public API (CoinGecko).
* **🔒 Privacy-First:** No database, no backend. Data (token quantity) is saved only in your browser's `localStorage`.
* **📱 PWA Ready:** Installable on iOS and Android as a native application (works offline).

---

## 🧮 Mathematical Logic

The calculator uses the following logic to determine the delta to swap, assuming the **Total Portfolio Value ($V_{tot}$)** remains constant during the swap (asset A $\leftrightarrow$ asset B).

1.  **Extract Implicit $V_{tot}$:**
    $$V_{tot} = \frac{Q_{nexo} \cdot P_{market}}{(\%_{current} / 100)}$$
2.  **Calculate Target Value ($V_{target}$):**
    $$V_{target} = V_{tot} \cdot \%_{desired}$$
3.  **Calculate Delta ($Q_{delta}$):**
    $$Q_{delta} = \frac{(Q_{nexo} \cdot P_{market}) - V_{target}}{P_{market}}$$

---

## 🛠️ Tech Stack

* **Core:** HTML5, CSS3 (Responsive Grid), Vanilla JavaScript (ES6+).
* **API:** [CoinGecko Simple Price API](https://www.coingecko.com/en/api).
* **PWA:** Custom Service Worker for caching and offline support.

---

## 📦 Installation and Usage

### Method 1: Web App (Recommended)
1.  Visit the project link via mobile browser (Chrome/Safari).
2.  Tap "Share" (iOS) or Menu (Android) -> **"Add to Home Screen"**.
3.  Launch the app from the created icon.

### Method 2: Local (Dev)
```bash
# Clone the repository
git clone https://github.com/falker47/nexo-rebalancer.git

# Enter the folder
cd nexo-rebalancer

# Open index.html with any browser
```
---

## ⚠️ Disclaimer
This software is provided "as is", without warranty of any kind.

The author is not affiliated with Nexo.

This tool does not provide financial advice.

CoinGecko APIs are public and may be subject to rate-limiting.

Always check calculations before executing large orders.

Made with ❤️ by Falker47
