import ejs from 'ejs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { templateHelpers } from '../utils/formatters.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
export const DEFAULT_LAYOUT_PATH = path.join(TEMPLATES_DIR, 'layouts', 'base.ejs');

/**
 * Render an EJS template file with shared helpers, partials resolution, and optional base layout wrapping.
 */
export async function renderTemplate({
  templatePath,
  data = {},
  layoutPath = DEFAULT_LAYOUT_PATH,
  useLayout = true,
  helpers = {},
  extraViews = [],
}) {
  if (!templatePath) {
    throw new Error('renderTemplate requires a valid "templatePath"');
  }

  const mergedHelpers = {
    ...templateHelpers,
    ...helpers,
  };

  const views = [
    path.dirname(templatePath),
    ...(layoutPath ? [path.dirname(layoutPath)] : []),
    TEMPLATES_DIR,
    ...extraViews,
  ];
  const ejsOptions = {
    views,
    async: false,
  };

  const templateContext = {
    ...data,
    helpers: mergedHelpers,
  };

  const bodyHtml = await ejs.renderFile(templatePath, templateContext, ejsOptions);

  if (!useLayout || !layoutPath) {
    return bodyHtml;
  }

  return ejs.renderFile(
    layoutPath,
    {
      ...templateContext,
      body: bodyHtml,
    },
    ejsOptions,
  );
}

/**
 * Render an inline EJS template string (useful for dynamic header/footer templates or ad-hoc snippets).
 */
export function renderTemplateString(templateString, data = {}, helpers = {}) {
  if (!templateString) return '';
  return ejs.render(templateString, {
    ...data,
    helpers: {
      ...templateHelpers,
      ...helpers,
    },
  });
}
