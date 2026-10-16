/**
 * Pull the useful bits out of OCR text from a receipt: who it's from, the
 * total, and the date. Rules, not AI (the board chose free OCR), so it's a
 * best guess the dashboard shows for a person to check before saving.
 */
export type ReceiptGuess = { vendor: string | null; total: number | null; date: string | null };

const AMOUNT = /\$?\s*(\d{1,4}(?:,\d{3})*[.,]\d{2})\b/g;
const money = (raw: string) => Number(raw.replace(/[$\s]/g, "").replace(/,(?=\d{3})/g, "").replace(",", "."));

/** The amount on the last line that says TOTAL (not subtotal or tax), else the largest amount. */
function findTotal(lines: string[]): number | null {
  const amountsOn = (line: string) => [...line.matchAll(AMOUNT)].map((m) => money(m[1])).filter((n) => n > 0);
  const totalLines = lines.filter((l) => /\b(grand\s*total|total|amount\s*due|balance\s*due|amount)\b/i.test(l) && !/sub\s*-?\s*total|tax|savings|tip\s*%/i.test(l));
  for (const line of totalLines.reverse()) {
    const found = amountsOn(line);
    if (found.length) return found[found.length - 1];
  }
  const all = lines.flatMap(amountsOn);
  return all.length ? Math.max(...all) : null;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const valid = (y: number, m: number, d: number) => y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31;

/** The first date on the receipt, as YYYY-MM-DD. US order (month first) for slashes. */
function findDate(text: string): string | null {
  let m = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m && valid(+m[1], +m[2], +m[3])) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  m = text.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})\b/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    if (valid(y, +m[1], +m[2])) return `${y}-${pad(+m[1])}-${pad(+m[2])}`;
  }
  m = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/i);
  if (m) {
    const month = MONTHS.indexOf(m[1].toLowerCase()) + 1;
    if (valid(+m[3], month, +m[2])) return `${m[3]}-${pad(month)}-${pad(+m[2])}`;
  }
  return null;
}

/** The store: the first line near the top that reads like a name, not an address or a number. */
function findVendor(lines: string[]): string | null {
  for (const line of lines.slice(0, 6)) {
    const clean = line.replace(/[^\w&'. -]/g, "").trim();
    if (clean.replace(/[^a-z]/gi, "").length >= 3 && !/^\d/.test(clean) && !/(street|st\.|ave|blvd|road|rd\.|suite|tel|phone|www|http|receipt)/i.test(clean)) {
      return clean.replace(/\s{2,}/g, " ").slice(0, 60);
    }
  }
  return null;
}

export function parseReceipt(text: string): ReceiptGuess {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return { vendor: findVendor(lines), total: findTotal(lines), date: findDate(text) };
}
