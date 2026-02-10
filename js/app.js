'use strict';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW fail', err));
    });
}

// PWA Install Logic
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// Detect iOS
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

// Check if app is in standalone mode
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    if (installBtn) installBtn.style.display = 'flex';
});

// Show button on iOS if not already installed
if (isIos() && !isInStandaloneMode() && installBtn) {
    installBtn.style.display = 'flex';
}

if (installBtn) {
    installBtn.addEventListener('click', () => {
        // iOS Logic
        if (isIos()) {
            alert("Per installare su iOS:\\n1. Tocca il tasto Condividi (in basso a centro)\\n2. Scorri e seleziona 'Aggiungi alla Schermata Home'");
            return;
        }

        // Android/Desktop Logic
        installBtn.style.display = 'none';
        // Show the prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                    // Show button again if dismissed?
                    // installBtn.style.display = 'flex';
                }
                deferredPrompt = null;
            });
        }
    });
}

window.addEventListener('appinstalled', (evt) => {
    console.log('App successfully installed');
});


// Logic
const API_URL_CG = "https://api.coingecko.com/api/v3/simple/price?ids=nexo&vs_currencies=eur";
const API_URL_KRAKEN = "https://api.kraken.com/0/public/Ticker?pair=NEXOEUR";

document.addEventListener('DOMContentLoaded', () => {
    fetchPrice();
    const savedQty = localStorage.getItem('nexo_qty');
    const savedTarget = localStorage.getItem('nexo_target');
    if (savedQty) document.getElementById('nexoQty').value = savedQty;
    if (savedTarget) document.getElementById('targetPct').value = savedTarget;

    // Event Listeners
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchPrice);
    }

    const calculateBtn = document.querySelector('.btn-calculate');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculate);
    }

    const clearBtn = document.querySelector('.btn-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearInputs);
    }
});

async function fetchPrice() {
    const priceInput = document.getElementById('nexoPrice');
    const statusLabel = document.getElementById('apiStatus');
    statusLabel.innerText = "loading...";
    priceInput.style.opacity = "0.5";

    let price = null;
    let source = "";

    // Try CoinGecko first
    try {
        price = await fetchCoinGeckoPrice();
        source = "CoinGecko";
    } catch (e) {
        console.warn("CoinGecko failed, trying Kraken...", e);
        // Try Kraken fallback
        try {
            price = await fetchKrakenPrice();
            source = "Kraken";
        } catch (e2) {
            console.error("All APIs failed", e2);
        }
    }

    if (price) {
        priceInput.value = price;
        statusLabel.innerText = `Live: ${source}`;
        statusLabel.className = "api-status status-ok";
    } else {
        statusLabel.innerText = "Error: All APIs failed";
        statusLabel.className = "api-status status-error";
    }

    priceInput.style.opacity = "1";
}

const PROXY_URL = "https://corsproxy.io/?";

async function fetchWithFallback(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Direct fetch failed");
        return await response.json();
    } catch (e) {
        console.warn("Direct fetch failed, trying proxy...", e);
        const proxyResponse = await fetch(PROXY_URL + encodeURIComponent(url));
        if (!proxyResponse.ok) throw new Error("Proxy fetch failed");
        return await proxyResponse.json();
    }
}

async function fetchCoinGeckoPrice() {
    const data = await fetchWithFallback(API_URL_CG);
    return data.nexo.eur;
}

async function fetchKrakenPrice() {
    const data = await fetchWithFallback(API_URL_KRAKEN);
    // Kraken response format: { result: { NEXOEUR: { c: ["0.954", "123.4"] } } }
    // c[0] is the last closed price
    const pairData = Object.values(data.result)[0];
    return parseFloat(pairData.c[0]);
}

function clearInputs() {
    document.getElementById('nexoQty').value = '';
    document.getElementById('nexoPrice').value = '';
    document.getElementById('currentPct').value = '';
    // Don't clear targetPct as it has a default
    // document.getElementById('targetPct').value = '10.5'; 

    document.getElementById('result').style.display = 'none';
    document.getElementById('breakdown').style.display = 'none';

    localStorage.removeItem('nexo_qty');
    // localStorage.removeItem('nexo_target'); // Keep user preference

    // Re-fetch price as it might be useful
    fetchPrice();
}

function calculate() {
    const qty = parseFloat(document.getElementById('nexoQty').value);
    const price = parseFloat(document.getElementById('nexoPrice').value);
    const currentPct = parseFloat(document.getElementById('currentPct').value);
    const targetPct = parseFloat(document.getElementById('targetPct').value);

    if (isNaN(qty) || isNaN(price) || isNaN(currentPct) || isNaN(targetPct)) {
        alert("Dati mancanti o non validi!");
        return;
    }

    localStorage.setItem('nexo_qty', qty);
    localStorage.setItem('nexo_target', targetPct);

    const nexoValueCurrent = qty * price;
    const totalPortfolio = nexoValueCurrent / (currentPct / 100);
    const targetNexoValue = totalPortfolio * (targetPct / 100);
    const valueToMove = nexoValueCurrent - targetNexoValue;
    const tokensToMove = valueToMove / price;

    const resultBox = document.getElementById('result');
    const breakdownBox = document.getElementById('breakdown');
    const actionText = document.getElementById('actionText');

    resultBox.style.display = 'block';
    breakdownBox.style.display = 'block';

    const fmtEuro = (n) => `€ ${n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    document.getElementById('totalPortVal').innerText = fmtEuro(totalPortfolio);
    document.getElementById('targetNexoVal').innerText = fmtEuro(targetNexoValue);
    document.getElementById('targetLabel').innerText = targetPct;

    // Reset classes
    resultBox.classList.remove('result-sell', 'result-buy');

    if (valueToMove > 0) {
        resultBox.classList.add('result-sell');
        actionText.innerText = "VENDI";
        document.getElementById('tokenValue').innerText = `-${tokensToMove.toFixed(2)}`;
        document.getElementById('euroValue').innerText = `Incassi: ${fmtEuro(valueToMove)}`;
        document.getElementById('bufferText').innerText = `Mantieni il ${targetPct}%`;
    } else {
        const absTokens = Math.abs(tokensToMove);
        const absValue = Math.abs(valueToMove);
        resultBox.classList.add('result-buy');
        actionText.innerText = "COMPRA";
        document.getElementById('tokenValue').innerText = `+${absTokens.toFixed(2)}`;
        document.getElementById('euroValue').innerText = `Spendi: ${fmtEuro(absValue)}`;
        document.getElementById('bufferText').innerText = `Risali al ${targetPct}%`;
    }
}
