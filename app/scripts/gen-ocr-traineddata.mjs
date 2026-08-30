// Regenerates src/data/generated/engTrainedDataBase64.js from
// public/vendor/tesseract/eng.traineddata.gz. Run after replacing that source file with a
// different one — see gachaImporter.js's getEmbeddedTrainedData for why this is embedded as a
// JS module instead of fetched at runtime.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');

const src = path.join(APP_ROOT, 'public/vendor/tesseract/eng.traineddata.gz');
const dest = path.join(APP_ROOT, 'src/data/generated/engTrainedDataBase64.js');

const base64 = readFileSync(src).toString('base64');
const out = `// Auto-generated — base64 of public/vendor/tesseract/eng.traineddata.gz, embedded directly
// into the JS bundle so gachaImporter.js's OCR init never has to fetch it (see that file's
// getEmbeddedTrainedData for why). To regenerate after the source .gz changes, run from app/:
//   node scripts/gen-ocr-traineddata.mjs
export const ENG_TRAINEDDATA_GZ_BASE64 = ${JSON.stringify(base64)};
`;
writeFileSync(dest, out);
console.log(`Wrote ${dest} (${out.length} bytes)`);
