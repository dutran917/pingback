import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cleanText, isVariant, normalizeEmail, validEmail } from "@/lib/validation";
import { databaseConfigured, supabaseRequest } from "@/lib/server/supabase";

export const runtime = "nodejs";

const personas = ["developer", "designer", "marketing_seo", "consultant", "copywriter", "agency_owner", "other", ""];
const methods = ["memory", "spreadsheets", "calendar", "notes", "crm", "other", ""];
const intents = ["free", "solo", "no", "unsure"];
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Waitlist storage is not configured yet." }, { status: 503 });
  }
  try {
    const data = await request.json();
    const email = normalizeEmail(cleanText(data.email, 254));
    const persona = cleanText(data.persona, 40);
    const method = cleanText(data.current_tracking_method, 40);
    if (!validEmail(email) || !isVariant(data.variant) || !personas.includes(persona) || !methods.includes(method)) {
      return NextResponse.json({ error: "Please check your submission." }, { status: 400 });
    }

    const token = randomBytes(32).toString("hex");
    const rows = await supabaseRequest<Array<{ id: string }>>(
      "waitlist?on_conflict=email_normalized&select=id",
      "POST",
      {
        email,
        email_normalized: email,
        persona: persona || null,
        current_tracking_method: method || null,
        variant: data.variant,
        utm_source: cleanText(data.utm_source, 200) || null,
        utm_medium: cleanText(data.utm_medium, 200) || null,
        utm_campaign: cleanText(data.utm_campaign, 200) || null,
        utm_content: cleanText(data.utm_content, 200) || null,
        utm_term: cleanText(data.utm_term, 200) || null,
        referrer: cleanText(data.referrer, 500) || null,
        landing_path: cleanText(data.landing_path, 500) || null,
        survey_token_hash: digest(token),
        updated_at: new Date().toISOString(),
      },
      "resolution=merge-duplicates,return=representation",
    );
    return NextResponse.json({ id: rows[0].id, token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "We couldn't save your email. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  try {
    const data = await request.json();
    const id = cleanText(data.id, 80);
    const token = cleanText(data.token, 128);
    if (!id || !token) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const matches = await supabaseRequest<Array<{ id: string }>>(
      `waitlist?id=eq.${encodeURIComponent(id)}&survey_token_hash=eq.${digest(token)}&select=id`, "GET",
    );
    if (!matches.length) return NextResponse.json({ error: "Invalid survey link" }, { status: 403 });

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (data.price_intent !== undefined) {
      if (!intents.includes(data.price_intent)) return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
      updates.price_intent = data.price_intent;
    }
    if (data.pain_response !== undefined) updates.pain_response = cleanText(data.pain_response, 600);
    await supabaseRequest(`waitlist?id=eq.${encodeURIComponent(id)}`, "PATCH", updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "We couldn't save that response." }, { status: 500 });
  }
}
