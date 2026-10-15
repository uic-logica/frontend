"use client";

/** A password field with a show/hide eye inside it. `show` is shared state so a confirm field can follow the same toggle. */
export function PasswordInput({
  id, name, show, onToggle, value, onChange, autoComplete, placeholder, minLength, maxLength = 200,
}: {
  id: string; name?: string; show: boolean; onToggle: () => void; value: string; onChange: (v: string) => void;
  autoComplete: string; placeholder?: string; minLength?: number; maxLength?: number;
}) {
  return (
    <span className="site-password">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button type="button" aria-pressed={show} aria-controls={id} aria-label={show ? "Hide password" : "Show password"} onClick={onToggle}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12" />
          <circle cx="12" cy="12" r="3" />
          {show && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </span>
  );
}
