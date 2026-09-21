import { LegalPage, LSection, LList, contactLine } from "@/components/legal/LegalPage";

export const metadata = { title: "Terms of Use — LOGICA @ UIC" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      dek="The basic rules for using this site and being part of LOGICA @ UIC."
      updated="September 2026"
    >
      <LSection title="Acceptance">
        <p>
          By using this site, you agree to these terms. If you don&apos;t agree, please
          don&apos;t use it — and email us if something here doesn&apos;t sit right, we&apos;re
          reasonable people.
        </p>
      </LSection>

      <LSection title="Who this is for">
        <p>
          LOGICA @ UIC is a registered student organization at the University of Illinois
          Chicago. This site is for UIC students, faculty, staff, alumni, and guests we invite —
          speakers, partners, and prospective members. We&apos;re a student org, not a university
          department; nothing here is an official statement from UIC.
        </p>
      </LSection>

      <LSection title="Your account">
        <p>
          Keep your account info accurate and your credentials to yourself. You&apos;re
          responsible for what happens under your account. Tell us right away if you think
          someone else has access to it.
        </p>
      </LSection>

      <LSection title="Acceptable use">
        <p>Don&apos;t use this site to:</p>
        <LList
          items={[
            "Impersonate someone else or misrepresent your affiliation with LOGICA or UIC",
            "Scrape, spam, or attempt to disrupt the site",
            "Harass, threaten, or discriminate against another member or guest",
            "Submit false information on a form, RSVP, or speaker application",
            "Attempt to access accounts or data that aren't yours",
          ]}
        />
      </LSection>

      <LSection title="Events and attendance">
        <p>
          RSVPing to an event helps us plan, but doesn&apos;t guarantee a seat if a venue or
          workshop has limited capacity. Be respectful of speakers, sponsors, and fellow members
          at events — we can remove attendees who aren&apos;t.
        </p>
      </LSection>

      <LSection title="Content you submit">
        <p>
          If you submit content through a form — a speaker application, an event write-up, a
          testimonial — you&apos;re confirming it&apos;s yours to share and you&apos;re giving us
          permission to use it for LOGICA purposes (event pages, promotion, our records). You
          keep ownership of it.
        </p>
      </LSection>

      <LSection title="Our name and branding">
        <p>
          &ldquo;LOGICA @ UIC&rdquo; and our logo are ours. Don&apos;t use them to imply an
          endorsement or affiliation that doesn&apos;t exist.
        </p>
      </LSection>

      <LSection title="Third-party links">
        <p>
          We link to things we don&apos;t control — sponsor sites, event pages, Discord, forms
          hosted elsewhere. We&apos;re not responsible for what happens once you leave our site.
        </p>
      </LSection>

      <LSection title="No warranty">
        <p>
          This site is run by student volunteers and provided as-is. We do our best to keep it
          accurate and working, but we can&apos;t promise it&apos;ll always be error-free or
          available.
        </p>
      </LSection>

      <LSection title="Limitation of liability">
        <p>
          To the extent the law allows it, LOGICA and the students who run this site aren&apos;t
          liable for indirect or incidental damages from using it. Nothing here limits liability
          where the law says it can&apos;t be limited.
        </p>
      </LSection>

      <LSection title="Suspending access">
        <p>
          We can suspend or close an account that violates these terms, particularly around
          harassment, impersonation, or misuse of member data.
        </p>
      </LSection>

      <LSection title="Governing law">
        <p>These terms are governed by the laws of the State of Illinois.</p>
      </LSection>

      <LSection title="Changes to these terms">
        <p>
          We may update these terms as the site and org evolve. We&apos;ll update the date at the
          top of this page when we do.
        </p>
      </LSection>

      <LSection title="Contact">
        <p>{contactLine}</p>
      </LSection>
    </LegalPage>
  );
}
