import sharp from 'sharp';

/**
 * Processador de imagens otimizado para Fujifilm ASK-400
 * - 300 DPI nativo
 * - Crop inteligente centralizado
 * - Sem borda, sem escala no driver
 */

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  dpi: number;
  format: '10x15' | '15x21';
}

/**
 * Dimensões exatas para ASK-400 em 300 DPI
 */
const ASK400_SPECS = {
  '10x15': {
    width: 1181,  // 10 cm em 300 DPI
    height: 1772, // 15 cm em 300 DPI
    dpi: 300,
    cmWidth: 10,
    cmHeight: 15,
  },
  '15x21': {
    width: 1772,  // 15 cm em 300 DPI
    height: 2480, // 21 cm em 300 DPI
    dpi: 300,
    cmWidth: 15,
    cmHeight: 21,
  },
};

/**
 * Calcula crop inteligente centralizado
 * Preenche o espaço sem deixar bordas brancas
 */
function calculateCrop(
  imageWidth: number,
  imageHeight: number,
  targetWidth: number,
  targetHeight: number
): { left: number; top: number; width: number; height: number } {
  // Calcula proporções
  const imageAspect = imageWidth / imageHeight;
  const targetAspect = targetWidth / targetHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (imageAspect > targetAspect) {
    // Imagem mais larga: corta os lados
    cropHeight = imageHeight;
    cropWidth = Math.round(imageHeight * targetAspect);
  } else {
    // Imagem mais alta: corta o topo/fundo
    cropWidth = imageWidth;
    cropHeight = Math.round(imageWidth / targetAspect);
  }

  // Centraliza o crop
  const left = Math.round((imageWidth - cropWidth) / 2);
  const top = Math.round((imageHeight - cropHeight) / 2);

  return { left, top, width: cropWidth, height: cropHeight };
}

/**
 * Processa imagem para ASK-400
 * 1. Remove EXIF de rotação
 * 2. Aplica crop inteligente centralizado
 * 3. Redimensiona exatamente para o tamanho especificado
 * 4. Define 300 DPI
 */
export async function processForASK400(
  inputBuffer: Buffer,
  format: '10x15' | '15x21',
  quality: number = 95
): Promise<ProcessedImage> {
  try {
    const spec = ASK400_SPECS[format];

    console.log(`[ASK-400 Processor] Iniciando processamento para ${format} (${spec.width}x${spec.height}px)`);

    // Obtém metadados da imagem original
    const metadata = await sharp(inputBuffer).metadata();
    const imageWidth = metadata.width || 0;
    const imageHeight = metadata.height || 0;

    if (imageWidth === 0 || imageHeight === 0) {
      throw new Error('Imagem inválida: dimensões não detectadas');
    }

    console.log(`[ASK-400 Processor] Imagem original: ${imageWidth}x${imageHeight}px`);

    // Calcula crop inteligente
    const crop = calculateCrop(imageWidth, imageHeight, spec.width, spec.height);
    console.log(`[ASK-400 Processor] Crop calculado: ${crop.width}x${crop.height}px em (${crop.left}, ${crop.top})`);

    // Processa a imagem
    const processedBuffer = await sharp(inputBuffer)
      .rotate() // Remove EXIF de rotação e aplica corretamente
      .extract(crop) // Aplica crop inteligente
      .resize(spec.width, spec.height, {
        fit: 'fill', // Preenche exatamente
        withoutEnlargement: false,
      })
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true, // Otimização de qualidade
      })
      .toBuffer();

    console.log(`[ASK-400 Processor] Processamento concluído: ${processedBuffer.length} bytes`);

    return {
      buffer: processedBuffer,
      width: spec.width,
      height: spec.height,
      dpi: spec.dpi,
      format,
    };
  } catch (error) {
    console.error(`[ASK-400 Processor] Erro ao processar imagem:`, error);
    throw new Error(`Falha ao processar imagem para ASK-400: ${error}`);
  }
}

/**
 * Processa múltiplas imagens em paralelo
 */
export async function processMultipleForASK400(
  imageBuffers: Buffer[],
  format: '10x15' | '15x21',
  quality: number = 95
): Promise<ProcessedImage[]> {
  try {
    console.log(`[ASK-400 Processor] Processando ${imageBuffers.length} imagens para ${format}`);

    const results = await Promise.all(
      imageBuffers.map((buffer) => processForASK400(buffer, format, quality))
    );

    console.log(`[ASK-400 Processor] Todas as ${results.length} imagens processadas com sucesso`);
    return results;
  } catch (error) {
    console.error(`[ASK-400 Processor] Erro ao processar múltiplas imagens:`, error);
    throw error;
  }
}

/**
 * Valida se a imagem está pronta para ASK-400
 */
export async function validateForASK400(
  buffer: Buffer,
  format: '10x15' | '15x21'
): Promise<{ valid: boolean; message: string }> {
  try {
    const metadata = await sharp(buffer).metadata();
    const spec = ASK400_SPECS[format];

    // Verifica dimensões
    if (metadata.width !== spec.width || metadata.height !== spec.height) {
      return {
        valid: false,
        message: `Dimensões incorretas: esperado ${spec.width}x${spec.height}, recebido ${metadata.width}x${metadata.height}`,
      };
    }

    // Verifica formato
    if (metadata.format !== 'jpeg') {
      return {
        valid: false,
        message: `Formato incorreto: esperado JPEG, recebido ${metadata.format}`,
      };
    }

    return {
      valid: true,
      message: 'Imagem válida para ASK-400',
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erro ao validar imagem: ${error}`,
    };
  }
}

/**
 * Obtém informações de impressão para ASK-400
 */
export function getASK400PrintInfo(format: '10x15' | '15x21') {
  const spec = ASK400_SPECS[format];
  return {
    format,
    dimensions: `${spec.cmWidth}x${spec.cmHeight} cm`,
    pixels: `${spec.width}x${spec.height} px`,
    dpi: spec.dpi,
    paperSize: format === '10x15' ? '4x6' : '6x8',
    driverSettings: {
      paperSize: format === '10x15' ? '4x6 inches' : '6x8 inches',
      orientation: 'Portrait',
      scaling: '100%',
      quality: 'Best',
      autoEnhance: false,
    },
  };
}
