import fs from 'node:fs';
import path from 'node:path';

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/**
 * Format a date string or Date object into a readable format.
 */
export function formatDate(value, locale = 'en-US', options = { year: 'numeric', month: 'short', day: '2-digit' }) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a numeric value as currency.
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  if (amount === null || amount === undefined || amount === '') return '';
  const num = Number(amount);
  if (Number.isNaN(num)) return String(amount);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(num);
}

/**
 * Format a number with locale thousand separators.
 */
export function formatNumber(value, locale = 'en-US', options = {}) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Escape HTML special characters.
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Safely convert newlines to <br> tags after escaping HTML.
 */
export function nl2br(text) {
  return escapeHtml(text).replace(/\r?\n/g, '<br />');
}

/**
 * Resolve an image source: pass through HTTP(S) URLs and data URIs,
 * or convert a local file path to a base64 data URI for reliable Puppeteer rendering.
 */
export function imageToDataUri(src) {
  if (!src) return '';
  if (/^(https?:|data:)/i.test(src)) return src;

  const resolvedPath = path.resolve(src);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Image asset not found: ${resolvedPath}`);
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  const base64 = fs.readFileSync(resolvedPath).toString('base64');
  return `data:${mime};base64,${base64}`;
}

/**
 * Deep merge plain objects (arrays are replaced, not concatenated).
 */
export function deepMerge(target = {}, source = {}) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return source !== undefined ? source : target;
  }

  const output = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === 'object' &&
      !Array.isArray(output[key])
    ) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

export const templateHelpers = {
  formatDate,
  formatCurrency,
  formatNumber,
  escapeHtml,
  nl2br,
  imageToDataUri,
};
