import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Converte qualquer tipo de imagem para JPEG
 * Suporta: PNG, WebP, HEIC, GIF, BMP, TIFF, SVG, etc.
 */
export async function convertToJpeg(
  inputBuffer: Buffer,
  fileName: string,
  quality: number = 90
): Promise<{ buffer: Buffer; fileName: string }> {
  try {
    // Detecta o formato da imagem
    const metadata = await sharp(inputBuffer).metadata();
    
    console.log(`[Image Converter] Convertendo ${fileName} (formato: ${metadata.format})`);

    // Converte para JPEG
    const jpegBuffer = await sharp(inputBuffer)
      .rotate() // Remove rotação EXIF e aplica corretamente
      .jpeg({ quality, progressive: true })
      .toBuffer();

    // Gera novo nome de arquivo
    const baseName = path.parse(fileName).name;
    const newFileName = `${baseName}.jpg`;

    console.log(`[Image Converter] Conversão concluída: ${newFileName} (${jpegBuffer.length} bytes)`);

    return {
      buffer: jpegBuffer,
      fileName: newFileName,
    };
  } catch (error) {
    console.error(`[Image Converter] Erro ao converter ${fileName}:`, error);
    throw new Error(`Falha ao converter imagem: ${fileName}`);
  }
}

/**
 * Redimensiona imagem JPEG para o formato especificado
 * Formatos suportados: 10x15 cm (300 DPI = 1181x1772px) ou 15x21 cm (300 DPI = 1772x2480px)
 */
export async function resizeForPrint(
  inputBuffer: Buffer,
  format: '10x15' | '15x21',
  dpi: number = 300
): Promise<Buffer> {
  try {
    // Calcula dimensões em pixels (300 DPI padrão para impressão)
    const dimensions = format === '10x15'
      ? { width: 1181, height: 1772 } // 10x15 cm em 300 DPI
      : { width: 1772, height: 2480 }; // 15x21 cm em 300 DPI

    console.log(`[Image Resizer] Redimensionando para ${format} (${dimensions.width}x${dimensions.height}px)`);

    const resizedBuffer = await sharp(inputBuffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover', // Preenche o espaço, cortando se necessário
        position: 'center', // Centraliza a imagem
      })
      .jpeg({ quality: 95, progressive: true })
      .toBuffer();

    console.log(`[Image Resizer] Redimensionamento concluído (${resizedBuffer.length} bytes)`);

    return resizedBuffer;
  } catch (error) {
    console.error(`[Image Resizer] Erro ao redimensionar:`, error);
    throw new Error('Falha ao redimensionar imagem para impressão');
  }
}

/**
 * Valida se o arquivo é uma imagem (por conteúdo, não extensão)
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!metadata.format;
  } catch {
    return false;
  }
}

/**
 * Obtém informações da imagem
 */
export async function getImageInfo(buffer: Buffer): Promise<{
  format: string;
  width: number;
  height: number;
  size: number;
}> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      format: metadata.format || 'unknown',
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: buffer.length,
    };
  } catch (error) {
    throw new Error('Falha ao obter informações da imagem');
  }
}
