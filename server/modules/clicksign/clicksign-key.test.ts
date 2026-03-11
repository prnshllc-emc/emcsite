import { describe, it, expect } from "vitest";

describe("Clicksign API Token Validation", () => {
  it("should have CLICKSIGN_API_TOKEN set", () => {
    const token = process.env.CLICKSIGN_API_TOKEN;
    expect(token).toBeDefined();
    expect(token!.length).toBeGreaterThan(10);
  });

  it("should authenticate with Clicksign API v1 (list documents)", async () => {
    const token = process.env.CLICKSIGN_API_TOKEN;
    // Clicksign v1 API uses query param ?access_token=
    const response = await fetch(
      `https://app.clicksign.com/api/v1/documents?access_token=${token}&page=1&per_page=1`
    );
    // 200 = valid token, 401 = invalid token
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
    console.log(
      `Clicksign API connected successfully. Documents found: ${
        Array.isArray(data.documents) ? data.documents.length : "unknown"
      }`
    );
  }, 15000);
});
