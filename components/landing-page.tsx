"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { EventName, Variant } from "@/lib/types";
import { useAnalytics } from "./analytics-provider";

const hero: Record<Variant, { title: React.ReactNode; sub: string; support?: string }> = {
  a: { title: <>Stop losing clients because you forgot to follow up.</>, sub: "PingBack remembers who you need to get back to — across Gmail, LinkedIn, Upwork and the rest of the web.", support: "No CRM to maintain. No complicated pipelines. Just the people who need your attention today." },
  b: { title: <>You don’t need another CRM.<br /><span>You need to remember who to follow up with.</span></>, sub: "PingBack gives freelancers one simple follow-up inbox for potential clients across the web." },
  c: { title: <>How much business are you losing because you forgot to follow up?</>, sub: "Keep every potential client on your radar — without spreadsheets, complicated CRMs, or trying to remember everything yourself." },
};

function Logo() { return <span className="logo"><i aria-hidden="true">P</i> PINGBACK</span>; }

function TrackView({ event, children, className = "" }: { event: EventName; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null); const { track } = useAnalytics();
  useEffect(() => {
    const node = ref.current; if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { track(event); observer.disconnect(); } }, { threshold: .35 });
    observer.observe(node); return () => observer.disconnect();
  }, [event, track]);
  return <div ref={ref} className={className}>{children}</div>;
}

function BrowserMockup() {
  return <div className="browser" aria-label="Concept mockup of PingBack beside a LinkedIn profile">
    <div className="browser-bar"><span /><span /><span /><div className="address">linkedin.com/in/johnsmith</div></div>
    <div className="browser-body">
      <div className="profile-pane"><div className="network-nav">in <div className="network-search" /></div><div className="cover" /><div className="profile-content"><div className="avatar">JS</div><h3>John Smith</h3><p>Founder at Acme Inc.</p><p className="muted">Austin, Texas · 500+ connections</p><button className="network-button">Message</button><div className="profile-lines"><i/><i/><i/></div></div></div>
      <div className="side-panel"><div className="panel-brand"><Logo /><button aria-label="Close mockup">×</button></div><div className="panel-heading"><span>TODAY</span><b>2</b></div>
        <MiniLead name="John Smith" company="Acme Inc" value="$3,000" detail="Proposal sent" time="2 days overdue" overdue />
        <MiniLead name="Sarah Miller" company="Pixel Studio" value="$1,500" detail="Follow up today" time="Gmail" />
        <button className="add-person">＋ ADD PERSON</button>
      </div>
    </div>
  </div>;
}

function MiniLead({ name, company, value, detail, time, overdue }: { name: string; company: string; value: string; detail: string; time: string; overdue?: boolean }) {
  return <div className="mini-lead"><div><b>{name}</b><span>{company}</span></div><strong>{value}</strong><p>{detail}</p><small className={overdue ? "overdue" : ""}>{time}</small><button>FOLLOW UP <span>↗</span></button></div>;
}

const channelNames = ["Gmail", "LinkedIn", "Upwork", "Facebook", "Websites", "Referrals"];
const workflow = [
  ["▦", "GOOGLE SHEETS", "When did I last message John?"], ["□", "CALENDAR", "Why did I create this reminder?"],
  ["M", "GMAIL", "I know there was someone I needed to reply to..."], ["⌁", "YOUR BRAIN", "I’ll remember."],
];

function HowItWorks() {
  return <section className="section how" id="how-it-works"><div className="container"><p className="eyebrow">How it works</p><h2>Remember now. Follow up at the right time.</h2>
    <div className="steps">
      <article><span className="step-number">01</span><h3>Find someone worth remembering.</h3><p>You’re talking to a potential <b>$3,000 client</b> on LinkedIn.</p><div className="message-bubble"><div className="tiny-avatar">JS</div><p>Thanks for sending that over. I’ll review it with my partner.</p></div></article>
      <article><span className="step-number">02</span><h3>Tell PingBack.</h3><div className="capture-card"><b>John Smith</b><label>Potential value <strong>$3,000</strong></label><label>Note <span>Sent proposal.<br/>Waiting for partner.</span></label><label>Remind me:</label><div className="remind-options"><span>Tomorrow</span><span className="selected">3 days</span><span>1 week</span></div></div></article>
      <article><span className="step-number">03</span><h3>Forget about it.</h3><p>Get back to your work. PingBack will bring them back when it matters.</p><div className="notification"><div><Logo /><small>now</small></div><b>Follow up with John Smith</b><p>$3,000 potential opportunity</p><span>You planned to follow up today.</span></div></article>
    </div>
  </div></section>;
}

