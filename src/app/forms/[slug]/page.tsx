"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { inputType } from "@/lib/formField";
import {
  AppShell,
  EmptyState,
  Field,
  PageHeader,
  buttonClass,
  inputClass,
  inputErrorClass,
} from "@/components/shell/AppShell";

type FieldDef = { id: string; label: string; type: string };
type Form = { id: string; title: string; fields: FieldDef[] };


/** Forms — BRP flat fills; CONTENT #8 error summary takes focus + Error: title. */
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
      // independent, but the stored submission is keyed by label — there is
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

  if (error && !form) {
    return (
      <AppShell>
        <PageHeader eyebrow="Forms" title="Form unavailable" />
        <div className="mx-auto max-w-shell px-4 py-14 md:px-6">
          <EmptyState
            title="Couldn't load this form"
            body={error}
            action={
              <Link href="/" className="type-label text-signal underline-offset-4 hover:underline">
                Home →
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  if (!form) {
    return (
      <AppShell>
        <PageHeader eyebrow="Forms" title="Loading…" />
        <div className="mx-auto max-w-shell px-4 py-14 md:px-6">
          <p className="text-body text-ink-muted">Loading form…</p>
        </div>
      </AppShell>
    );
  }

  if (submitted) {
    return (
      <AppShell>
        <PageHeader eyebrow="Forms" title={form.title} />
        <div className="mx-auto max-w-shell px-4 py-14 md:px-6">
          <div className="max-w-lg rounded-lg border border-ink bg-paper-dim p-8 text-ink shadow-block">
            <h2 className="type-h2">Submitted. Thanks!</h2>
            <p className="mt-3 text-body">
              We got your response for <strong>{form.title}</strong>.
            </p>
            <Link href="/" className={`${buttonClass} mt-6 bg-ink`}>
              Back home
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Form · ${slug}`}
        title={form.title}
        description="Flat fills and hard outlines — readable on first contact."
      />

      <div className="mx-auto max-w-shell px-4 py-14 md:px-6 md:py-24">
        <form
          onSubmit={submit}
          className="card max-w-lg border-ink p-6 shadow-block md:p-8"
          noValidate
        >
          {error && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              className="rounded-lg mb-5 border-2 border-signal bg-paper px-4 py-3 text-body-sm text-signal outline-none"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p className="mt-1">{error}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {Object.values(fieldErrors).map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-col gap-5">
            {form.fields.map((f) => {
              const shared = {
                id: f.id,
                value: values[f.id] ?? "",
                onChange: (
                  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                ) => setValues({ ...values, [f.id]: e.target.value }),
                className: fieldErrors[f.id] ? inputErrorClass : inputClass,
                "aria-invalid": Boolean(fieldErrors[f.id]),
                "aria-describedby": fieldErrors[f.id] ? `${f.id}-error` : undefined,
              };
              return (
                <Field key={f.id} id={f.id} label={f.label} error={fieldErrors[f.id]}>
                  {f.type === "textarea" ? (
                    <textarea rows={5} {...shared} />
                  ) : (
                    <input type={inputType(f.type)} {...shared} />
                  )}
                </Field>
              );
            })}
          </div>

          <button type="submit" disabled={busy} className={`${buttonClass} mt-8`}>
            {busy ? "Submitting…" : "Submit"}
          </button>
        </form>

        <p className="mt-8 text-caption text-ink-muted">
          Other forms:{" "}
          <Link href="/forms/startup-intake" className="font-bold text-signal hover:underline">
            startup intake
          </Link>
          {" · "}
          <Link href="/forms/company-visit-signup" className="font-bold text-signal hover:underline">
            company visit
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
