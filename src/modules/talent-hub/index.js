import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAYOUT_PATH = path.join(__dirname, 'layouts', 'layout.ejs');

const TALENT_HUB_THEME = {
  primaryColor: '#4f46e5',
  primarySoftColor: '#eef2ff',
  accentColor: '#6366f1',
};

const DEFAULT_PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
};

const talentHubModules = [
  {
    name: 'talent-hub/contract',
    app: 'talent-hub',
    displayName: 'Talent Hub — Contract',
    description: 'Service / talent engagement contract agreement.',
    templatePath: path.join(__dirname, 'contract.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'contract.json'),
    defaultData: { docBadge: 'Contract Agreement', title: 'Service Contract Agreement', theme: TALENT_HUB_THEME },
    defaultPdfOptions: DEFAULT_PDF_OPTIONS,
    schema: { required: ['title'] },
  },
  {
    name: 'talent-hub/invoice',
    app: 'talent-hub',
    displayName: 'Talent Hub — Invoice',
    description: 'Contractor / placement invoice with itemized line items and tax totals.',
    templatePath: path.join(__dirname, 'invoice.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'invoice.json'),
    defaultData: { docBadge: 'Invoice', title: 'Invoice', currency: 'USD', theme: TALENT_HUB_THEME },
    defaultPdfOptions: DEFAULT_PDF_OPTIONS,
    schema: { required: ['invoiceNumber'], fields: { items: { type: 'array' } } },
  },
  {
    name: 'talent-hub/statement',
    app: 'talent-hub',
    displayName: 'Talent Hub — Statement',
    description: 'Account billing and payment ledger statement.',
    templatePath: path.join(__dirname, 'statement.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'statement.json'),
    defaultData: { docBadge: 'Account Statement', title: 'Account Statement', currency: 'USD', theme: TALENT_HUB_THEME },
    defaultPdfOptions: DEFAULT_PDF_OPTIONS,
    schema: { required: ['title'], fields: { transactions: { type: 'array' } } },
  },
  {
    name: 'talent-hub/contract-report',
    app: 'talent-hub',
    displayName: 'Talent Hub — Contract Report',
    description: 'Portfolio summary report of active talent contracts and deliverables.',
    templatePath: path.join(__dirname, 'contract-report.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'contract-report.json'),
    defaultData: { docBadge: 'Contract Report', title: 'Contract Performance Report', theme: TALENT_HUB_THEME },
    defaultPdfOptions: DEFAULT_PDF_OPTIONS,
    schema: { required: ['title'] },
  },
];

export default talentHubModules;
