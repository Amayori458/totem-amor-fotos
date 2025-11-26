import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sessions, InsertSession, Session, photos, InsertPhoto, Photo, orders, InsertOrder, Order } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Session management functions
export async function createSession(sessionData: InsertSession): Promise<Session> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(sessions).values(sessionData);
  const insertedId = Number(result[0].insertId);
  
  const newSession = await db.select().from(sessions).where(eq(sessions.id, insertedId)).limit(1);
  if (!newSession[0]) {
    throw new Error("Failed to retrieve created session");
  }
  
  return newSession[0];
}

export async function getSessionBySessionId(sessionId: string): Promise<Session | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSessionStatus(sessionId: string, status: "active" | "completed" | "expired"): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(sessions).set({ status }).where(eq(sessions.sessionId, sessionId));
}

// Photo management functions
export async function createPhoto(photoData: InsertPhoto): Promise<Photo> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(photos).values(photoData);
  const insertedId = Number(result[0].insertId);
  
  const newPhoto = await db.select().from(photos).where(eq(photos.id, insertedId)).limit(1);
  if (!newPhoto[0]) {
    throw new Error("Failed to retrieve created photo");
  }
  
  return newPhoto[0];
}

export async function getPhotosBySessionId(sessionId: string): Promise<Photo[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(photos).where(eq(photos.sessionId, sessionId));
}

export async function updatePhotoSelection(photoId: number, selected: number, format?: "10x15" | "15x21"): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Partial<Photo> = { selected };
  if (format) {
    updateData.format = format;
  }

  await db.update(photos).set(updateData).where(eq(photos.id, photoId));
}

// Order management functions
export async function createOrder(orderData: InsertOrder): Promise<Order> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(orders).values(orderData);
  const insertedId = Number(result[0].insertId);
  
  const newOrder = await db.select().from(orders).where(eq(orders.id, insertedId)).limit(1);
  if (!newOrder[0]) {
    throw new Error("Failed to retrieve created order");
  }
  
  return newOrder[0];
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderStatus(
  orderNumber: string,
  status: "pending" | "processing" | "completed" | "failed",
  completedAt?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Partial<Order> = { status };
  if (completedAt) {
    updateData.completedAt = completedAt;
  }

  await db.update(orders).set(updateData).where(eq(orders.orderNumber, orderNumber));
}
