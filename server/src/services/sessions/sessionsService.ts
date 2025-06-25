import { and, eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { activeSessions } from "../../db/postgres/schema.js";

class SessionsService {
  async getExistingSession(userId: string, siteId: string) {
    const siteIdNumber = parseInt(siteId, 10);

    const [existingSession] = await db
      .select()
      .from(activeSessions)
      .where(
        and(
          eq(activeSessions.userId, userId),
          eq(activeSessions.siteId, siteIdNumber)
        )
      )
      .limit(1);

    return existingSession || null;
  }

  async updateSession(payload: {
    userId: string;
    site_id: string;
    timestamp: string;
  }): Promise<{ sessionId: string }> {
    const existingSession = await this.getExistingSession(
      payload.userId,
      payload.site_id
    );

    if (existingSession) {
      await db
        .update(activeSessions)
        .set({
          lastActivity: new Date(payload.timestamp),
        })
        .where(eq(activeSessions.sessionId, existingSession.sessionId));
      return { sessionId: existingSession.sessionId };
    }

    // Insert new session with Drizzle - only include columns that exist in schema
    const insertData = {
      sessionId: crypto.randomUUID(),
      siteId:
        typeof payload.site_id === "string"
          ? parseInt(payload.site_id, 10)
          : payload.site_id,
      userId: payload.userId,
      startTime: new Date(payload.timestamp || Date.now()),
      lastActivity: new Date(payload.timestamp || Date.now()),
    };

    await db.insert(activeSessions).values(insertData);
    return { sessionId: insertData.sessionId };
  }
}

export const sessionsService = new SessionsService();
