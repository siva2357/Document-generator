import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAYOUT_PATH = path.join(__dirname, 'layouts', 'layout.ejs');

const COURSE_HUB_THEME = {
  primaryColor: '#7c3aed',
  primarySoftColor: '#f5f3ff',
  accentColor: '#8b5cf6',
};

const courseHubModules = [
  {
    name: 'course-hub/invoice',
    app: 'course-hub',
    displayName: 'Course Hub — Invoice',
    description: 'Course enrollment / tuition fee invoice with discounts and tax totals.',
    templatePath: path.join(__dirname, 'invoice.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'invoice.json'),
    defaultData: { docBadge: 'Fee Invoice', title: 'Course Fee Invoice', currency: 'USD', theme: COURSE_HUB_THEME },
    defaultPdfOptions: {
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
    },
    schema: { required: ['invoiceNumber'], fields: { items: { type: 'array' } } },
  },
  {
    name: 'course-hub/certificate',
    app: 'course-hub',
    displayName: 'Course Hub — Certificate',
    description: 'Landscape A4 course completion certificate with decorative border and seal.',
    templatePath: path.join(__dirname, 'certificate.ejs'),
    sampleDataPath: path.join(__dirname, 'samples', 'certificate.json'),
    useLayout: false,
    defaultData: { title: 'Certificate of Completion' },
    defaultPdfOptions: {
      format: 'A4',
      landscape: true,
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    },
    schema: { required: ['recipientName', 'courseTitle'] },
  },
];

export default courseHubModules;
