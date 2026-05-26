function round2(n) {
  return Math.round(n * 100) / 100;
}

function calculateLineTotal(unitPrice, quantity) {
  return round2(unitPrice * quantity);
}

function calculateTaxBreakdown(subtotal, settings) {
  const taxRate = parseFloat(settings.tax_rate ?? 23) / 100;
  const pricesIncludeTax = settings.prices_include_tax !== false;

  if (pricesIncludeTax) {
    const netSubtotal = round2(subtotal / (1 + taxRate));
    const taxAmount = round2(subtotal - netSubtotal);
    return { netSubtotal, taxAmount, grossSubtotal: subtotal, pricesIncludeTax };
  }

  const taxAmount = round2(subtotal * taxRate);
  const grossSubtotal = round2(subtotal + taxAmount);
  return { netSubtotal: subtotal, taxAmount, grossSubtotal, pricesIncludeTax };
}

function calculateCartTotals(items, shippingCost, settings) {
  const subtotal = round2(
    items.reduce((sum, item) => sum + calculateLineTotal(item.unitPrice, item.quantity), 0)
  );
  const { netSubtotal, taxAmount, grossSubtotal, pricesIncludeTax } = calculateTaxBreakdown(
    subtotal,
    settings
  );
  const shipping = round2(parseFloat(shippingCost) || 0);
  const total = round2(grossSubtotal + shipping);

  return {
    subtotal,
    netSubtotal,
    taxAmount,
    grossSubtotal,
    shipping,
    total,
    pricesIncludeTax,
    taxRate: parseFloat(settings.tax_rate ?? 23),
  };
}

module.exports = {
  round2,
  calculateLineTotal,
  calculateTaxBreakdown,
  calculateCartTotals,
};
