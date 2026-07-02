export const formatCurrency = (price: number, countryCode: string = 'GB'): { symbol: string, value: string, suffix: string } => {
  if (countryCode === 'FR') {
    // France: price is in Cents, display as Euros
    // We want the .9 style for consistency
    const euros = price / 100;
    return {
      symbol: '€',
      value: Math.floor(euros).toString(),
      suffix: '.' + (price % 100).toString().padStart(2, '0') // Not strictly .9 but actual cents
    };
  }
  
  // Default UK (Pence)
  return {
    symbol: '£', // UI usually shows symbol elsewhere, but here for completeness
    value: Math.floor(price).toString(),
    suffix: '.9p'
  };
};
