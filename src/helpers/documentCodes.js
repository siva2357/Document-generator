/**
 * Application & Document Code Registry + Helpers
 *
 * External websites/services communicate with the common Document Generator
 * using short codes (e.g. "TH-CR", "WS-PAY", "CH-CERT") instead of internal
 * folder paths or template filenames.
 */

export const APP_CODES = {
  TH: 'talent-hub',
  WS: 'work-sphere',
  CH: 'course-hub',
};

export const DOCUMENT_CODES = {
  // Talent Hub (TH)
  'TH-C': 'talent-hub/contract',
  'TH-INV': 'talent-hub/invoice',
  'TH-ST': 'talent-hub/statement',
  'TH-CR': 'talent-hub/contract-report',

  // Work Sphere (WS)
  'WS-OL': 'work-sphere/offer-letter',
  'WS-PAY': 'work-sphere/payslip',
  'WS-LTR': 'work-sphere/letters',

  // Course Hub (CH)
  'CH-INV': 'course-hub/invoice',
  'CH-CERT': 'course-hub/certificate',
};

/**
 * Normalize a code string: trim, uppercase, and replace underscores/spaces with hyphens.
 * Examples: "th_inv" -> "TH-INV", " th-cr " -> "TH-CR"
 */
export function normalizeCode(code) {
  if (!code || typeof code !== 'string') return '';
  return code.trim().toUpperCase().replace(/[_\s]+/g, '-');
}

/**
 * Resolve an app code (e.g. "TH") or app name ("talent-hub") to the internal app name.
 */
export function resolveAppCode(appCodeOrName) {
  if (!appCodeOrName || typeof appCodeOrName !== 'string') return null;
  const normalized = normalizeCode(appCodeOrName);
  if (APP_CODES[normalized]) return APP_CODES[normalized];

  const lower = appCodeOrName.trim().toLowerCase();
  const knownApps = Object.values(APP_CODES);
  if (knownApps.includes(lower)) return lower;

  return null;
}

/**
 * Reverse lookup: internal app name ("talent-hub") -> app code ("TH").
 */
export function getAppCode(appName) {
  if (!appName) return null;
  const lower = String(appName).trim().toLowerCase();
  for (const [code, name] of Object.entries(APP_CODES)) {
    if (name === lower) return code;
  }
  return null;
}

/**
 * Resolve a document code into its internal module name.
 *
 * Supports:
 * - Single combined code: resolveDocumentCode('TH-CR') -> 'talent-hub/contract-report'
 * - Separate app + doc code: resolveDocumentCode('TH', 'CR') -> 'talent-hub/contract-report'
 * - Underscore/lowercase variants: resolveDocumentCode('th_inv') -> 'talent-hub/invoice'
 * - Passthrough of internal module name if already formatted as 'app/doc'
 */
export function resolveDocumentCode(codeOrApp, docCode) {
  if (!codeOrApp || typeof codeOrApp !== 'string') {
    throw new Error('Document code is required');
  }

  const combined = docCode
    ? `${normalizeCode(codeOrApp)}-${normalizeCode(docCode)}`
    : normalizeCode(codeOrApp);

  if (DOCUMENT_CODES[combined]) {
    return DOCUMENT_CODES[combined];
  }

  // Allow direct internal module names (e.g. 'talent-hub/invoice')
  if (!docCode && codeOrApp.includes('/')) {
    return codeOrApp.trim();
  }

  const available = Object.keys(DOCUMENT_CODES).join(', ');
  throw new Error(`Unknown document code "${docCode ? `${codeOrApp}-${docCode}` : codeOrApp}". Available codes: ${available}`);
}

/**
 * Reverse lookup: internal module name ("talent-hub/contract-report") -> document code ("TH-CR").
 */
export function getDocumentCode(moduleName) {
  if (!moduleName) return null;
  for (const [code, name] of Object.entries(DOCUMENT_CODES)) {
    if (name === moduleName) return code;
  }
  return null;
}

/**
 * Check if a code is a valid registered document code.
 */
export function isValidDocumentCode(codeOrApp, docCode) {
  if (!codeOrApp || typeof codeOrApp !== 'string') return false;
  const combined = docCode
    ? `${normalizeCode(codeOrApp)}-${normalizeCode(docCode)}`
    : normalizeCode(codeOrApp);
  return Boolean(DOCUMENT_CODES[combined]);
}

/**
 * Get all document code mappings belonging to a specific app code (e.g. "TH") or app name ("talent-hub").
 */
export function getCodesByApp(appCodeOrName) {
  const appName = resolveAppCode(appCodeOrName);
  if (!appName) return {};

  const result = {};
  for (const [code, moduleName] of Object.entries(DOCUMENT_CODES)) {
    if (moduleName.startsWith(`${appName}/`)) {
      result[code] = moduleName;
    }
  }
  return result;
}

/**
 * Register a new app code mapping at runtime.
 */
export function registerAppCode(appCode, appName) {
  const normalized = normalizeCode(appCode);
  if (!normalized || !appName) {
    throw new Error('registerAppCode requires both appCode and appName');
  }
  APP_CODES[normalized] = appName.trim().toLowerCase();
  return { code: normalized, app: APP_CODES[normalized] };
}

/**
 * Register a new document code mapping at runtime.
 */
export function registerDocumentCode(docCode, moduleName) {
  const normalized = normalizeCode(docCode);
  if (!normalized || !moduleName) {
    throw new Error('registerDocumentCode requires both docCode and moduleName');
  }
  DOCUMENT_CODES[normalized] = moduleName.trim();
  return { code: normalized, module: DOCUMENT_CODES[normalized] };
}
