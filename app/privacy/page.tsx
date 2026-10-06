import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy — PingBack", description: "Privacy information for the PingBack market validation website." };

export default function Privacy() {
  const legalName = process.env.NEXT_PUBLIC_LEGAL_NAME ?? "[REPLACE WITH LEGAL ENTITY NAME]";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "privacy@[REPLACE-WITH-YOUR-DOMAIN].com";
  return <main className="legal"><div className="legal-nav"><Link href="/" className="logo"><i>P</i> PINGBACK</Link><Link href="/">← Back to home</Link></div><article><p className="eyebrow">Legal</p><h1>Privacy Policy</h1><p className="legal-date">Last updated: October 6, 2026</p><div className="placeholder-warning"><b>Before publishing:</b> Replace the bracketed legal entity and contact placeholders on this page and in your environment variables.</div>
    <h2>About this website</h2><p>This policy applies to the PingBack market-validation website operated by {legalName}. PingBack is currently being developed. This policy does not describe a released Chrome extension or its future data practices.</p>
    <h2>Information we collect</h2><p>When you join the waitlist, we collect your email address and, if you choose to provide them, your professional role, current follow-up method, pricing preference, and written feedback.</p><p>We also collect limited usage and attribution data, such as the page variant shown, button clicks, an anonymous session identifier, referring page, and standard UTM campaign parameters. We do not send your email address or written survey feedback to third-party analytics.</p>
    <h2>How we use information</h2><p>We use this information to evaluate interest in PingBack, understand which positioning is useful, plan the product, operate the waitlist, and contact you about PingBack’s development and private beta.</p>
    <h2>Service providers</h2><p>We may use Supabase to store waitlist and event data, PostHog for product analytics when configured, and a hosting provider such as Vercel. These providers process data on our behalf under their applicable terms.</p>
    <h2>Retention and deletion</h2><p>We retain validation data while it is useful for the purposes above or as required by law. You may ask us to delete your waitlist information by emailing <a href={`mailto:${email}`}>{email}</a>.</p>
    <h2>Your choices</h2><p>Optional survey questions can be skipped. You may also block analytics requests using browser privacy tools. To stop waitlist communications, use the unsubscribe option in an email or contact us.</p>
    <h2>Contact</h2><p>Questions or deletion requests: <a href={`mailto:${email}`}>{email}</a><br/>Controller/operator: {legalName}</p>
  </article></main>;
}
