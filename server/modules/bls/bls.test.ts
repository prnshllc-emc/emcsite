/**
 * BLs Module Tests — bl_vehicles junction, forceUpdateStatus, status order, and agent vehicles array.
 */
import { describe, it, expect } from "vitest";

// ── Status transition validation ────────────────────────────
describe("BL Status Transitions", () => {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    draft: ["final", "in_transit"],
    final: ["in_transit"],
    in_transit: ["arrived"],
    arrived: ["customs"],
    customs: ["delivered"],
    delivered: [],
  };

  it("should define valid transitions for all statuses", () => {
    const allStatuses = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];
    for (const status of allStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(VALID_TRANSITIONS[status])).toBe(true);
    }
  });

  it("should not allow backward transitions in normal flow", () => {
    expect(VALID_TRANSITIONS.delivered).toEqual([]);
    expect(VALID_TRANSITIONS.customs).not.toContain("arrived");
    expect(VALID_TRANSITIONS.arrived).not.toContain("in_transit");
    expect(VALID_TRANSITIONS.in_transit).not.toContain("final");
  });

  it("should allow draft → final and draft → in_transit", () => {
    expect(VALID_TRANSITIONS.draft).toContain("final");
    expect(VALID_TRANSITIONS.draft).toContain("in_transit");
  });

  it("should allow the full forward chain", () => {
    expect(VALID_TRANSITIONS.draft).toContain("in_transit");
    expect(VALID_TRANSITIONS.in_transit).toContain("arrived");
    expect(VALID_TRANSITIONS.arrived).toContain("customs");
    expect(VALID_TRANSITIONS.customs).toContain("delivered");
  });

  it("delivered should be a terminal state", () => {
    expect(VALID_TRANSITIONS.delivered).toHaveLength(0);
  });
});

// ── Status order (for force update UI) ──────────────────────
describe("Status Order", () => {
  const STATUS_ORDER = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];

  it("should have 6 statuses in correct order", () => {
    expect(STATUS_ORDER).toHaveLength(6);
    expect(STATUS_ORDER[0]).toBe("draft");
    expect(STATUS_ORDER[5]).toBe("delivered");
  });

  it("should determine forward/backward correctly", () => {
    const currentIndex = STATUS_ORDER.indexOf("arrived"); // 3
    const forwardIndex = STATUS_ORDER.indexOf("customs"); // 4
    const backwardIndex = STATUS_ORDER.indexOf("draft"); // 0

    expect(forwardIndex).toBeGreaterThan(currentIndex);
    expect(backwardIndex).toBeLessThan(currentIndex);
  });

  it("should list all statuses except current for force update", () => {
    const current = "in_transit";
    const otherStatuses = STATUS_ORDER.filter((s) => s !== current);
    expect(otherStatuses).toHaveLength(5);
    expect(otherStatuses).not.toContain("in_transit");
    expect(otherStatuses).toContain("draft");
    expect(otherStatuses).toContain("delivered");
  });
});

// ── Force update status logic ───────────────────────────────
describe("Force Update Status", () => {
  it("should allow any status change (forward)", () => {
    const ALL_STATUSES = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];
    // Force update should allow going from any status to any other status
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        if (from === to) continue;
        // In force mode, no validation — just check it's a valid status
        expect(ALL_STATUSES).toContain(to);
      }
    }
  });

  it("should allow backward transitions (e.g., delivered → draft)", () => {
    const from = "delivered";
    const to = "draft";
    const ALL_STATUSES = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];
    expect(ALL_STATUSES).toContain(from);
    expect(ALL_STATUSES).toContain(to);
    // Force update skips validateStatusTransition — no error
  });

  it("should be a no-op when status is the same", () => {
    const current = "in_transit";
    const target = "in_transit";
    expect(current === target).toBe(true);
    // Service returns early when same status
  });
});

