import { headers } from "next/headers";
import { ValidationApp } from "@/components/validation-app";
import type { Variant } from "@/lib/types";

export default async function Home() {
  const variant = ((await headers()).get("x-pingback-variant") ?? "a") as Variant;
  return <ValidationApp variant={variant} />;
}
