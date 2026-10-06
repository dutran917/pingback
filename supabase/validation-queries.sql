-- Set the date range as needed in each WHERE clause.

-- Overall funnel. Visitors are distinct sessions, not raw page views.
with totals as (
  select
    count(distinct session_id) filter (where event_name='landing_view') visitors,
    count(distinct session_id) filter (where event_name in ('hero_cta_clicked','secondary_cta_clicked','pricing_free_clicked','pricing_solo_clicked')) cta_clickers,
    count(distinct session_id) filter (where event_name='waitlist_submitted') waitlist_sessions
  from analytics_events where created_at >= now() - interval '30 days'
)
select *, round(100.0*cta_clickers/nullif(visitors,0),1) cta_rate_pct,
  round(100.0*waitlist_sessions/nullif(visitors,0),1) visitor_to_waitlist_pct from totals;

-- Conversion by A/B/C variant.
select variant,
  count(distinct session_id) filter (where event_name='landing_view') visitors,
  count(distinct session_id) filter (where event_name='waitlist_submitted') waitlists,
  round(100.0*count(distinct session_id) filter (where event_name='waitlist_submitted') /
    nullif(count(distinct session_id) filter (where event_name='landing_view'),0),1) conversion_pct
from analytics_events group by variant order by variant;

-- Conversion by campaign.
select coalesce(utm_campaign,'(direct / none)') campaign,
  count(distinct session_id) filter (where event_name='landing_view') visitors,
  count(distinct session_id) filter (where event_name='waitlist_submitted') waitlists,
  round(100.0*count(distinct session_id) filter (where event_name='waitlist_submitted') /
    nullif(count(distinct session_id) filter (where event_name='landing_view'),0),1) conversion_pct
from analytics_events group by 1 order by visitors desc;

-- Waitlist breakdowns.
select persona, count(*) from waitlist group by persona order by count(*) desc;
select current_tracking_method, count(*) from waitlist group by current_tracking_method order by count(*) desc;
select price_intent, count(*), round(100.0*count(*)/sum(count(*)) over(),1) percent from waitlist where price_intent is not null group by price_intent order by count(*) desc;

-- Primary willingness-to-pay metric.
select count(*) filter (where price_intent='solo') solo_count,
  count(*) filter (where price_intent is not null) answered,
  round(100.0*count(*) filter (where price_intent='solo') /
    nullif(count(*) filter (where price_intent is not null),0),1) solo_share_pct
from waitlist;
