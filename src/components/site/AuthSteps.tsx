/** "1 Invite email · 2 New password · 3 Speaker portal": where this page sits in a guest's setup. */
export function AuthSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="auth-steps" aria-label="Setup steps">
      {steps.map((label, i) => (
        <li key={label} aria-current={i === current ? "step" : undefined} data-done={i < current || undefined}>
          <span aria-hidden="true">{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
