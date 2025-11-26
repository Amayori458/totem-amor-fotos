import { Express } from "express";
import multer from "multer";
import { handlePhotoUpload } from "./uploadHandler";

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 100, // Max 100 files per request
  },
});

export function registerExpressRoutes(app: Express) {
  // Photo upload endpoint
  app.post("/api/upload/:sessionId", upload.array("photos", 100), handlePhotoUpload);

  console.log("[Express Routes] Registered /api/upload/:sessionId");
}
