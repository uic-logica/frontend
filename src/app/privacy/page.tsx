import { LegalPage, LSection, LList, contactLine } from "@/components/legal/LegalPage";

export const metadata = { title: "Privacy Policy — LOGICA @ UIC" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      dek="What we collect when you use this site, why, and how to ask us to change or delete it."
      updated="September 2026"
    >
      <LSection title="Overview">
        <p>
          LOGICA @ UIC (&ldquo;LOGICA,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a student
          organization at the University of Illinois Chicago. This policy covers the information
          this website collects and how we handle it. It doesn&apos;t cover UIC&apos;s own
          systems, or any third-party site we link to.
        </p>
      </LSection>

      <LSection title="Information we collect">
        <p>We collect information directly from you, specifically:</p>
        <LList
          items={[
            <>
              <strong>Account and membership details</strong> — name, email, and any other fields
              you fill in when you join, sign in, or update your profile.
            </>,
            <>
              <strong>Event and attendance data</strong> — which events you RSVP to or check in
              to, so we can plan capacity and follow up.
            </>,
            <>
              <strong>Form and speaker submissions</strong> — anything you submit through our
              intake forms, including speaker/guest applications.
            </>,
            <>
              <strong>Resumes</strong> — if you choose to upload one to your member profile. This
              is optional and only used to share with partners you&apos;ve consented to share it
              with (e.g., a company visit or recruiting event).
            </>,
            <>
              <strong>Messages you send us</strong> — if you email us or fill out a contact form.
            </>,
          ]}
        />
      </LSection>

      <LSection title="Cookies and sessions">
        <p>
          Signing in sets a single first-party session cookie so the site knows you&apos;re
          signed in. We don&apos;t run third-party analytics, ad trackers, or marketing pixels on
          this site.
        </p>
      </LSection>

      <LSection title="How we use it">
        <p>
          To run the org: process membership and event sign-ups, communicate about events and
          opportunities, coordinate with speakers and partners, and keep the member directory
          accurate. We don&apos;t use your information for anything beyond that.
        </p>
      </LSection>

      <LSection title="Sharing">
        <p>
          We don&apos;t sell your information. We share it only when it&apos;s the point of the
          feature you used — for example, sharing your resume with a company visiting for a
          recruiting event, only if you opted into that — or when required by law.
        </p>
      </LSection>

      <LSection title="How long we keep it">
        <p>
          We keep your information for as long as your account is active plus a reasonable
          period after, so returning members don&apos;t have to start over. You can ask us to
          delete your account and associated data at any time.
        </p>
      </LSection>

      <LSection title="Your choices">
        <p>
          Email us to see what we have on file, correct it, or delete it. We&apos;ll act on
          deletion requests within a reasonable time, except where we need to keep something for
          a legitimate reason (e.g., financial records for a paid event).
        </p>
      </LSection>

      <LSection title="Not for children">
        <p>
          This site is built for UIC students, faculty, staff, and invited guests. It isn&apos;t
          directed at children, and we don&apos;t knowingly collect information from anyone under
          13.
        </p>
      </LSection>

      <LSection title="Changes to this policy">
        <p>
          If this policy changes in a meaningful way, we&apos;ll update the date at the top of
          this page.
        </p>
      </LSection>

      <LSection title="Contact">
        <p>{contactLine}</p>
      </LSection>
    </LegalPage>
  );
}
