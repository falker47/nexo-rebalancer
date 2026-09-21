export function calculateRebalance({
  quantity,
  currentPct,
  targetPct,
  price = null
}) {
  const qty = Number(quantity);
  const current = Number(currentPct);
  const target = Number(targetPct);
  const eurPrice = price === '' || price == null ? null : Number(price);

  if (!Number.isFinite(qty) || qty < 0) {
    throw new Error('NEXO quantity must be a non-negative number.');
  }
  if (!Number.isFinite(current) || current <= 0 || current > 100) {
    throw new Error('Current allocation must be greater than 0% and at most 100%.');
  }
  if (!Number.isFinite(target) || target <= 0 || target > 100) {
    throw new Error('Target allocation must be greater than 0% and at most 100%.');
  }
  if (eurPrice !== null && (!Number.isFinite(eurPrice) || eurPrice <= 0)) {
    throw new Error('Price must be positive when provided.');
  }

  // If NEXO currently represents current% of total portfolio value,
  // the target NEXO quantity is Q * target/current.
  // Price cancels out; it is needed only for the optional EUR estimate.
  const targetQuantity = qty * (target / current);
  const tokenDelta = targetQuantity - qty;
  const euroDelta = eurPrice === null ? null : tokenDelta * eurPrice;

  return {
    targetQuantity,
    tokenDelta,
    euroDelta,
    action: Math.abs(tokenDelta) < 1e-10
      ? 'balanced'
      : tokenDelta > 0
        ? 'buy'
        : 'sell'
  };
}
