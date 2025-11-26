import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
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

describe("totem.createSession", () => {
  it("creates a new session with a unique sessionId", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.totem.createSession();

    expect(result).toHaveProperty("sessionId");
    expect(result).toHaveProperty("expiresAt");
    expect(result.sessionId).toMatch(/^[A-Za-z0-9_-]{12}$/);
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it("sets expiration time to 10 minutes in the future", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const before = Date.now();
    const result = await caller.totem.createSession();
    const after = Date.now();

    const expiresAtMs = result.expiresAt.getTime();
    const expectedMin = before + 9 * 60 * 1000; // 9 minutes
    const expectedMax = after + 11 * 60 * 1000; // 11 minutes

    expect(expiresAtMs).toBeGreaterThanOrEqual(expectedMin);
    expect(expiresAtMs).toBeLessThanOrEqual(expectedMax);
  });
});

describe("totem.getSession", () => {
  it("returns null for non-existent session", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.totem.getSession({ sessionId: "nonexistent" });

    expect(result).toBeUndefined();
  });

  it("returns session data for existing session", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.totem.createSession();
    const fetched = await caller.totem.getSession({ sessionId: created.sessionId });

    expect(fetched).toBeDefined();
    expect(fetched?.sessionId).toBe(created.sessionId);
    expect(fetched?.status).toBe("active");
  });
});

describe("totem.getPhotos", () => {
  it("returns empty array for session with no photos", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const session = await caller.totem.createSession();
    const photos = await caller.totem.getPhotos({ sessionId: session.sessionId });

    expect(photos).toEqual([]);
  });
});

describe("totem.updatePhotoSelection", () => {
  it("updates photo selection status", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // This test assumes we have a photo in the database
    // In a real scenario, you would create a photo first
    const result = await caller.totem.updatePhotoSelection({
      photoId: 1,
      selected: 1,
      format: "10x15",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("totem.createOrder", () => {
  it("creates an order with valid data", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const session = await caller.totem.createSession();

    const result = await caller.totem.createOrder({
      sessionId: session.sessionId,
      selectedPhotos: [
        {
          photoId: 1,
          fileKey: "test/photo1.jpg",
          fileName: "photo1.jpg",
          format: "10x15",
        },
      ],
    });

    expect(result).toHaveProperty("orderNumber");
    expect(result).toHaveProperty("photoCount");
    expect(result.orderNumber).toMatch(/^ORD-\d+-[A-Za-z0-9_-]{6}$/);
    expect(result.photoCount).toBe(1);
  });
});
