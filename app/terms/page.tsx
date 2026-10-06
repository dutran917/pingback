import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms — PingBack" };
export default function Terms() {
  const legalName = process.env.NEXT_PUBLIC_LEGAL_NAME ?? "[REPLACE WITH LEGAL ENTITY NAME]";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "legal@[REPLACE-WITH-YOUR-DOMAIN].com";
  return <main className="legal"><div className="legal-nav"><Link href="/" className="logo"><i>P</i> PINGBACK</Link><Link href="/">← Back to home</Link></div><article><p className="eyebrow">Legal</p><h1>Website Terms</h1><p className="legal-date">Last updated: October 6, 2026</p><div className="placeholder-warning"><b>Before publishing:</b> Replace the legal entity and contact placeholders.</div>
    <h2>Validation website</h2><p>This website is operated by {legalName} to evaluate interest in PingBack. PingBack is not currently available, and joining the waitlist does not guarantee access, a release date, features, integrations, or final pricing.</p>
    <h2>Planned pricing</h2><p>Any pricing shown is proposed for validation purposes. You will not be charged through this website. Planned pricing may change before launch.</p>
    <h2>Acceptable use</h2><p>Do not misuse the website, attempt unauthorized access, interfere with its operation, or submit unlawful or abusive content.</p>
    <h2>Disclaimers</h2><p>The website is provided “as is” for market research. To the extent permitted by law, we disclaim warranties and liability arising from use of this site. Nothing here limits rights that cannot legally be limited.</p>
    <h2>Contact</h2><p>Questions: <a href={`mailto:${email}`}>{email}</a></p>
  </article></main>;
}
