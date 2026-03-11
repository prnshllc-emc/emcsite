/**
 * Tests for the Stage Notification Service.
 *
 * Tests the channel determination logic:
 * - Email only → sends email
 * - Phone only → sends whatsapp
 * - Both → sends both
 * - Neither → flags admin
 */
import { describe, it, expect } from "vitest";
import { determineChannels } from "./service";

describe("Notification Channel Determination", () => {
  it("should send email when only email is available", () => {
    const result = determineChannels("user@example.com", null);
    expect(result.channels).toEqual(["email"]);
    expect(result.flagForAdmin).toBe(false);
  });

  it("should send whatsapp when only phone is available", () => {
    const result = determineChannels(null, "+5511999999999");
    expect(result.channels).toEqual(["whatsapp"]);
    expect(result.flagForAdmin).toBe(false);
  });

  it("should send both when email and phone are available", () => {
    const result = determineChannels("user@example.com", "+5511999999999");
    expect(result.channels).toEqual(["email", "whatsapp"]);
    expect(result.flagForAdmin).toBe(false);
  });

  it("should flag admin when neither email nor phone is available", () => {
    const result = determineChannels(null, null);
    expect(result.channels).toEqual(["admin_flag"]);
    expect(result.flagForAdmin).toBe(true);
    expect(result.flagReason).toBeTruthy();
  });

  it("should flag admin when email is empty string", () => {
    const result = determineChannels("", null);
    expect(result.channels).toEqual(["admin_flag"]);
    expect(result.flagForAdmin).toBe(true);
  });

  it("should flag admin when phone is empty string", () => {
    const result = determineChannels(null, "");
    expect(result.channels).toEqual(["admin_flag"]);
    expect(result.flagForAdmin).toBe(true);
  });

  it("should flag admin when both are whitespace", () => {
    const result = determineChannels("   ", "   ");
    expect(result.channels).toEqual(["admin_flag"]);
    expect(result.flagForAdmin).toBe(true);
  });

  it("should send email when email is valid but phone is whitespace", () => {
    const result = determineChannels("user@example.com", "   ");
    expect(result.channels).toEqual(["email"]);
    expect(result.flagForAdmin).toBe(false);
  });

  it("should send whatsapp when phone is valid but email is whitespace", () => {
    const result = determineChannels("   ", "+5511999999999");
    expect(result.channels).toEqual(["whatsapp"]);
    expect(result.flagForAdmin).toBe(false);
  });
});
