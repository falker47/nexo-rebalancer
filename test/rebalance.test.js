import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRebalance } from '../js/rebalance.js';

test('sell amount is independent of token price', () => {
  const noPrice = calculateRebalance({
    quantity: 1000,
    currentPct: 12.5,
    targetPct: 10
  });
  const withPrice = calculateRebalance({
    quantity: 1000,
    currentPct: 12.5,
    targetPct: 10,
    price: 0.70
  });

  assert.equal(noPrice.action, 'sell');
  assert.equal(noPrice.targetQuantity, 800);
  assert.equal(noPrice.tokenDelta, -200);
  assert.equal(noPrice.euroDelta, null);

  assert.equal(withPrice.tokenDelta, -200);
  assert.ok(Math.abs(withPrice.euroDelta + 140) < 1e-9);
});

test('buy amount reaches the requested total-portfolio share', () => {
  const result = calculateRebalance({
    quantity: 1000,
    currentPct: 8,
    targetPct: 10
  });

  assert.equal(result.action, 'buy');
  assert.equal(result.targetQuantity, 1250);
  assert.equal(result.tokenDelta, 250);
});

test('already aligned portfolio is balanced', () => {
  const result = calculateRebalance({
    quantity: 1234.5,
    currentPct: 10.5,
    targetPct: 10.5
  });

  assert.equal(result.action, 'balanced');
  assert.equal(result.tokenDelta, 0);
});

test('invalid percentage inputs are rejected', () => {
  assert.throws(
    () => calculateRebalance({ quantity: 100, currentPct: 0, targetPct: 10 }),
    /Current allocation/
  );
  assert.throws(
    () => calculateRebalance({ quantity: 100, currentPct: 10, targetPct: 101 }),
    /Target allocation/
  );
});
