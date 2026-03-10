import { describe, it, expect } from "vitest";
import { validateHubSpotToken, validateHubSpotWritePermission } from "./hubspotSync";

describe("HubSpot Sync", () => {
  it("should validate the HubSpot access token (read)", async () => {
    const isValid = await validateHubSpotToken();
    expect(isValid).toBe(true);
  });

  it("should validate the HubSpot access token has write permission", async () => {
    const hasWrite = await validateHubSpotWritePermission();
    expect(hasWrite).toBe(true);
  });
});
