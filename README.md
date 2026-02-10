# 🦁 Nexo Platinum Rebalancer

> **Tool PWA (Progressive Web App) per mantenere il Tier Platinum su Nexo ottimizzando le oscillazioni di mercato.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Stable](https://img.shields.io/badge/Status-Stable-success.svg)]()
[![Privacy: Local](https://img.shields.io/badge/Privacy-100%25_Local-blue.svg)]()

Questo tool calcola l'esatta quantità di token NEXO da vendere o acquistare per mantenere una percentuale target (es. 10%) sul portafoglio totale. Risolve il problema matematico dell'**invarianza del portafoglio**: calcola il rebalancing considerando che il capitale scambiato rimane all'interno dell'ecosistema (non esce dal wallet).

🔗 **[Apri la Web App](https://falker47.github.io/nexo-rebalancer/)**

---

## 🚀 Features

* **📊 Calcolo Differenziale Reale:** Non si limita a calcolare il 10% del valore attuale, ma simula il portafoglio *post-swap* per garantire che il target venga raggiunto matematicamente.
* **🛡️ Safety Buffer (Cuscinetto):** Permette di impostare un target "over-platinum" (es. 10.5%) per assorbire la volatilità e le fee di scambio senza perdere il tier.
* **📡 Live Price Fetching:** Recupera il prezzo `NEXO/EUR` in tempo reale tramite API pubblica (CoinGecko).
* **🔒 Privacy-First:** Nessun database, nessun backend. I dati (quantità token) vengono salvati solo nel `localStorage` del tuo browser.
* **📱 PWA Ready:** Installabile su iOS e Android come applicazione nativa (funziona offline).

---

## 🧮 Logica Matematica

Il calcolatore utilizza la seguente logica per determinare il delta da scambiare, assumendo che il **Total Portfolio Value ($V_{tot}$)** rimanga costante durante lo swap (asset A $\leftrightarrow$ asset B).

1.  **Estrazione $V_{tot}$ Implicito:**
    $$V_{tot} = \frac{Q_{nexo} \cdot P_{market}}{\%_{current}}$$
2.  **Calcolo Target Value ($V_{target}$):**
    $$V_{target} = V_{tot} \cdot \%_{desired}$$
3.  **Calcolo Delta ($Q_{delta}$):**
    $$Q_{delta} = \frac{(Q_{nexo} \cdot P_{market}) - V_{target}}{P_{market}}$$

---

## 🛠️ Tech Stack

* **Core:** HTML5, CSS3 (Responsive Grid), Vanilla JavaScript (ES6+).
* **API:** [CoinGecko Simple Price API](https://www.coingecko.com/en/api).
* **PWA:** Service Worker custom per caching e offline support.

---

## 📦 Installazione e Uso

### Metodo 1: Web App (Consigliato)
1.  Visita il link del progetto tramite browser mobile (Chrome/Safari).
2.  Premi "Condividi" (iOS) o Menu (Android) -> **"Aggiungi a Schermata Home"**.
3.  Lancia l'app dall'icona creata.

### Metodo 2: Locale (Dev)
```bash
# Clona la repository
git clone [https://github.com/falker47/nexo-rebalancer.git](https://github.com/falker47/nexo-rebalancer.git)

# Entra nella cartella
cd nexo-rebalancer

# Apri index.html con un browser qualsiasi

⚠️ Disclaimer
Questo software è fornito "così com'è", senza garanzie.

L'autore non è affiliato con Nexo.

Questo tool non fornisce consulenza finanziaria.

Le API di CoinGecko sono pubbliche e potrebbero subire rate-limiting.

Controlla sempre i calcoli prima di eseguire ordini di grandi dimensioni.

Made with ❤️ by Falker47
