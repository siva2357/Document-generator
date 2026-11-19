import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateDocument,
  renderDocumentHtml,
  listModules,
  registerModule,
  moduleRegistry,
  closeBrowser,
  APP_CODES,
  DOCUMENT_CODES,
  resolveAppCode,
  resolveDocumentCode,
  getDocumentCode,
  getCodesByApp,
  isValidDocumentCode,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXPECTED_MODULES = [
  'course-hub/certificate',
  'course-hub/invoice',
  'talent-hub/contract',
  'talent-hub/contract-report',
  'talent-hub/invoice',
  'talent-hub/statement',
  'work-sphere/letters',
  'work-sphere/offer-letter',
  'work-sphere/payslip',
];

describe('Document Codes Helpers', () => {
  it('resolves app codes and document codes cleanly (including case/underscore variants)', () => {
    assert.equal(resolveAppCode('TH'), 'talent-hub');
    assert.equal(resolveAppCode('ws'), 'work-sphere');
    assert.equal(resolveAppCode('CH'), 'course-hub');
    assert.equal(resolveAppCode('talent-hub'), 'talent-hub');

    assert.equal(resolveDocumentCode('TH-CR'), 'talent-hub/contract-report');
    assert.equal(resolveDocumentCode('th_inv'), 'talent-hub/invoice');
    assert.equal(resolveDocumentCode('TH', 'C'), 'talent-hub/contract');
    assert.equal(resolveDocumentCode('WS', 'PAY'), 'work-sphere/payslip');
    assert.equal(resolveDocumentCode('CH-CERT'), 'course-hub/certificate');

    assert.equal(getDocumentCode('talent-hub/statement'), 'TH-ST');
    assert.equal(isValidDocumentCode('TH-ST'), true);
    assert.equal(isValidDocumentCode('INVALID-CODE'), false);

    assert.deepEqual(Object.keys(getCodesByApp('TH')).sort(), ['TH-C', 'TH-CR', 'TH-INV', 'TH-ST']);
    assert.equal(Object.keys(APP_CODES).length, 3);
    assert.equal(Object.keys(DOCUMENT_CODES).length, 9);
  });

  it('throws descriptive error on unknown document code', () => {
    assert.throws(() => resolveDocumentCode('XX-UNKNOWN'), /Unknown document code/);
  });
});

describe('Document Generator Core', () => {
  after(async () => {
    await closeBrowser();
  });

  it('auto-discovers all 9 document modules and supports filtering by app code', async () => {
    const modules = await listModules();
    const names = modules.map((m) => m.name).sort();
    assert.deepEqual(names, EXPECTED_MODULES);

    assert.equal((await listModules({ app: 'TH' })).length, 4);
    assert.equal((await listModules({ app: 'WS' })).length, 3);
    assert.equal((await listModules({ app: 'CH' })).length, 2);
  });

  it('renders valid HTML using document codes (both single code and appCode + docCode)', async () => {
    const crSample = JSON.parse(
      await fs.readFile(path.resolve(__dirname, '../src/modules/talent-hub/samples/contract-report.json'), 'utf8'),
    );

    const byCode = await renderDocumentHtml({ code: 'TH-CR', data: crSample });
    const bySplit = await renderDocumentHtml({ appCode: 'TH', docCode: 'CR', data: crSample });

    assert.match(byCode.html, /Contract Portfolio Report/);
    assert.equal(byCode.html, bySplit.html);
  });

  it('rejects invalid payloads when required fields are missing', async () => {
    await assert.rejects(
      () =>
        renderDocumentHtml({
          code: 'CH-CERT',
          data: { recipientName: 'Test Only' },
        }),
      /Invalid data for module "course-hub\/certificate"/,
    );
  });

  it('allows registering and rendering custom modules at runtime', async () => {
    registerModule({
      name: 'talent-hub/custom-test',
      templatePath: path.resolve(__dirname, '../src/modules/talent-hub/contract-report.ejs'),
      defaultData: {
        title: 'Custom Module Title',
      },
    });

    const { html } = await renderDocumentHtml({
      module: 'talent-hub/custom-test',
      data: { subtitle: 'Loaded dynamically' },
    });

    assert.match(html, /Custom Module Title/);
    assert.match(html, /Loaded dynamically/);
    moduleRegistry.unregister('talent-hub/custom-test');
  });

  it('generates valid PDF buffers via Puppeteer using short document codes', async () => {
    const invSample = JSON.parse(
      await fs.readFile(path.resolve(__dirname, '../src/modules/talent-hub/samples/invoice.json'), 'utf8'),
    );
    const certSample = JSON.parse(
      await fs.readFile(path.resolve(__dirname, '../src/modules/course-hub/samples/certificate.json'), 'utf8'),
    );

    const inv = await generateDocument({ code: 'TH-INV', data: invSample });
    const cert = await generateDocument({ appCode: 'CH', docCode: 'CERT', data: certSample });

    for (const res of [inv, cert]) {
      assert.ok(Buffer.isBuffer(res.buffer));
      assert.ok(res.buffer.length > 1000);
      assert.equal(res.buffer.subarray(0, 5).toString('ascii'), '%PDF-');
    }
  });
});
