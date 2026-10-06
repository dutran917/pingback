"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAnalytics } from "./analytics-provider";

type Step = "signup" | "price" | "pain" | "done";
type Submission = { id: string; token: string };

const personas = [
  ["", "Select one (optional)"], ["developer", "Freelance Developer"], ["designer", "Designer"],
  ["marketing_seo", "Marketing / SEO"], ["consultant", "Consultant"], ["copywriter", "Copywriter"],
  ["agency_owner", "Agency Owner"], ["other", "Other"],
];
const methods = [
  ["", "Select one (optional)"], ["memory", "I just remember"], ["spreadsheets", "Google Sheets / Excel"],
  ["calendar", "Calendar / reminders"], ["notes", "Notes / Notion"], ["crm", "CRM"], ["other", "Other"],
];
const priceOptions = [
  ["free", "Free — up to 10 people"], ["solo", "Solo — $9.99/month"],
  ["no", "I probably wouldn't pay for this"], ["unsure", "I'm not sure yet"],
] as const;

export function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { attribution, track } = useAnalytics();
  const [step, setStep] = useState<Step>("signup");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [price, setPrice] = useState("");
  const [pain, setPain] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  function close() {
    dialog.current?.close();
    onClose();
  }

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"), persona: form.get("persona"),
          current_tracking_method: form.get("tracking"), ...attribution,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong.");
      setSubmission(result); setStep("price"); track("waitlist_submitted"); track("price_survey_viewed");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { setBusy(false); }
  }

  async function patch(payload: Record<string, string>) {
    if (!submission) throw new Error("Missing submission");
    const response = await fetch("/api/waitlist", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submission, ...payload }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Something went wrong.");
  }

  async function submitPrice(event: FormEvent) {
    event.preventDefault(); if (!price) return;
    setBusy(true); setError("");
    try {
      await patch({ price_intent: price });
      track(`price_intent_${price}` as "price_intent_free"); setStep("pain");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { setBusy(false); }
  }

  async function submitPain(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (pain.trim()) { await patch({ pain_response: pain }); track("pain_response_submitted"); }
      setStep("done");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { setBusy(false); }
  }

  return <dialog ref={dialog} className="modal" onCancel={close} onClose={onClose} aria-labelledby="modal-title">
    <button className="modal-close" onClick={close} aria-label="Close signup">×</button>
    <div className="modal-progress" aria-label={`Step ${step === "signup" ? 1 : step === "price" ? 2 : 3} of 3`}>
      <span className="active" /><span className={step !== "signup" ? "active" : ""} /><span className={step === "pain" || step === "done" ? "active" : ""} />
    </div>
    {step === "signup" && <form onSubmit={submitSignup}>
      <p className="eyebrow">Private beta</p>
      <h2 id="modal-title">Get early access to PingBack</h2>
      <p>We’re building PingBack for freelancers who want a simpler way to stay on top of potential clients.</p>
      <label>Email <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>What best describes you?<select name="persona">{personas.map(([v, l]) => <option value={v} key={v}>{l}</option>)}</select></label>
      <label>How do you currently track follow-ups?<select name="tracking">{methods.map(([v, l]) => <option value={v} key={v}>{l}</option>)}</select></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary wide" disabled={busy}>{busy ? "Joining…" : "Join the Private Beta"}</button>
      <p className="privacy-note">No spam. We’ll only contact you about PingBack.</p>
    </form>}
    {step === "price" && <form onSubmit={submitPrice}>
      <p className="success-mark" aria-hidden="true">✓</p>
      <h2 id="modal-title">You’re on the list.</h2>
      <h3>One quick question.</h3>
      <p>If PingBack were available today, which option would you choose?</p>
      <fieldset className="choice-list"><legend className="sr-only">Price preference</legend>
        {priceOptions.map(([value, label]) => <label className="radio-card" key={value}><input type="radio" name="price" value={value} checked={price === value} onChange={() => setPrice(value)} required /><span>{label}</span></label>)}
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary wide" disabled={busy || !price}>{busy ? "Saving…" : "Submit"}</button>
    </form>}
    {step === "pain" && <form onSubmit={submitPain}>
      <p className="eyebrow">Optional</p>
      <h2 id="modal-title">What’s the hardest part about keeping up with potential clients?</h2>
      <label><span className="sr-only">Your response</span><textarea value={pain} onChange={(e) => setPain(e.target.value)} maxLength={600} rows={5} placeholder="Tell us what gets in the way…" /></label>
      <div className="character-count">{pain.length}/600</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary wide" disabled={busy}>{busy ? "Saving…" : pain.trim() ? "Send response" : "Finish"}</button>
    </form>}
    {step === "done" && <div className="modal-done">
      <p className="success-mark" aria-hidden="true">✓</p><h2 id="modal-title">Thanks — this genuinely helps us decide what to build.</h2>
      <p>We’ll be in touch when the private beta is ready.</p><button className="button secondary" onClick={close}>Done</button>
    </div>}
  </dialog>;
}
