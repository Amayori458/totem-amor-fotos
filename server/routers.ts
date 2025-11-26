import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createSession,
  getSessionBySessionId,
  updateSessionStatus,
  getPhotosBySessionId,
  updatePhotoSelection,
  createOrder,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  totem: router({
    createSession: publicProcedure.mutation(async () => {
      const sessionId = nanoid(12);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const session = await createSession({
        sessionId,
        status: "active",
        expiresAt,
      });

      return {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
      };
    }),

    getSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const session = await getSessionBySessionId(input.sessionId);
        return session;
      }),

    getPhotos: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const photos = await getPhotosBySessionId(input.sessionId);
        return photos;
      }),

    updatePhotoSelection: publicProcedure
      .input(
        z.object({
          photoId: z.number(),
          selected: z.number(),
          format: z.enum(["10x15", "15x21"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updatePhotoSelection(input.photoId, input.selected, input.format);
        return { success: true };
      }),

    createOrder: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          selectedPhotos: z.array(
            z.object({
              photoId: z.number(),
              fileKey: z.string(),
              fileName: z.string(),
              format: z.enum(["10x15", "15x21"]),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const orderNumber = `ORD-${Date.now()}-${nanoid(6)}`;
        const photoCount = input.selectedPhotos.length;

        const order = await createOrder({
          sessionId: input.sessionId,
          orderNumber,
          photoCount,
          metadata: {
            photos: input.selectedPhotos.map((p) => ({
              fileKey: p.fileKey,
              fileName: p.fileName,
              format: p.format,
            })),
            timestamp: Date.now(),
          },
          status: "pending",
        });

        // Mark session as completed
        await updateSessionStatus(input.sessionId, "completed");

        return {
          orderNumber: order.orderNumber,
          photoCount: order.photoCount,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
