"use client";

import { useCallback, useState } from "react";
import type { EventName, Variant } from "@/lib/types";
import { AnalyticsProvider, useAnalytics } from "./analytics-provider";
import { WaitlistModal } from "./waitlist-modal";
import { LandingPage } from "./landing-page";

export function ValidationApp({ variant }: { variant: Variant }) {
  return <AnalyticsProvider variant={variant}><ValidationInner variant={variant} /></AnalyticsProvider>;
}

function ValidationInner({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);
  const { track } = useAnalytics();
  const openWaitlist = useCallback((event: EventName) => {
    track(event); track("waitlist_opened"); setOpen(true);
  }, [track]);
  return <>
    <LandingPage variant={variant} openWaitlist={openWaitlist} />
    <WaitlistModal open={open} onClose={() => setOpen(false)} />
  </>;
}
