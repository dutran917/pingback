# PingBack market-validation site

A production-oriented demand-validation funnel for the proposed PingBack Chrome extension. This repository intentionally does **not** contain an extension, authentication, billing, messaging automation, or a lead-management product.

## What is included

- Three persisted hero variants with `?variant=a|b|c` campaign overrides
- Durable first-touch UTM/referrer/landing-path attribution
- Responsive landing page with HTML/CSS product concept mockups
- Accessible three-stage signup: waitlist → price intent → optional pain response
- Normalized, duplicate-safe email upserts into Supabase Postgres
- First-party funnel events, with optional server-side PostHog forwarding
- Privacy/terms, metadata, favicon, robots, and sitemap
- SQL queries for the complete validation report

## Local setup

Requirements: an active-LTS Node release (20.19+, 22.13+, or 24+) and a Supabase project.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in its values.
3. In Supabase SQL Editor, run `supabase/schema.sql`.
4. Start the site: `npm run dev`
5. Open `http://localhost:3000`.

Without Supabase variables the page and analytics UI still render, but waitlist submissions return a clear configuration error. The service-role key is used only in server route handlers and must never be prefixed with `NEXT_PUBLIC_`.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only Postgres REST access |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical URL for metadata/sitemap |
| `POSTHOG_API_KEY` | No | Server-side forwarding of allow-listed events |
| `POSTHOG_HOST` | No | PostHog ingest host; defaults to US cloud |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Before launch | Privacy/deletion contact |
| `NEXT_PUBLIC_LEGAL_NAME` | Before launch | Legal operator name |

## Data and security

`waitlist.email_normalized` has a unique constraint. Resubmitting an email uses Postgres `ON CONFLICT` to merge attribution and profile fields instead of making duplicates. The server rotates a random survey token on each signup and stores only its SHA-256 hash; that token is required to update price intent or feedback. Row-level security is enabled with no browser-access policies. All database writes go through server routes.

Analytics accepts only an event allow-list and known attribution properties. Email, persona, tracking method, price choice, and free text are never included in third-party analytics payloads. Price intent is represented by its named event but is not associated with an email in analytics.

## Experiment assignment

`proxy.ts` assigns new visitors equally at random to A, B, or C and saves `pb_variant` for 180 days. A valid `?variant=` parameter overrides and updates the cookie, which makes ad-specific landing URLs deterministic. The variant is included in every event and waitlist row.

Use these QA URLs: `/?variant=a` for pain positioning, `/?variant=b` for anti-CRM positioning, and `/?variant=c` for money positioning.

## Attribution

On the first visit, the client captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, referrer, and the full landing path. Values are stored in local storage and survive signup modal opens and same-browser return visits. A session ID lives in session storage and is used for unique-visitor funnel counts. New explicit UTM values override corresponding stored values.

Suggested campaign URLs (replace the host):

```text
https://YOUR-DOMAIN.com/?variant=a&utm_source=reddit&utm_medium=paid&utm_campaign=freelancer_test&utm_content=pain_a
https://YOUR-DOMAIN.com/?variant=b&utm_source=linkedin&utm_medium=outreach&utm_campaign=freelancer_test&utm_content=anti_crm_b
https://YOUR-DOMAIN.com/?variant=c&utm_source=reddit&utm_medium=paid&utm_campaign=freelancer_test&utm_content=money_c
https://YOUR-DOMAIN.com/?utm_source=reddit&utm_medium=organic&utm_campaign=research
```

For unbiased experiments, omit `variant`; for creative-specific ad tests, force it.

## Events

The `/api/events` route saves the required events in `analytics_events` and optionally forwards them to PostHog: landing view, CTA clicks, pricing and mockup impressions, waitlist steps, each price choice, feedback completion, and 50%/90% scroll depth.

PostHog setup is optional: create a project, set `POSTHOG_API_KEY` and the correct ingest host, then deploy. No browser SDK or public key is required. Events remain available in Supabase if PostHog is disabled or temporarily unavailable.

## Reading validation results

Run `supabase/validation-queries.sql` in Supabase SQL Editor. It reports:

- **Visitors:** distinct session IDs with `landing_view`
- **CTA clicks:** distinct sessions with any hero, secondary, or pricing CTA event
- **CTA conversion:** CTA-clicking sessions ÷ visitors
- **Waitlist submissions:** distinct sessions with `waitlist_submitted` (or unique rows for unique emails)
- **Visitor → waitlist:** submitting sessions ÷ visitors
- **Variant/campaign conversion:** submitting sessions ÷ landing sessions in each group
- **Persona/tracking method:** counts from deduplicated waitlist rows
- **Price intent:** count and share of answered surveys for each choice
- **% choosing Solo:** `solo` responses ÷ all non-null price-intent responses

Use a fixed time window and exclude internal/QA traffic before making decisions. A session is the operational visitor unit in the included queries; PostHog can provide longer-lived unique-person estimates if desired.

## Deploy to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add all required environment variables in Project Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and deploy.
4. Run the Supabase schema before sending traffic.
5. Test one forced URL per variant, submit a test email, complete both survey steps, and confirm rows in both Supabase tables.
6. Replace/remove the test rows before measuring live traffic.

Any Node-compatible Next.js host works. Build with `npm run build` and start with `npm start`.

## Validation checklist

Before paid traffic, replace `YOUR-DOMAIN.com`, the legal entity name, privacy/contact email, and review the privacy/terms text with counsel appropriate to your jurisdiction. Confirm Supabase region/retention settings, configure a real sending process before contacting the waitlist, and verify the final Open Graph preview on the production domain.

## Project structure

```text
app/                    Next.js pages, metadata, and API routes
components/             Landing UI, analytics, and signup flow
lib/                    Validation types and server adapters
supabase/               Schema and reporting queries
tests/                  Unit tests for input normalization/validation
proxy.ts                Persisted A/B/C assignment
```
