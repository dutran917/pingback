export type Variant = "a" | "b" | "c";

export type Attribution = {
  variant: Variant;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
  session_id: string;
};

export const eventNames = [
  "landing_view", "hero_cta_clicked", "secondary_cta_clicked", "pricing_viewed",
  "pricing_free_clicked", "pricing_solo_clicked", "waitlist_opened", "waitlist_submitted",
  "price_survey_viewed", "price_intent_free", "price_intent_solo", "price_intent_no",
  "price_intent_unsure", "pain_response_submitted", "mockup_viewed", "scroll_50", "scroll_90",
] as const;

export type EventName = (typeof eventNames)[number];
