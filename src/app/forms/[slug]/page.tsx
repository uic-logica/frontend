"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";

type Field = { id: string; label: string; type: string };
type Form = { id: string; title: string; fields: Field[] };

export default function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api<Form>(`/api/forms/${slug}`).then(setForm).catch((e) => setError(e.message));
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api(`/api/forms/${slug}/submit`, { method: "POST", body: JSON.stringify({ data: values }) });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (error) return <main className="p-8 text-sm text-red-600">{error}</main>;
  if (!form) return <main className="p-8">Loading…</main>;
  if (submitted) return <main className="p-8">Submitted. Thanks!</main>;

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-xl font-semibold">{form.title} [scaffold]</h1>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        {form.fields.map((f) => (
          <label key={f.id} className="flex flex-col gap-1 text-sm">
            {f.label}
            <input
              value={values[f.label] ?? ""}
              onChange={(e) => setValues({ ...values, [f.label]: e.target.value })}
              className="border px-3 py-2"
            />
          </label>
        ))}
        <button type="submit" className="border px-3 py-2">Submit</button>
      </form>
    </main>
  );
}
