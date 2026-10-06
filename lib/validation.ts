import { eventNames, type EventName, type Variant } from "./types";

export const isVariant = (value: unknown): value is Variant =>
  value === "a" || value === "b" || value === "c";

export const isEventName = (value: unknown): value is EventName =>
  typeof value === "string" && (eventNames as readonly string[]).includes(value);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const validEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
