import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PingBack — Never Forget a Client Follow-Up",
  description: "A simple follow-up reminder for freelancers who don't want a CRM. Keep potential clients from Gmail, LinkedIn, Upwork and the web in one place.",
  openGraph: { title: "PingBack — Never Forget a Client Follow-Up", description: "One simple follow-up inbox for freelancers. Coming soon to desktop Chrome.", url: siteUrl, siteName: "PingBack", type: "website" },
  twitter: { card: "summary_large_image", title: "PingBack — Never Forget a Client Follow-Up", description: "A follow-up inbox for people who don't want a CRM." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8f7f3" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
