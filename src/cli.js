#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  generateDocument,
  listModules,
  moduleRegistry,
  closeBrowser,
  getDocumentCode,
} from './index.js';

function printHelp() {
  console.log(`
Document Generator CLI

Quick Run (by Code or App Code):
  npm run pdf                                       Generate sample PDFs for ALL codes
  npm run pdf -- TH                                 Generate all Talent Hub PDFs
  npm run pdf -- WS                                 Generate all Work Sphere PDFs
  npm run pdf -- CH                                 Generate all Course Hub PDFs
  npm run pdf -- TH-CR                              Generate Talent Hub Contract Report
  npm run pdf -- WS-PAY                             Generate Work Sphere Payslip
  npm run pdf -- CH-CERT                            Generate Course Hub Certificate

Custom Data / Output:
  npm run pdf -- <code> <data.json> [output.pdf]
  npm run pdf -- -c <code> -d <data.json> -o <output.pdf> [options]
  npm run pdf -- --list

Options:
  -c, --code <code>      Document code (e.g. TH-CR, WS-PAY, CH-CERT) or app code (TH, WS, CH)
  -m, --module <name>    Alias for --code (also accepts internal module name)
      --app <code|name>  Filter by application code or name (TH / talent-hub, WS, CH)
  -d, --data <path>      Path to JSON data file (defaults to module's sample JSON)
  -o, --out <path>       Output PDF file path (default: output/<app>/<doc>.pdf)
      --html             Also save rendered HTML preview next to the PDF
      --format <size>    Page format override (e.g. A4, Letter)
      --landscape        Render in landscape orientation
  -a, --all              Generate sample PDFs for all registered modules
  -l, --list             List all available document codes & modules
  -h, --help             Show this help message
`);
}

async function generateOne({ target, dataFile, outFile, pdfOptions, saveHtml }) {
  await moduleRegistry.ensureInitialized();
  const mod = moduleRegistry.get(target);
  const code = getDocumentCode(mod.name) || mod.name;

  const resolvedDataPath = dataFile ? path.resolve(dataFile) : mod.sampleDataPath;
  if (!resolvedDataPath) {
    throw new Error(`No --data file provided and "${code}" has no sample JSON`);
  }

  const rawJson = await fs.readFile(resolvedDataPath, 'utf8');
  const data = JSON.parse(rawJson);

  const outputPath = path.resolve(outFile || path.join('output', `${mod.name}.pdf`));

  const { buffer, html } = await generateDocument({
    module: mod.name,
    data,
    outputPath,
    pdfOptions,
  });

  console.log(`[${code}] PDF generated (${buffer.length} bytes): ${outputPath}`);

  if (saveHtml) {
    const htmlPath = outputPath.replace(/\.pdf$/i, '.html');
    await fs.writeFile(htmlPath, html, 'utf8');
    console.log(`[${code}] HTML preview saved: ${htmlPath}`);
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      code: { type: 'string', short: 'c' },
      module: { type: 'string', short: 'm' },
      app: { type: 'string' },
      data: { type: 'string', short: 'd' },
      out: { type: 'string', short: 'o' },
      html: { type: 'boolean', default: false },
      format: { type: 'string' },
      landscape: { type: 'boolean', default: false },
      all: { type: 'boolean', short: 'a', default: false },
      list: { type: 'boolean', short: 'l', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
  });

  if (values.help) {
    printHelp();
    return;
  }

  if (values.list) {
    const modules = await listModules(values.app ? { app: values.app } : {});
    console.log('Available document codes:\n');
    const grouped = new Map();
    for (const mod of modules) {
      const groupKey = `${mod.appCode || mod.app} (${mod.app})`;
      if (!grouped.has(groupKey)) grouped.set(groupKey, []);
      grouped.get(groupKey).push(mod);
    }
    for (const [group, appMods] of grouped.entries()) {
      console.log(`  [${group}]`);
      for (const mod of appMods) {
        const label = mod.code ? `${mod.code.padEnd(8)} -> ${mod.name}` : mod.name;
        console.log(`    - ${label} (${mod.displayName})`);
      }
    }
    return;
  }

  const pdfOptions = {
    ...(values.format ? { format: values.format } : {}),
    ...(values.landscape ? { landscape: true } : {}),
  };

  const target = values.code || values.module || positionals[0];
  const dataFile = values.data || positionals[1];
  const outFile = values.out || positionals[2];

  if (values.all || values.app || (!target && !dataFile)) {
    const modules = await listModules(values.app ? { app: values.app } : {});
    if (modules.length === 0) {
      throw new Error(`No document modules found${values.app ? ` for app "${values.app}"` : ''}`);
    }
    for (const mod of modules) {
      if (!mod.sampleDataPath) continue;
      await generateOne({
        target: mod.name,
        pdfOptions,
        saveHtml: values.html,
      });
    }
    return;
  }

  if (!target) {
    throw new Error('Please specify a document code when passing --data (e.g. npm run pdf -- TH-INV data.json)');
  }

  await moduleRegistry.ensureInitialized();

  // If the target matches an app code/name (e.g. "TH" or "talent-hub"), generate all documents for that app
  if (!moduleRegistry.has(target)) {
    const appModules = await listModules({ app: target });
    if (appModules.length > 0 && !dataFile) {
      for (const mod of appModules) {
        if (!mod.sampleDataPath) continue;
        await generateOne({
          target: mod.name,
          pdfOptions,
          saveHtml: values.html,
        });
      }
      return;
    }
  }

  await generateOne({
    target,
    dataFile,
    outFile,
    pdfOptions,
    saveHtml: values.html,
  });
}

main()
  .catch((err) => {
    console.error('Error generating document:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeBrowser();
  });
