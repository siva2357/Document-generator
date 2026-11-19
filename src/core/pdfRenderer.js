import fs from 'node:fs/promises';
import path from 'node:path';
import { getBrowser } from './browserManager.js';

export const DEFAULT_PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: false,
  displayHeaderFooter: false,
  margin: {
    top: '16mm',
    right: '16mm',
    bottom: '16mm',
    left: '16mm',
  },
};

/**
 * Render an HTML string into a PDF Buffer via Puppeteer, optionally saving to disk.
 */
export async function renderPdfFromHtml(html, options = {}) {
  const {
    outputPath,
    waitUntil = 'networkidle0',
    timeout = 30000,
    launchOptions,
    pdfOptions = {},
  } = options;

  const browser = await getBrowser(launchOptions);
  const page = await browser.newPage();

  try {
    page.setDefaultTimeout(timeout);
    await page.setContent(html, { waitUntil, timeout });
    await page.emulateMediaType('print');

    // Ensure web fonts and images finish loading before snapshotting to PDF
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const images = Array.from(document.images || []);
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        }),
      );
    });

    const finalPdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...pdfOptions,
      margin: {
        ...DEFAULT_PDF_OPTIONS.margin,
        ...(pdfOptions.margin || {}),
      },
    };

    const pdfBytes = await page.pdf(finalPdfOptions);
    const buffer = Buffer.from(pdfBytes);

    if (outputPath) {
      const resolvedOut = path.resolve(outputPath);
      await fs.mkdir(path.dirname(resolvedOut), { recursive: true });
      await fs.writeFile(resolvedOut, buffer);
    }

    return buffer;
  } finally {
    await page.close();
  }
}
