import { NextResponse } from "next/server";
import { isEventName, isVariant, cleanText } from "@/lib/validation";
import { databaseConfigured, supabaseRequest } from "@/lib/server/supabase";
import { forwardToPostHog } from "@/lib/server/posthog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!isEventName(data.event) || !isVariant(data.variant)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
    const sessionId = cleanText(data.session_id, 100);
    if (!sessionId) return NextResponse.json({ error: "Missing session" }, { status: 400 });

    const properties = {
      variant: data.variant,
      utm_source: cleanText(data.utm_source, 200) || undefined,
      utm_medium: cleanText(data.utm_medium, 200) || undefined,
      utm_campaign: cleanText(data.utm_campaign, 200) || undefined,
      utm_content: cleanText(data.utm_content, 200) || undefined,
      referrer: cleanText(data.referrer, 500) || undefined,
    };

    const jobs: Promise<unknown>[] = [forwardToPostHog(data.event, sessionId, properties)];
    if (databaseConfigured()) {
      jobs.push(supabaseRequest("analytics_events", "POST", {
        event_name: data.event,
        session_id: sessionId,
        variant: data.variant,
        utm_source: properties.utm_source,
        utm_medium: properties.utm_medium,
        utm_campaign: properties.utm_campaign,
        utm_content: properties.utm_content,
        referrer: properties.referrer,
      }));
    }
    await Promise.allSettled(jobs);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
