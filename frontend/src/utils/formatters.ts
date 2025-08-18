/**
 * Format a number as currency with comma separators for thousands
 * @param amount - The amount to format (in cents)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, options?: {
  showCents?: boolean;
  currency?: string;
}): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  const { showCents = true, currency = '$' } = options || {};
  
  // Amount is already in dollars, no conversion needed
  const dollars = amount;
  
  if (showCents) {
    return `${currency}${dollars.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else {
    return `${currency}${dollars.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
};

/**
 * Format a number with comma separators for thousands
 * @param number - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (number: number, decimals: number = 2): string => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format a percentage with comma separators for thousands
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}%`;
};
