-- Run once in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null unique,
  persona text,
  current_tracking_method text,
  variant text not null check (variant in ('a','b','c')),
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  referrer text, landing_path text,
  price_intent text check (price_intent in ('free','solo','no','unsure')),
  pain_response varchar(600),
  survey_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  session_id text not null,
  variant text not null check (variant in ('a','b','c')),
  utm_source text, utm_medium text, utm_campaign text, utm_content text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_created_idx on public.analytics_events(event_name, created_at);
create index if not exists analytics_events_variant_idx on public.analytics_events(variant);
create index if not exists analytics_events_campaign_idx on public.analytics_events(utm_campaign);

alter table public.waitlist enable row level security;
alter table public.analytics_events enable row level security;
-- No public policies: only the server-side service role can read/write these tables.
