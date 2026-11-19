# Document Generator

A reusable, modular Node.js (ESM) PDF document generator powered by **EJS** and **Puppeteer**, designed for multiple applications to communicate via **short document codes** instead of internal file paths.

## App & Document Codes (`src/helpers/documentCodes.js`)

| App Code | Application | Document Code | Template |
| :--- | :--- | :--- | :--- |
| `TH` | Talent Hub | `TH-C` | `talent-hub/contract.ejs` |
| `TH` | Talent Hub | `TH-INV` | `talent-hub/invoice.ejs` |
| `TH` | Talent Hub | `TH-ST` | `talent-hub/statement.ejs` |
| `TH` | Talent Hub | `TH-CR` | `talent-hub/contract-report.ejs` |
| `WS` | Work Sphere | `WS-OL` | `work-sphere/offer-letter.ejs` |
| `WS` | Work Sphere | `WS-PAY` | `work-sphere/payslip.ejs` |
| `WS` | Work Sphere | `WS-LTR` | `work-sphere/letters.ejs` |
| `CH` | Course Hub | `CH-INV` | `course-hub/invoice.ejs` |
| `CH` | Course Hub | `CH-CERT` | `course-hub/certificate.ejs` |

## Quick Start

```bash
npm install
npx puppeteer browsers install chrome
npm run pdf
```

## CLI Commands

```bash
# List all available codes grouped by app
npm run pdf -- --list

# Generate ALL 9 sample PDFs
npm run pdf

# Generate all PDFs for one app by app code
npm run pdf -- TH
npm run pdf -- WS
npm run pdf -- CH

# Generate a single PDF by document code
npm run pdf -- TH-CR
npm run pdf -- WS-PAY
npm run pdf -- CH-CERT

# Generate using custom JSON data and output path
npm run pdf -- TH-INV ./my-invoice.json ./output/my-invoice.pdf
```

Run tests:

```bash
npm test
```

## Library Usage (with Codes)

```js
import { generateDocument, renderDocumentHtml, closeBrowser } from './src/index.js';

// Option 1: Pass combined code (e.g. "TH-CR", "WS-PAY", "CH-CERT")
const { buffer } = await generateDocument({
  code: 'TH-CR',
  outputPath: './output/contract-report.pdf',
  data: { title: 'Q4 Contract Report' },
});

// Option 2: Pass separate appCode + docCode (e.g. from external website requests)
const { html } = await renderDocumentHtml({
  appCode: 'CH',
  docCode: 'CERT',
  data: { recipientName: 'Aarav Patel', courseTitle: 'Full Stack JS' },
});

await closeBrowser();
```
