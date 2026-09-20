import { LegalPage, LSection, Faq, contactLine } from "@/components/legal/LegalPage";

export const metadata = { title: "Support — LOGICA @ UIC" };

const faqs = [
  {
    q: "How do I join LOGICA?",
    a: "Head to the Join page and fill out the interest form — it's open year-round, no application deadline.",
  },
  {
    q: "Do I need to be a CS major, or Latinx, to join?",
    a: "No. LOGICA was founded for Latinx and underrepresented students in computing, but membership has never been limited to them — any UIC student interested in tech is welcome, from any major.",
  },
  {
    q: "How do I RSVP for an event?",
    a: "Check the Events page for what's coming up and RSVP there. If a workshop has limited seats, RSVPing early is the best way to hold a spot.",
  },
  {
    q: "I can't sign in, or forgot my password.",
    a: <>Email us at <a href="mailto:logica@uic.edu" className="font-semibold underline underline-offset-2">logica@uic.edu</a> with the address you signed up with and we&apos;ll help you get back in.</>,
  },
  {
    q: "How do I become a speaker or guest?",
    a: "There's a speaker/guest intake form linked from the site — fill it out with your topic and availability and our board will follow up.",
  },
  {
    q: "How can my company partner or sponsor an event?",
    a: <>Email <a href="mailto:logica@uic.edu" className="font-semibold underline underline-offset-2">logica@uic.edu</a> — company visits, workshops, and talks all start with a quick conversation about what you&apos;re looking for.</>,
  },
  {
    q: "Is there a membership fee?",
    a: "No, general membership is free.",
  },
  {
    q: "How do I update my profile or resume?",
    a: "Sign in and go to your Profile page — you can edit your info and upload or replace your resume there.",
  },
  {
    q: "How do I stop getting emails from LOGICA?",
    a: <>Email <a href="mailto:logica@uic.edu" className="font-semibold underline underline-offset-2">logica@uic.edu</a> and ask to be removed — we&apos;ll take care of it.</>,
  },
];

export default function SupportPage() {
  return (
    <LegalPage
      title="Support"
      dek="Common questions, and how to reach a person if this page doesn't cover it."
      updated="September 2026"
    >
      <LSection title="Reach us directly">
        <p>
          {contactLine} We&apos;re a student board, not a support team, so give us a couple of
          business days to get back to you.
        </p>
      </LSection>

      <LSection title="Frequently asked questions">
        <Faq items={faqs} />
      </LSection>
    </LegalPage>
  );
}
