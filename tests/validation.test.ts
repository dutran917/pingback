import test from "node:test";
import assert from "node:assert/strict";
import { cleanText, isEventName, isVariant, normalizeEmail, validEmail } from "../lib/validation";

test("normalizes and validates email", () => {
  assert.equal(normalizeEmail("  Person@Example.COM "), "person@example.com");
  assert.equal(validEmail("person@example.com"), true);
  assert.equal(validEmail("not-an-email"), false);
});

test("accepts only experiment variants and known events", () => {
  assert.equal(isVariant("a"), true);
  assert.equal(isVariant("d"), false);
  assert.equal(isEventName("landing_view"), true);
  assert.equal(isEventName("email_captured"), false);
});

test("bounds text fields", () => {
  assert.equal(cleanText("  abcdef  ", 3), "abc");
  assert.equal(cleanText(null, 20), "");
});
