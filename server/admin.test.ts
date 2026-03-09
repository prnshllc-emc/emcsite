import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user-123",
    email: "admin@enviandomeucarro.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user-456",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ============================================================
// SETTINGS ROUTES
// ============================================================

describe("settings routes", () => {
  it("admin can list settings", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.settings.list();
    expect(Array.isArray(result)).toBe(true);
    // Should have seeded settings
    expect(result.length).toBeGreaterThan(0);
  });

  it("admin can list settings by category", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.settings.listByCategory({ category: "contact" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    for (const s of result) {
      expect(s.category).toBe("contact");
    }
  });

  it("admin can upsert a setting", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.settings.upsert({
      key: "test_setting_vitest",
      value: "test_value_123",
      label: "Test Setting",
      category: "test",
    });
    expect(result).toEqual({ success: true });

    // Verify it was saved
    const all = await caller.settings.list();
    const found = all.find((s) => s.key === "test_setting_vitest");
    expect(found).toBeDefined();
    expect(found?.value).toBe("test_value_123");

    // Clean up
    await caller.settings.delete({ key: "test_setting_vitest" });
  });

  it("admin can delete a setting", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    // Create then delete
    await caller.settings.upsert({
      key: "test_delete_vitest",
      value: "to_delete",
      label: "Delete Me",
      category: "test",
    });

    const result = await caller.settings.delete({ key: "test_delete_vitest" });
    expect(result).toEqual({ success: true });

    // Verify it was deleted
    const all = await caller.settings.list();
    const found = all.find((s) => s.key === "test_delete_vitest");
    expect(found).toBeUndefined();
  });

  it("non-admin user cannot access settings", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.settings.list()).rejects.toThrow();
  });

  it("unauthenticated user cannot access settings", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.settings.list()).rejects.toThrow();
  });
});

// ============================================================
// NEWSLETTER ROUTES
// ============================================================

describe("newsletter routes", () => {
  const testEmail = `vitest-${Date.now()}@test.com`;

  it("public user can subscribe to newsletter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.newsletter.subscribe({ email: testEmail });
    expect(result).toEqual({ success: true });
  });

  it("admin can list subscribers", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.newsletter.list();
    expect(Array.isArray(result)).toBe(true);
    // Should contain our test subscriber
    const found = result.find((s) => s.email === testEmail);
    expect(found).toBeDefined();
    expect(found?.active).toBe(true);
  });

  it("admin can toggle subscriber active status", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const subscribers = await adminCaller.newsletter.list();
    const testSub = subscribers.find((s) => s.email === testEmail);
    expect(testSub).toBeDefined();

    // Deactivate
    const result = await adminCaller.newsletter.toggleActive({
      id: testSub!.id,
      active: false,
    });
    expect(result).toEqual({ success: true });

    // Verify
    const updated = await adminCaller.newsletter.list();
    const updatedSub = updated.find((s) => s.email === testEmail);
    expect(updatedSub?.active).toBe(false);
  });

  it("admin can remove a subscriber", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const subscribers = await adminCaller.newsletter.list();
    const testSub = subscribers.find((s) => s.email === testEmail);
    expect(testSub).toBeDefined();

    const result = await adminCaller.newsletter.remove({ id: testSub!.id });
    expect(result).toEqual({ success: true });

    // Verify
    const updated = await adminCaller.newsletter.list();
    const found = updated.find((s) => s.email === testEmail);
    expect(found).toBeUndefined();
  });

  it("non-admin user cannot list subscribers", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.newsletter.list()).rejects.toThrow();
  });
});

// ============================================================
// PUBLIC SETTINGS ROUTE
// ============================================================

describe("publicSettings routes", () => {
  it("anyone can get public settings as key-value map", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.publicSettings.get();
    expect(typeof result).toBe("object");
    // Should have seeded settings
    expect(result.phone_primary).toBeDefined();
    expect(result.whatsapp_url).toBeDefined();
  });
});