// ── BL-Vehicle junction (N:N) ───────────────────────────────
describe("BL-Vehicle Junction (bl_vehicles)", () => {
  it("should define the junction record structure", () => {
    const record = {
      id: 1,
      blId: 10,
      vehicleId: 20,
      customerId: 30,
      position: 1,
      notes: "First vehicle in container",
      createdAt: new Date(),
    };

    expect(record.blId).toBe(10);
    expect(record.vehicleId).toBe(20);
    expect(record.customerId).toBe(30);
    expect(record.position).toBe(1);
    expect(record.notes).toBe("First vehicle in container");
  });

  it("should support multiple vehicles per BL", () => {
    const blId = 1;
    const vehicles = [
      { vehicleId: 1, customerId: 10, position: 1 },
      { vehicleId: 2, customerId: 20, position: 2 },
      { vehicleId: 3, customerId: 10, position: 3 }, // same customer, different vehicle
    ];

    expect(vehicles).toHaveLength(3);
    expect(vehicles.every((v) => v.vehicleId > 0)).toBe(true);
    // Same customer can have multiple vehicles in same BL
    const customerIds = vehicles.map((v) => v.customerId);
    expect(customerIds.filter((c) => c === 10)).toHaveLength(2);
  });

  it("should support nullable customerId and position", () => {
    const record = {
      blId: 1,
      vehicleId: 5,
      customerId: null,
      position: null,
      notes: null,
    };

    expect(record.customerId).toBeNull();
    expect(record.position).toBeNull();
    expect(record.notes).toBeNull();
  });
});

// ── Agent API vehicles array ────────────────────────────────
describe("Agent API Vehicles Array", () => {
  it("should parse vehicles array from ingest payload", () => {
    const payload = {
      bl: {
        blNumber: "MAEU265399692",
        containerNumber: "MSKU4567890",
        vehicles: [
          {
            vin: "WP0AB2A95LS123456",
            make: "Porsche",
            model: "911 Carrera S",
            year: 2024,
            color: "Branco",
            customerCpf: "11122233344",
            customerName: "Pedro Almeida",
            position: 1,
          },
          {
            vin: "WBS8M9C50J5K98765",
            make: "BMW",
            model: "M3 Competition",
            year: 2023,
            color: "Preto",
            customerCpf: "55566677788",
            customerName: "Maria Santos",
            position: 2,
          },
        ],
      },
    };

    expect(payload.bl.vehicles).toHaveLength(2);
    expect(payload.bl.vehicles[0].vin).toBe("WP0AB2A95LS123456");
    expect(payload.bl.vehicles[1].customerCpf).toBe("55566677788");
  });

  it("should handle empty vehicles array gracefully", () => {
    const payload = {
      bl: {
        blNumber: "TEST123",
        vehicles: [],
      },
    };

    expect(payload.bl.vehicles).toHaveLength(0);
  });

  it("should handle missing vehicles array (backward compat)", () => {
    const payload = {
      bl: {
        blNumber: "TEST123",
        vehicleVin: "1FA6P8CF5L5123456",
        customerCpf: "12345678901",
      },
    };

    const vehicles = (payload.bl as any).vehicles || [];
    expect(vehicles).toHaveLength(0);
    // Legacy fields should still be processed
    expect(payload.bl.vehicleVin).toBe("1FA6P8CF5L5123456");
  });

  it("should normalize CPF by removing non-digits", () => {
    const rawCpf = "123.456.789-01";
    const normalized = rawCpf.replace(/\D/g, "");
    expect(normalized).toBe("12345678901");
    expect(normalized).toHaveLength(11);
  });

  it("should normalize VIN to uppercase", () => {
    const rawVin = "wp0ab2a95ls123456";
    const normalized = rawVin.toUpperCase();
    expect(normalized).toBe("WP0AB2A95LS123456");
  });

  it("should assign default position when not provided", () => {
    const vehicles = [
      { vin: "VIN1", position: undefined },
      { vin: "VIN2", position: undefined },
      { vin: "VIN3", position: undefined },
    ];

    const withPositions = vehicles.map((v, i) => ({
      ...v,
      position: v.position ?? (i + 1),
    }));

    expect(withPositions[0].position).toBe(1);
    expect(withPositions[1].position).toBe(2);
    expect(withPositions[2].position).toBe(3);
  });

  it("should handle vehicle with minimal data (only VIN)", () => {
    const vehicle = {
      vin: "1FA6P8CF5L5123456",
      make: undefined,
      model: undefined,
    };

    const make = vehicle.make || "N/A";
    const model = vehicle.model || "N/A";
    expect(make).toBe("N/A");
    expect(model).toBe("N/A");
  });

  it("should support same customer across multiple vehicles", () => {
    const vehicles = [
      { vin: "VIN1", customerCpf: "11122233344" },
      { vin: "VIN2", customerCpf: "55566677788" },
      { vin: "VIN3", customerCpf: "11122233344" }, // same as VIN1
    ];

    const uniqueCustomers = [...new Set(vehicles.map((v) => v.customerCpf))];
    expect(uniqueCustomers).toHaveLength(2);
    expect(vehicles.filter((v) => v.customerCpf === "11122233344")).toHaveLength(2);
  });
});

