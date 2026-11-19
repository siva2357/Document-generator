import { moduleRegistry } from './moduleRegistry.js';
import { renderTemplate } from './templateEngine.js';
import { renderPdfFromHtml } from './pdfRenderer.js';
import { deepMerge } from '../utils/formatters.js';
import { validateData } from '../utils/validation.js';
import { resolveDocumentCode } from '../helpers/documentCodes.js';

/**
 * Resolve a module by code (e.g. 'TH-CR' or appCode='TH' + docCode='CR'),
 * by internal module name ('talent-hub/contract-report'), or an inline module object.
 */
async function resolveModule({ module: moduleRef, code, appCode, docCode }) {
  if (moduleRef && typeof moduleRef === 'object' && moduleRef.templatePath) {
    return moduleRef;
  }

  let target = moduleRef;
  if (!target && code) {
    target = resolveDocumentCode(code);
  } else if (!target && appCode && docCode) {
    target = resolveDocumentCode(appCode, docCode);
  }

  if (typeof target === 'string') {
    await moduleRegistry.ensureInitialized();
    return moduleRegistry.get(target);
  }

  throw new Error(
    'Expected a document "code" (e.g. "TH-CR"), "appCode"+"docCode", or a registered "module" name',
  );
}

/**
 * Merge defaults, validate input, and run any module-specific prepareData() hook.
 */
async function prepareModulePayload(mod, rawData = {}) {
  const merged = deepMerge(mod.defaultData || {}, rawData);

  if (mod.schema) {
    const result = validateData(merged, mod.schema);
    if (!result.valid) {
      throw new Error(`Invalid data for module "${mod.name}":\n- ${result.errors.join('\n- ')}`);
    }
  }

  if (typeof mod.prepareData === 'function') {
    return await mod.prepareData(merged);
  }

  return merged;
}

/**
 * Render a document module to an HTML string (ideal for live browser preview or debugging).
 */
export async function renderDocumentHtml({ module: moduleRef, code, appCode, docCode, data = {}, helpers = {} }) {
  const mod = await resolveModule({ module: moduleRef, code, appCode, docCode });
  const preparedData = await prepareModulePayload(mod, data);

  const html = await renderTemplate({
    templatePath: mod.templatePath,
    data: preparedData,
    layoutPath: mod.layoutPath,
    useLayout: mod.useLayout !== undefined ? mod.useLayout : true,
    helpers: {
      ...(mod.helpers || {}),
      ...helpers,
    },
  });

  return {
    html,
    data: preparedData,
    module: mod,
  };
}

/**
 * Generate a PDF document from any registered code (e.g. "TH-CR"), module name, or inline definition.
 *
 * Returns: { buffer, html, outputPath }
 */
export async function generateDocument({
  module: moduleRef,
  code,
  appCode,
  docCode,
  data = {},
  pdfOptions = {},
  outputPath,
  helpers = {},
  waitUntil,
  timeout,
  launchOptions,
}) {
  const { html, module: mod } = await renderDocumentHtml({
    module: moduleRef,
    code,
    appCode,
    docCode,
    data,
    helpers,
  });

  const mergedPdfOptions = deepMerge(mod.defaultPdfOptions || {}, pdfOptions);

  const buffer = await renderPdfFromHtml(html, {
    outputPath,
    waitUntil,
    timeout,
    launchOptions,
    pdfOptions: mergedPdfOptions,
  });

  return {
    buffer,
    html,
    outputPath: outputPath || null,
  };
}
