import { generateDocument, renderDocumentHtml } from './core/documentGenerator.js';
import { moduleRegistry, ModuleRegistry } from './core/moduleRegistry.js';
import { getBrowser, closeBrowser } from './core/browserManager.js';
import { renderTemplate, renderTemplateString } from './core/templateEngine.js';
import { renderPdfFromHtml, DEFAULT_PDF_OPTIONS } from './core/pdfRenderer.js';
import { templateHelpers } from './utils/formatters.js';
import {
  APP_CODES,
  DOCUMENT_CODES,
  normalizeCode,
  resolveAppCode,
  getAppCode,
  resolveDocumentCode,
  getDocumentCode,
  isValidDocumentCode,
  getCodesByApp,
  registerAppCode,
  registerDocumentCode,
} from './helpers/documentCodes.js';

/**
 * Convenience wrapper to register a custom document module at runtime.
 */
export function registerModule(moduleDef) {
  return moduleRegistry.register(moduleDef);
}

/**
 * List all available document modules (loads built-in modules automatically).
 */
export async function listModules(filter) {
  await moduleRegistry.ensureInitialized();
  return moduleRegistry.list(filter);
}

export {
  generateDocument,
  renderDocumentHtml,
  moduleRegistry,
  ModuleRegistry,
  getBrowser,
  closeBrowser,
  renderTemplate,
  renderTemplateString,
  renderPdfFromHtml,
  DEFAULT_PDF_OPTIONS,
  templateHelpers,
  APP_CODES,
  DOCUMENT_CODES,
  normalizeCode,
  resolveAppCode,
  getAppCode,
  resolveDocumentCode,
  getDocumentCode,
  isValidDocumentCode,
  getCodesByApp,
  registerAppCode,
  registerDocumentCode,
};
