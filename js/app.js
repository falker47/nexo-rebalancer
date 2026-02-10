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
            alert("To install on iOS:\n1. Tap the Share button (at the bottom center)\n2. Scroll down and select 'Add to Home Screen'");
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

    const inputs = ['nexoQty', 'nexoPrice', 'currentPct', 'targetPct'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculate);
        }
    });

    // Initial calculation in case values are loaded
    // Small delay to ensure price fetch might have updated UI, though logic depends on values
    setTimeout(calculate, 500);
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
        calculate(); // Trigger calculation after price update
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

function resetResultUI() {
    const resultBox = document.getElementById('result');
    const actionText = document.getElementById('actionText');

    // Reset classes
    resultBox.classList.remove('result-sell', 'result-buy');

    actionText.innerText = "---";
    document.getElementById('tokenValue').innerText = "---";
    document.getElementById('euroValue').innerText = "---";
    document.getElementById('bufferText').innerText = "Enter all data";

    document.getElementById('totalPortVal').innerText = "€ 0.00";
    document.getElementById('targetNexoVal').innerText = "€ 0.00";
    document.getElementById('targetLabel').innerText = "0";
}

function calculate() {
    const qtyInput = document.getElementById('nexoQty').value;
    const priceInput = document.getElementById('nexoPrice').value;
    const currentPctInput = document.getElementById('currentPct').value;
    const targetPctInput = document.getElementById('targetPct').value;

    const qty = parseFloat(qtyInput);
    const price = parseFloat(priceInput);
    const currentPct = parseFloat(currentPctInput);
    const targetPct = parseFloat(targetPctInput);

    // Strict validation: if any field is empty or NaN, reset UI
    if (isNaN(qty) || isNaN(price) || isNaN(currentPct) || isNaN(targetPct) ||
        qtyInput === '' || priceInput === '' || currentPctInput === '' || targetPctInput === '') {
        // alert("Missing or invalid data!"); // Removed to prevent annoyance on load
        resetResultUI();
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
    const actionText = document.getElementById('actionText');

    const fmtEuro = (n) => `€ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    document.getElementById('totalPortVal').innerText = fmtEuro(totalPortfolio);
    document.getElementById('targetNexoVal').innerText = fmtEuro(targetNexoValue);
    document.getElementById('targetLabel').innerText = targetPct;

    // Reset classes
    resultBox.classList.remove('result-sell', 'result-buy');

    if (Math.abs(valueToMove) < 0.01) {
        // Balanced
        actionText.innerText = "BALANCED";
        document.getElementById('tokenValue').innerText = "Ok";
        document.getElementById('euroValue').innerText = "Portfolio aligned";
        document.getElementById('bufferText').innerText = `Target: ${targetPct}%`;
    } else if (valueToMove > 0) {
        resultBox.classList.add('result-sell');
        actionText.innerText = "SELL";
        document.getElementById('tokenValue').innerText = `-${tokensToMove.toFixed(2)}`;
        document.getElementById('euroValue').innerText = `Proceeds: ${fmtEuro(valueToMove)}`;
        document.getElementById('bufferText').innerText = `Hold ${targetPct}%`;
    } else {
        const absTokens = Math.abs(tokensToMove);
        const absValue = Math.abs(valueToMove);
        resultBox.classList.add('result-buy');
        actionText.innerText = "BUY";
        document.getElementById('tokenValue').innerText = `+${absTokens.toFixed(2)}`;
        document.getElementById('euroValue').innerText = `Cost: ${fmtEuro(absValue)}`;
        document.getElementById('bufferText').innerText = `Reach ${targetPct}%`;
    }
}
