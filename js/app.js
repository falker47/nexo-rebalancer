'use strict';

import { calculateRebalance } from './rebalance.js';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('SW registered'))
            .catch(err => console.log('SW fail', err));
    });
}

// PWA Install Logic
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandaloneMode = () => (
    'standalone' in window.navigator && window.navigator.standalone
);

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.style.display = 'flex';
});

if (isIos() && !isInStandaloneMode() && installBtn) {
    installBtn.style.display = 'flex';
}

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (isIos()) {
            alert("To install on iOS:\n1. Tap the Share button\n2. Select 'Add to Home Screen'");
            return;
        }

        if (!deferredPrompt) return;
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
    });
}

window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    const savedQty = localStorage.getItem('nexo_qty');
    const savedTarget = localStorage.getItem('nexo_target');

    if (savedQty) document.getElementById('nexoQty').value = savedQty;
    if (savedTarget) document.getElementById('targetPct').value = savedTarget;

    ['nexoQty', 'nexoPrice', 'currentPct', 'targetPct'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculate);
    });

    calculate();
});

function resetResultUI(message = 'Enter quantity and allocation data') {
    const resultBox = document.getElementById('result');
    resultBox.classList.remove('result-sell', 'result-buy');

    document.getElementById('actionText').innerText = '---';
    document.getElementById('tokenValue').innerText = '---';
    document.getElementById('euroValue').innerText = '---';
    document.getElementById('bufferText').innerText = message;
}

function calculate() {
    const qtyInput = document.getElementById('nexoQty').value;
    const priceInput = document.getElementById('nexoPrice').value;
    const currentPctInput = document.getElementById('currentPct').value;
    const targetPctInput = document.getElementById('targetPct').value;

    if (qtyInput === '' || currentPctInput === '' || targetPctInput === '') {
        resetResultUI();
        return;
    }

    let result;
    try {
        result = calculateRebalance({
            quantity: qtyInput,
            price: priceInput,
            currentPct: currentPctInput,
            targetPct: targetPctInput
        });
    } catch (error) {
        resetResultUI(error.message);
        return;
    }

    const qty = Number(qtyInput);
    const targetPct = Number(targetPctInput);
    localStorage.setItem('nexo_qty', qty);
    localStorage.setItem('nexo_target', targetPct);

    const resultBox = document.getElementById('result');
    const actionText = document.getElementById('actionText');
    const tokenValue = document.getElementById('tokenValue');
    const euroValue = document.getElementById('euroValue');
    const bufferText = document.getElementById('bufferText');

    resultBox.classList.remove('result-sell', 'result-buy');

    const fmtEuro = value => '€ ' + Math.abs(value).toLocaleString('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const eurEstimate = result.euroDelta === null
        ? 'Add optional price for € estimate'
        : 'Estimated value: ' + fmtEuro(result.euroDelta);

    if (result.action === 'balanced') {
        actionText.innerText = 'BALANCED';
        tokenValue.innerText = 'OK';
        euroValue.innerText = 'Portfolio aligned';
    } else if (result.action === 'sell') {
        resultBox.classList.add('result-sell');
        actionText.innerText = 'SELL';
        tokenValue.innerText = '-' + Math.abs(result.tokenDelta).toFixed(2) + ' NEXO';
        euroValue.innerText = eurEstimate;
    } else {
        resultBox.classList.add('result-buy');
        actionText.innerText = 'BUY';
        tokenValue.innerText = '+' + result.tokenDelta.toFixed(2) + ' NEXO';
        euroValue.innerText = eurEstimate;
    }

    bufferText.innerText =
        'Target ' + targetPct + '% · projected ' + result.targetQuantity.toFixed(2) + ' NEXO';
}