function TodayMockup() {
  const leads = [
    ["JS", "John Smith", "Acme Inc", "$3,000", "Proposal sent", "2 days overdue", "LinkedIn"],
    ["SM", "Sarah Miller", "Pixel Studio", "$4,200", "Waiting for reply", "Today", "Gmail"],
    ["MP", "Mike Peterson", "", "$1,500", "Quote sent", "Today", "Upwork"],
  ];
  return <TrackView event="mockup_viewed" className="today-wrap"><div className="today-copy"><p className="eyebrow">Your follow-up inbox</p><h2>Know exactly who needs your attention.</h2><p>Every opportunity, ordered by what needs a response—not where the conversation started.</p></div><div className="today-app"><div className="today-sidebar"><Logo /><nav><b>● Today <span>3</span></b><span>○ Upcoming</span><span>◇ All people</span></nav><small>Private beta concept</small></div><div className="today-main"><header><div><p>TODAY</p><h3>3 people need your attention</h3></div><div className="revenue"><span>Potential revenue</span><strong>$8,700</strong></div></header><div className="lead-table">{leads.map((lead, i) => <div className="lead-row" key={lead[1]}><div className={`lead-avatar tone-${i}`}>{lead[0]}</div><div className="lead-name"><b>{lead[1]}</b><span>{lead[2]}</span></div><strong>{lead[3]}</strong><div className="lead-status"><b>{lead[4]}</b><span className={i === 0 ? "red" : ""}>{lead[5]}</span></div><span className="source-pill">{lead[6]}</span><button>FOLLOW UP ↗</button></div>)}</div></div></div></TrackView>;
}

