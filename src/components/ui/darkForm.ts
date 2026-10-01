// Shared input/button classes for forms on the night public-site pages
// (signin, speaker intake, ...), per logica.pen V3 "Sign In": translucent
// field with a hairline border, rust pill button.

export const darkInputClass =
  "min-h-[54px] w-full rounded-[14px] border border-white/25 bg-white/[0.08] px-[18px] text-base text-white placeholder:text-white/50 focus-visible:border-white/60 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const darkInputErrorClass =
  "min-h-[54px] w-full rounded-[14px] border border-[#ff8a65] bg-white/[0.08] px-[18px] text-base text-white placeholder:text-white/50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal";

export const darkButtonClass =
  "inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#b63814] px-6 text-[17px] font-semibold text-white transition-transform duration-300 enabled:hover:-translate-y-0.5 disabled:opacity-60";
