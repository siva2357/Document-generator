import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  getAppCode,
  getDocumentCode,
  isValidDocumentCode,
  resolveAppCode,
  resolveDocumentCode,
} from '../helpers/documentCodes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BUILTIN_MODULES_DIR = path.resolve(__dirname, '../modules');

class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.initialized = false;
  }

  /**
   * Register a document module definition.
   *
   * Required fields:
   * - name: unique identifier (e.g., 'talent-hub', 'talent-hub/offer-letter', 'work-sphere', 'course-hub')
   * - templatePath: absolute path to the module's .ejs template
   */
  register(moduleDef) {
    if (!moduleDef || typeof moduleDef !== 'object') {
      throw new Error('Module definition must be an object');
    }
    if (!moduleDef.name || typeof moduleDef.name !== 'string') {
      throw new Error('Module definition requires a string "name"');
    }
    if (!moduleDef.templatePath || typeof moduleDef.templatePath !== 'string') {
      throw new Error(`Module "${moduleDef.name}" requires a string "templatePath"`);
    }

    const normalized = {
      app: moduleDef.app || moduleDef.name.split('/')[0],
      displayName: moduleDef.displayName || moduleDef.name,
      description: moduleDef.description || '',
      version: moduleDef.version || '1.0.0',
      useLayout: moduleDef.useLayout !== undefined ? moduleDef.useLayout : true,
      layoutPath: moduleDef.layoutPath,
      sampleDataPath: moduleDef.sampleDataPath || null,
      defaultData: moduleDef.defaultData || {},
      defaultPdfOptions: moduleDef.defaultPdfOptions || {},
      schema: moduleDef.schema || null,
      helpers: moduleDef.helpers || {},
      prepareData: moduleDef.prepareData || null,
      ...moduleDef,
    };

    this.modules.set(normalized.name, normalized);
    return normalized;
  }

  unregister(name) {
    return this.modules.delete(name);
  }

  has(nameOrCode) {
    if (this.modules.has(nameOrCode)) return true;
    if (isValidDocumentCode(nameOrCode)) {
      return this.modules.has(resolveDocumentCode(nameOrCode));
    }
    return false;
  }

  get(nameOrCode) {
    const resolvedName =
      typeof nameOrCode === 'string' && !this.modules.has(nameOrCode) && isValidDocumentCode(nameOrCode)
        ? resolveDocumentCode(nameOrCode)
        : nameOrCode;

    const mod = this.modules.get(resolvedName);
    if (!mod) {
      const available = Array.from(this.modules.values())
        .map((m) => {
          const code = getDocumentCode(m.name);
          return code ? `${code} (${m.name})` : m.name;
        })
        .join(', ') || '(none)';
      throw new Error(`Unknown document module/code "${nameOrCode}". Available: ${available}`);
    }
    return mod;
  }

  list(filter = {}) {
    let items = Array.from(this.modules.values());
    if (filter.app) {
      const resolvedApp = resolveAppCode(filter.app) || filter.app;
      items = items.filter((mod) => mod.app === resolvedApp);
    }
    return items.map((mod) => ({
      code: getDocumentCode(mod.name),
      appCode: getAppCode(mod.app),
      name: mod.name,
      app: mod.app,
      displayName: mod.displayName,
      description: mod.description,
      version: mod.version,
      sampleDataPath: mod.sampleDataPath,
      schema: mod.schema,
    }));
  }

  /**
   * Auto-discover and load document modules from a directory (supports nested app/document folders).
   */
  async loadFromDirectory(dirPath = BUILTIN_MODULES_DIR) {
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }

    const loaded = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const subDir = path.join(dirPath, entry.name);
      const indexFile = path.join(subDir, 'index.js');
      try {
        await fs.access(indexFile);
        const imported = await import(pathToFileURL(indexFile).href);
        const exported = imported.default || imported.modules || imported.module || imported;
        const defs = Array.isArray(exported) ? exported : [exported];
        for (const moduleDef of defs) {
          if (moduleDef && moduleDef.name && moduleDef.templatePath) {
            this.register(moduleDef);
            loaded.push(moduleDef.name);
          }
        }
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }

      // Also scan nested subdirectories (e.g., src/modules/talent-hub/offer-letter/index.js)
      const nestedLoaded = await this.loadFromDirectory(subDir);
      loaded.push(...nestedLoaded);
    }

    return loaded;
  }

  async ensureInitialized() {
    if (this.initialized) return;
    await this.loadFromDirectory(BUILTIN_MODULES_DIR);
    this.initialized = true;
  }
}

export const moduleRegistry = new ModuleRegistry();
export { ModuleRegistry };
