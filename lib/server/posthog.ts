import "server-only";
import type { EventName } from "@/lib/types";

export async function forwardToPostHog(
  event: EventName,
  distinctId: string,
  properties: Record<string, string | undefined>,
) {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return;
  const host = process.env.POSTHOG_HOST ?? "https://us.i.posthog.com";
  try {
    await fetch(`${host.replace(/\/$/, "")}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, event, properties: { distinct_id: distinctId, ...properties } }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("PostHog forwarding failed", error);
  }
}
