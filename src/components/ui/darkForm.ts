// Shared input/button classes for forms on the black public-site pages
// (signin, speaker intake, ...). Keeps every dark-theme form consistent
// instead of each page re-deriving its own input styling.

export const darkInputClass =
  "min-h-12 w-full rounded-sm border border-black/15 bg-[#f5f5f5] px-3.5 text-body text-[#2b2b2b] placeholder:text-[#666666] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const darkInputErrorClass =
  "min-h-12 w-full rounded-sm border border-[#b63814] bg-[#fff5f1] px-3.5 text-body text-[#2b2b2b] placeholder:text-[#666666] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const darkButtonClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#b63814] px-6 text-lg font-semibold text-white transition-transform duration-300 enabled:hover:-translate-y-0.5 disabled:opacity-60";
