import { FourDots } from "@/components/brand/LogicaMark";

const missions = [
  {
    title: "Empower people",
    body: "Build skills, confidence, and community for Latinx students in computing and academics at UIC.",
    footer: "People drive change",
    plane: "bg-ink text-paper",
  },
  {
    title: "Strengthen places",
    body: "Create spaces on campus where culture and technical craft meet — study rooms, workshops, and shared tables.",
    footer: "Places hold us",
    plane: "bg-paper-dim text-ink",
  },
  {
    title: "Catalyze ideas",
    body: "Turn research, startups, and side projects into real momentum through mentorship, events, and peer support.",
    footer: "Ideas move forward",
    plane: "bg-paper text-ink border-t border-ink md:border-t-0 md:border-l",
  },
] as const;

/** Elenco planes — ink / paper only; red as punctuation. */
export function Mission() {
  return (
    <section id="mission" className="bg-paper" aria-labelledby="mission-heading">
      <div className="mx-auto max-w-shell px-4 py-14 md:px-6 md:py-24">
        <FourDots />
        <p className="type-label mt-4 text-ink-muted">Organization mission</p>
        <h2 id="mission-heading" className="type-display-2 mt-3 max-w-3xl text-balance">
          Logic with culture. Community with craft.
        </h2>
        <p className="mt-4 max-w-measure text-body-lg text-ink-muted">
          LOGICA exists so Latinx students at UIC don&apos;t have to choose between
          technical excellence and cultural belonging — we build both, together.
        </p>
      </div>

      <div className="grid border-t border-ink md:grid-cols-3">
        {missions.map((m) => (
          <article
            key={m.title}
            className={`relative min-h-[20rem] overflow-hidden px-6 py-10 md:min-h-[24rem] md:px-8 md:py-12 ${m.plane}`}
          >
            <span className="absolute right-6 top-6 h-3 w-3 bg-signal" aria-hidden />
            <div className="relative flex h-full max-w-sm flex-col justify-end gap-4">
              <h3 className="type-h2">{m.title}</h3>
              <p className="text-body opacity-90">{m.body}</p>
              <p className="type-label opacity-70">{m.footer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
