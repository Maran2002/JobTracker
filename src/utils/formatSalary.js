/**
 * Currency symbol map — extend as needed.
 */
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  CAD: 'CA$',
  AUD: 'A$',
  SGD: 'S$',
  CHF: 'CHF ',
  AED: 'AED ',
  MXN: 'MX$',
  BRL: 'R$',
  ZAR: 'R',
  SEK: 'kr ',
  NOK: 'kr ',
  DKK: 'kr ',
};

/**
 * Format a salary string with the appropriate currency symbol.
 *
 * Examples:
 *   formatSalary('80000', 'USD')          → '$80000'
 *   formatSalary('80,000 - 100,000', 'GBP') → '£80,000 - 100,000'
 *   formatSalary('Not Disclosed', 'USD')  → 'Not Disclosed'
 *   formatSalary('', 'INR')               → 'Not Disclosed'
 *
 * @param {string} salary   - raw salary value from the database
 * @param {string} currency - ISO 4217 currency code (default 'USD')
 * @returns {string}
 */
export const formatSalary = (salary, currency = 'INR') => {
  if (!salary || salary.trim() === '' || salary === 'Not Disclosed') {
    return 'Not Disclosed';
  }
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol} ${salary}`;
};
