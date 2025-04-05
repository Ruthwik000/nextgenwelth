import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees (₹)
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, showSymbol = true, decimals = 2) {
  const formattedAmount = parseFloat(amount).toFixed(decimals);
  return `${showSymbol ? '₹' : ''}${formattedAmount}`;
}
