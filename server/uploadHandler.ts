import { Request, Response, NextFunction } from "express";
import { storagePut } from "./storage";
import { createPhoto, getSessionBySessionId } from "./db";
import { nanoid } from "nanoid";

// Supported image MIME types
const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
];

export async function handlePhotoUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Verify session exists and is active
    const session = await getSessionBySessionId(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ error: "Session is not active" });
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ error: "Session has expired" });
    }

    // Get uploaded files from request
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      // Validate MIME type
      if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
        console.warn(`Skipping unsupported file type: ${file.mimetype}`);
        continue;
      }

      // Generate unique file key
      const fileExtension = file.originalname.split(".").pop() || "jpg";
      const fileKey = `totem-uploads/${sessionId}/${nanoid(16)}.${fileExtension}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, file.buffer, file.mimetype);

      // Save to database
      const photo = await createPhoto({
        sessionId,
        fileKey,
        fileUrl: url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        selected: 0,
      });

      uploadedPhotos.push({
        id: photo.id,
        fileName: photo.fileName,
        fileUrl: photo.fileUrl,
      });
    }

    return res.status(200).json({
      success: true,
      uploadedCount: uploadedPhotos.length,
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error("Error uploading photos:", error);
    return res.status(500).json({ error: "Failed to upload photos" });
  }
}
