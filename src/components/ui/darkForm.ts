// Shared input/button classes for forms on the black public-site pages
// (signin, speaker intake, ...). Keeps every dark-theme form consistent
// instead of each page re-deriving its own input styling.

export const darkInputClass =
  "min-h-12 w-full rounded-sm border-2 border-white/20 bg-transparent px-3.5 text-body text-white placeholder:text-white/60 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const darkInputErrorClass =
  "min-h-12 w-full rounded-sm border-2 border-signal bg-transparent px-3.5 text-body text-white placeholder:text-white/60 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const darkButtonClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-6 text-lg font-semibold text-black transition-transform duration-300 enabled:hover:-translate-y-0.5 disabled:opacity-60";
