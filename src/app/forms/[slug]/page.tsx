"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { inputType } from "@/lib/formField";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";

type FieldDef = { id: string; label: string; type: string };
type Form = { id: string; title: string; fields: FieldDef[] };


/** Backend forms (logica.pen V4 "15 Forms"): the error summary takes focus and the tab title starts with "Error:". */
export default function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Form>(`/api/forms/${slug}`)
      .then(setForm)
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  useEffect(() => {
    if (error || Object.keys(fieldErrors).length) {
      document.title = form
        ? `Error: ${form.title} · LOGICA @ UIC`
        : "Error: Form · LOGICA @ UIC";
      summaryRef.current?.focus();
    } else if (form) {
      document.title = `${form.title} · LOGICA @ UIC`;
    }
  }, [error, fieldErrors, form]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError(null);

    const next: Record<string, string> = {};
    for (const f of form.fields) {
      if (!(values[f.id] ?? "").trim()) {
        next[f.id] = `${f.label} is required.`;
      }
    }
    if (Object.keys(next).length) {
      setFieldErrors(next);
      setError("Fix the problems below before submitting.");
      setBusy(false);
      return;
    }
    setFieldErrors({});

    try {
      // State is keyed by field id so two fields sharing a label stay
      // independent, but the stored submission is keyed by label: there is
      // no review UI yet, so someone reads this raw and "Company name"
      // beats "clx3f9q2b0001".
      const data = Object.fromEntries(
        form.fields.map((f) => [f.label, values[f.id] ?? ""]),
      );
      await api(`/api/forms/${slug}/submit`, {
        method: "POST",
        body: JSON.stringify({ data }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const head = (title: string) => (
    <header className="site-page-head forms-head">
      <p className="site-kicker">FORM · {slug.toUpperCase()}</p>
      <h1 className="serif">{title}</h1>
    </header>
  );

  if (error && !form) {
    return (
      <ClubShell>
        <main className="site-page forms-page">
          {head("Form unavailable")}
          <div className="forms-unavailable">
            <h2 className="serif">Couldn&apos;t load this form</h2>
            <p>{error}</p>
            <Link href="/" className="site-link">Home <SiteIcon name="arrow" /></Link>
          </div>
        </main>
      </ClubShell>
    );
  }

  if (!form) {
    return (
      <ClubShell>
        <main className="site-page forms-page">
          {head("Loading…")}
          <p className="site-muted" role="status">Loading form…</p>
        </main>
      </ClubShell>
    );
  }

  if (submitted) {
    return (
      <ClubShell>
        <main className="site-page forms-page">
          {head(form.title)}
          <div className="site-card speak-card" role="status">
            <span className="site-check" aria-hidden="true"><SiteIcon name="check" size={20} /></span>
            <h2 className="serif">Submitted. Thanks!</h2>
            <p className="site-muted">We got your response for <strong>{form.title}</strong>.</p>
            <Link href="/" className="site-btn forms-home">Back home</Link>
          </div>
        </main>
      </ClubShell>
    );
  }

  return (
    <ClubShell>
      <main className="site-page forms-page">
        {head(form.title)}
        <form onSubmit={submit} className="site-card speak-card site-form" noValidate>
          {error && (
            <div ref={summaryRef} tabIndex={-1} className="forms-summary" role="alert">
              <p><strong>Error</strong></p>
              <p>{error}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <ul>
                  {Object.values(fieldErrors).map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {form.fields.map((f) => {
            const shared = {
              id: f.id,
              value: values[f.id] ?? "",
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues({ ...values, [f.id]: e.target.value }),
              className: fieldErrors[f.id] ? "site-input-error" : undefined,
              "aria-invalid": Boolean(fieldErrors[f.id]),
              "aria-describedby": fieldErrors[f.id] ? `${f.id}-error` : undefined,
            };
            return (
              <div key={f.id} className="site-field">
                <label htmlFor={f.id}>{f.label}</label>
                {f.type === "textarea" ? <textarea rows={5} {...shared} /> : <input type={inputType(f.type)} {...shared} />}
                {fieldErrors[f.id] && <small id={`${f.id}-error`} className="forms-field-error">{fieldErrors[f.id]}</small>}
              </div>
            );
          })}

          <button type="submit" disabled={busy} className="site-btn forms-submit">{busy ? "Submitting…" : "Submit"}</button>
        </form>

        <p className="auth-alt forms-other">
          Other forms: <Link href="/forms/startup-intake">Startup intake</Link> · <Link href="/forms/company-visit-signup">Company visit</Link>
        </p>
      </main>
    </ClubShell>
  );
}
