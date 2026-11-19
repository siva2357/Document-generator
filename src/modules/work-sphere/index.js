import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAYOUT_PATH = path.join(__dirname, 'layouts', 'layout.ejs');

const WORK_SPHERE_THEME = {
  primaryColor: '#0f766e',
  primarySoftColor: '#f0fdfa',
  accentColor: '#14b8a6',
};

const DEFAULT_PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
};

const workSphereModules = [
  {
    name: 'work-sphere/offer-letter',
    app: 'work-sphere',
    displayName: 'Work Sphere — Offer Letter',
    description: 'Employment offer letter with compensation breakdown and acceptance block.',
    templatePath: path.join(__dirname, 'offer-letter.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'offer-letter.json'),
    defaultData: { docBadge: 'Offer Letter', title: 'Offer of Employment', currency: 'USD', theme: WORK_SPHERE_THEME },
    defaultPdfOptions: DEFAULT_PDF_OPTIONS,
    schema: { required: ['title'] },
  },
  {
    name: 'work-sphere/payslip',
    app: 'work-sphere',
    displayName: 'Work Sphere — Payslip',
    description: 'Monthly employee salary slip with earnings, deductions, and net payable banner.',
    templatePath: path.join(__dirname, 'payslip.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'payslip.json'),
    defaultData: { docBadge: 'Payslip', title: 'Employee Payslip', currency: 'USD', theme: WORK_SPHERE_THEME },
    defaultPdfOptions: DEFAULT_PDF_OPTIONS,
    schema: { required: ['payPeriod'] },
  },
  {
    name: 'work-sphere/letters',
    app: 'work-sphere',
    displayName: 'Work Sphere — Letters',
    description: 'General-purpose official HR / business letter (experience, relieving, warning, appraisal, etc.).',
    templatePath: path.join(__dirname, 'letters.ejs'),
    layoutPath: LAYOUT_PATH,
    sampleDataPath: path.join(__dirname, 'samples', 'letters.json'),
    defaultData: { docBadge: 'Official Letter', title: 'Official Letter', theme: WORK_SPHERE_THEME },
    defaultPdfOptions: DEFAULT_PDF_OPTIONS,
    schema: { required: ['subject'] },
  },
];

export default workSphereModules;