export function LandingPage({ variant, openWaitlist }: { variant: Variant; openWaitlist: (event: EventName) => void }) {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@YOUR-DOMAIN.com";
  return <>
    <header className="site-header"><div className="container nav"><a href="#top" aria-label="PingBack home"><Logo /></a><nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav><button className="button nav-cta" onClick={() => openWaitlist("secondary_cta_clicked")}>Get Early Access</button></div></header>
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><div className="beta-pill"><span /> Coming soon to Chrome</div><h1>{hero[variant].title}</h1><p className="hero-sub">{hero[variant].sub}</p>{hero[variant].support && <p className="hero-support">{hero[variant].support}</p>}<button className="button primary hero-button" onClick={() => openWaitlist("hero_cta_clicked")}>Get Early Access <span>→</span></button><p className="microcopy">Chrome extension <i>•</i> Private beta <i>•</i> No credit card</p></div><TrackView event="mockup_viewed"><BrowserMockup /></TrackView></div></section>

      <section className="section channels"><div className="container"><div className="section-heading"><p className="eyebrow">One place to remember</p><h2>Your leads are everywhere.<br/><span>Your follow-ups shouldn’t be.</span></h2></div><div className="channel-flow"><div className="channel-list">{channelNames.map((name, i) => <div key={name}><span className={`channel-icon c${i}`}>{name[0]}</span>{name}</div>)}</div><div className="flow-lines" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="ping-node"><Logo /></div><span className="flow-arrow" aria-hidden="true">→</span><div className="attention-card"><small>TODAY</small><b>Who needs your<br/>attention today?</b><span>3 follow-ups waiting →</span></div></div></div></section>

      <section className="section workflow"><div className="container"><p className="eyebrow">The current reality</p><h2>You’re probably managing follow-ups like this.</h2><div className="workflow-grid">{workflow.map(([icon, title, copy]) => <article key={title}><div className="workflow-icon">{icon}</div><small>{title}</small><p>“{copy}”</p></article>)}</div><p className="statement">You shouldn’t need a full CRM just to remember who to follow up with.</p></div></section>

      <HowItWorks />
      <section className="section center-cta"><button className="button primary" onClick={() => openWaitlist("secondary_cta_clicked")}>Get Early Access <span>→</span></button><p>Desktop Chrome · Private beta</p></section>
      <section className="section product-section"><div className="container"><TodayMockup /></div></section>

      <section className="section anti-crm"><div className="container anti-grid"><div><p className="eyebrow">Built to stay simple</p><h2>Less CRM.<br/>More follow-up.</h2><p>PingBack is designed for people who don’t want another system to maintain.</p><ul><li>No complex pipeline setup.</li><li>No 40-field contact forms.</li><li>No sales dashboards you never open.</li><li>No enterprise workflow builder.</li></ul></div><div className="simple-card"><p>Just:</p><div><span>01</span><b>WHO</b><small>the person is</small></div><div><span>02</span><b>WHEN</b><small>to follow up</small></div><div><span>03</span><b>WHY</b><small>they matter</small></div><footer>PingBack reminds you. <i>✓</i></footer></div></div></section>

      <section className="section users"><div className="container"><p className="eyebrow">Made for independents</p><h2>Built for people who find their own clients.</h2><div className="user-pills">{["Freelance Developers", "Designers", "SEO Consultants", "Marketing Consultants", "Copywriters", "Solo Consultants", "Small Agency Owners"].map((name, i) => <div key={name}><span>{["⌘","✦","↗","◎","✎","◌","◇"][i]}</span>{name}</div>)}</div></div></section>

      <TrackView event="pricing_viewed" className="section pricing" ><section id="pricing"><div className="container"><p className="eyebrow">Planned pricing</p><h2>Simple product. Simple pricing.</h2><p className="pricing-intro">Join the beta now. No payment required.</p><div className="price-grid"><article><div><h3>FREE</h3><p>For trying a calmer way to follow up.</p></div><div className="price"><sup>$</sup>0 <span>forever</span></div><ul><li>Up to 10 people</li><li>Follow-up reminders</li><li>Notes</li><li>Chrome notifications</li></ul><button className="button outline wide" onClick={() => openWaitlist("pricing_free_clicked")}>Get Early Access</button></article><article className="featured"><div className="price-badge">PLANNED PRICING</div><div><h3>SOLO</h3><p>For freelancers with opportunities in motion.</p></div><div className="price"><sup>$</sup>9.99 <span>/ month</span></div><ul><li>Unlimited people</li><li>Unlimited reminders</li><li>Follow-up history</li><li>Revenue at Risk</li></ul><button className="button primary wide" onClick={() => openWaitlist("pricing_solo_clicked")}>Get Early Access</button></article></div><div className="beta-free"><span>✦</span><p><b>Early beta users get Solo free during the beta period.</b><br/>We won’t ask for a credit card today.</p></div></div></section></TrackView>

      <section className="section faq" id="faq"><div className="container faq-grid"><div><p className="eyebrow">Questions, answered</p><h2>FAQ</h2><p>Still wondering if PingBack is for you?</p></div><div className="faq-list">{[
        ["What is PingBack?", "PingBack is a follow-up inbox concept for freelancers. It’s being developed as a desktop Chrome extension that helps you remember who to contact, when, and why."],
        ["Is PingBack a CRM?", "No. It’s intentionally narrower: a simple reminder layer for people and opportunities you don’t want to forget."],
        ["Does PingBack automatically message my clients?", "No. PingBack is planned to remind you; you stay in control of what you send and when."],
        ["Which websites will it work with?", "We’re exploring a universal workflow across sites such as Gmail, LinkedIn, Upwork, and the wider web. Exact site support will be determined during development."],
        ["How much will PingBack cost?", "The planned Free tier supports up to 10 people. The planned Solo tier is $9.99/month. Beta users will get Solo free during the beta."],
        ["When can I use it?", "PingBack is currently in development. Join the private beta list and we’ll let you know when early access is ready."],
      ].map(([q, a]) => <details key={q}><summary>{q}<span>＋</span></summary><p>{a}</p></details>)}</div></div></section>

      <section className="final-cta"><div className="container"><div className="beta-pill dark"><span /> Private beta</div><h2>The next client is worth<br/>remembering.</h2><p>Be first to try the follow-up inbox built for freelancers.</p><button className="button lime" onClick={() => openWaitlist("secondary_cta_clicked")}>Get Early Access <span>→</span></button><small>No credit card · Desktop Chrome · Coming soon</small></div></section>
    </main>
    <footer className="footer"><div className="container"><Logo /><p>A follow-up inbox for people who don’t want a CRM.</p><nav><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href={`mailto:${contactEmail}`}>Contact</a></nav><small>© {new Date().getFullYear()} PingBack. Product in development.</small></div></footer>
  </>;
}
