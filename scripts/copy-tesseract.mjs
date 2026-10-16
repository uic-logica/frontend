// Copies the OCR engine (Tesseract) into public/tesseract so receipts are
// read from our own origin: no CDN, and the site's CSP stays as it is.
// Runs before dev and build; the output is gitignored.
import { cpSync, mkdirSync } from "node:fs";

const out = "public/tesseract";
mkdirSync(out, { recursive: true });
cpSync("node_modules/tesseract.js/dist/worker.min.js", `${out}/worker.min.js`);
for (const file of ["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js"]) {
  cpSync(`node_modules/tesseract.js-core/${file}`, `${out}/${file}`);
}
// The compact English model (about 3 MB), fine for printed receipts.
cpSync("node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz", `${out}/eng.traineddata.gz`);
