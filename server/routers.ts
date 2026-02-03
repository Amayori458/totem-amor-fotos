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
import { getPrinters, testPrinter, printImageBuffer } from "./printerManager";
import { resizeForPrint } from "./imageConverter";
import { storageGet } from "./storage";
import { generateReceiptForPrinting } from "./receiptGenerator";


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

  printer: router({
    // Obtém lista de impressoras disponíveis
    getPrinters: publicProcedure.query(async () => {
      try {
        const printers = await getPrinters();
        return {
          success: true,
          printers,
        };
      } catch (error) {
        console.error("[Printer Router] Erro ao obter impressoras:", error);
        return {
          success: false,
          printers: [],
          error: "Falha ao obter lista de impressoras",
        };
      }
    }),

    // Testa conexão com impressora
    testPrinter: publicProcedure
      .input(z.object({ printerName: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const isAvailable = await testPrinter(input.printerName);
          return {
            success: isAvailable,
            message: isAvailable ? "Impressora disponível" : "Impressora não encontrada",
          };
        } catch (error) {
          console.error("[Printer Router] Erro ao testar impressora:", error);
          return {
            success: false,
            message: "Erro ao testar impressora",
          };
        }
      }),

    // Imprime imagem
    printImage: publicProcedure
      .input(
        z.object({
          fileKey: z.string(),
          printerName: z.string(),
          format: z.enum(["10x15", "15x21"]),
          copies: z.number().default(1),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Obtém imagem do S3
          const { url } = await storageGet(input.fileKey);
          const response = await fetch(url);
          const imageBuffer = Buffer.from(await response.arrayBuffer());

          // Redimensiona para o formato especificado
          const resizedBuffer = await resizeForPrint(imageBuffer, input.format);

          // Imprime
          const result = await printImageBuffer(
            resizedBuffer,
            input.printerName,
            input.copies
          );

          return {
            success: result.success,
            message: result.message,
          };
        } catch (error) {
          console.error("[Printer Router] Erro ao imprimir:", error);
          return {
            success: false,
            message: `Erro ao imprimir: ${error}`,
          };
        }
      }),

    // Imprime comprovante em PDF
    printReceipt: publicProcedure
      .input(
        z.object({
          orderNumber: z.string(),
          printerName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Gera PDF do comprovante
          const receiptBuffer = await generateReceiptForPrinting(input.orderNumber);

          // Imprime o comprovante
          const result = await printImageBuffer(
            receiptBuffer,
            input.printerName,
            1
          );

          return {
            success: result.success,
            message: result.message,
          };
        } catch (error) {
          console.error("[Printer Router] Erro ao imprimir comprovante:", error);
          return {
            success: false,
            message: `Erro ao imprimir comprovante: ${error}`,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
