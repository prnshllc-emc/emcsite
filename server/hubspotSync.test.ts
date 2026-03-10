import { describe, it, expect } from "vitest";
import { validateHubSpotToken } from "./hubspotSync";

describe("HubSpot Sync", () => {
  it("should validate the HubSpot access token", async () => {
    const isValid = await validateHubSpotToken();
    expect(isValid).toBe(true);
  });
});
