import { Request, Response, NextFunction } from "express";
import { storagePut } from "./storage";
import { createPhoto, getSessionBySessionId } from "./db";
import { nanoid } from "nanoid";
import { convertToJpeg, isValidImage } from "./imageConverter";

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
      try {
        // Valida se é uma imagem (por conteúdo, não extensão)
        const isImage = await isValidImage(file.buffer);
        if (!isImage) {
          console.warn(`Arquivo não é uma imagem válida: ${file.originalname}`);
          continue;
        }

        // Converte para JPEG
        const { buffer: jpegBuffer, fileName: jpegFileName } = await convertToJpeg(
          file.buffer,
          file.originalname
        );

        // Gera chave única para S3
        const fileKey = `totem-uploads/${sessionId}/${nanoid(16)}.jpg`;

        // Upload para S3
        const { url } = await storagePut(fileKey, jpegBuffer, "image/jpeg");

        // Salva no banco de dados
        const photo = await createPhoto({
          sessionId,
          fileKey,
          fileUrl: url,
          fileName: jpegFileName,
          mimeType: "image/jpeg",
          fileSize: jpegBuffer.length,
          selected: 0,
        });

        uploadedPhotos.push({
          id: photo.id,
          fileName: photo.fileName,
          fileUrl: photo.fileUrl,
        });

        console.log(`[Upload] Foto processada com sucesso: ${jpegFileName}`);
      } catch (fileError) {
        console.error(`[Upload] Erro ao processar arquivo ${file.originalname}:`, fileError);
        continue;
      }
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
