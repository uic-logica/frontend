const star = "M9 0l2.25 5.1 5.54-.6-3.29 4.5 3.29 4.5-5.54-.6L9 18l-2.25-5.1-5.54.6 3.29-4.5L1.21 4.5l5.54.6z";

/** Four six-point Chicago stars between hairlines. Use 2 or 3 per long page, never between every section. */
export function StarDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`site-stars site-wrap ${className}`} aria-hidden="true">
      <span>
        {[0, 1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 18 18" width="18" height="18" fill="currentColor">
            <path d={star} />
          </svg>
        ))}
      </span>
    </div>
  );
}