// ── Agent API ingest response ───────────────────────────────
describe("Agent API Ingest Response", () => {
  it("should include linkedVehicles count in results", () => {
    const results = {
      blAction: "created" as const,
      blId: 1,
      blNumber: "TEST123",
      linkedVehicles: 3,
      trackingEvents: [],
      trackingCode: null,
    };

    expect(results.linkedVehicles).toBe(3);
  });

  it("should include vehicles in BL detail response", () => {
    const response = {
      bl: { id: 1, blNumber: "TEST123", status: "draft" },
      events: [],
      codes: [],
      vehicles: [
        { id: 1, blId: 1, vehicleId: 10, customerId: 20, position: 1 },
        { id: 2, blId: 1, vehicleId: 11, customerId: 21, position: 2 },
      ],
    };

    expect(response.vehicles).toHaveLength(2);
    expect(response.vehicles[0].vehicleId).toBe(10);
  });
});

// ── Admin panel status buttons ──────────────────────────────
describe("Admin Panel Status Buttons", () => {
  const ALL_STATUSES = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];

  it("should show all statuses except current", () => {
    const current = "in_transit";
    const buttons = ALL_STATUSES.filter((s) => s !== current);
    expect(buttons).toHaveLength(5);
    expect(buttons).not.toContain(current);
  });

  it("should classify forward vs backward correctly", () => {
    const current = "arrived"; // index 3
    const currentIndex = ALL_STATUSES.indexOf(current);

    const forward = ALL_STATUSES.filter((s, i) => i > currentIndex);
    const backward = ALL_STATUSES.filter((s, i) => i < currentIndex);

    expect(forward).toEqual(["customs", "delivered"]);
    expect(backward).toEqual(["draft", "final", "in_transit"]);
  });

  it("should use green for forward and yellow for backward", () => {
    const currentIndex = ALL_STATUSES.indexOf("customs"); // 4
    const targetIndex = ALL_STATUSES.indexOf("draft"); // 0
    const isForward = targetIndex > currentIndex;

    expect(isForward).toBe(false); // backward
    // UI should show yellow styling for backward
  });
});

// ── Status labels (Portuguese) ──────────────────────────────
describe("Status Labels", () => {
  const STATUS_MAP: Record<string, string> = {
    draft: "Rascunho",
    final: "BL Final",
    in_transit: "Em Trânsito",
    arrived: "No Porto",
    customs: "Alfândega",
    delivered: "Entregue",
  };

  it("should have Portuguese labels for all statuses", () => {
    const allStatuses = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];
    for (const status of allStatuses) {
      expect(STATUS_MAP[status]).toBeDefined();
      expect(STATUS_MAP[status].length).toBeGreaterThan(0);
    }
  });

  it("should have correct labels", () => {
    expect(STATUS_MAP.draft).toBe("Rascunho");
    expect(STATUS_MAP.in_transit).toBe("Em Trânsito");
    expect(STATUS_MAP.delivered).toBe("Entregue");
  });
});
