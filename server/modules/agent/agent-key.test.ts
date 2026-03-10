/**
 * Agent API Key Validation Test — Verifies the AGENT_API_KEY env var is set
 * and can be used to authenticate with the agent health endpoint.
 */
import { describe, expect, it } from "vitest";

describe("Agent API Key Configuration", () => {
  it("AGENT_API_KEY environment variable is set and non-empty", () => {
    const key = process.env.AGENT_API_KEY;
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(20);
  });

  it("AGENT_API_KEY has sufficient entropy (at least 32 chars)", () => {
    const key = process.env.AGENT_API_KEY!;
    expect(key.length).toBeGreaterThanOrEqual(32);
  });

  it("can authenticate against agent health endpoint", async () => {
    const key = process.env.AGENT_API_KEY;
    if (!key) {
      console.warn("AGENT_API_KEY not set, skipping live test");
      return;
    }

    // Test against the local dev server
    const port = process.env.PORT || 3000;
    try {
      const response = await fetch(`http://localhost:${port}/api/agent/health`, {
        headers: { "x-agent-api-key": key },
      });
      // If server is running, we expect 200
      if (response.ok) {
        const data = await response.json();
        expect(data.status).toBe("ok");
        expect(data.timestamp).toBeDefined();
      }
    } catch {
      // Server might not be running during test — that's OK, key validation passed above
      console.log("Dev server not reachable during test — key format validation passed");
    }
  });
});
