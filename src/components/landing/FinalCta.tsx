import { ButtonLink } from "@/components/ui/ButtonLink";
import { FourDots } from "@/components/brand/LogicaMark";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-ink bg-ink text-paper" aria-labelledby="cta-heading">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-signal" aria-hidden />
      <div className="relative mx-auto flex max-w-shell flex-col gap-8 px-4 py-14 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
        <div className="max-w-xl">
          <FourDots />
          <p className="type-label mt-4 text-signal">Call to action</p>
          <h2 id="cta-heading" className="type-display-2 mt-3 text-balance">
            Ready to build with LOGICA?
          </h2>
          <p className="mt-4 text-body-lg text-paper/80">
            Learn about the team, check the calendar, or sign in with your UIC email.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pb-2">
          <ButtonLink href="/signin" size="lg" variant="signal">
            Sign in
          </ButtonLink>
          <ButtonLink href="/events" size="lg" variant="outline">
            See events
          </ButtonLink>
          <ButtonLink href="/team" size="lg" variant="outline">
            Meet the team
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-ink bg-paper px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-shell flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <p className="type-h4">LOGICA @ UIC</p>
          <FourDots />
        </div>
        <p className="text-caption text-ink-muted">
          Latinx Organization for Growth in Computing and Academics
        </p>
      </div>
    </footer>
  );
}
