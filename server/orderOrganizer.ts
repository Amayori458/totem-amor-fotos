import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

/**
 * Organizador de pedidos para ASK-400
 * Estrutura: Pedidos/YYYY-MM-DD/Pedido_XXXX/tamanho/
 */

export interface OrderMetadata {
  orderNumber: string;
  sessionId: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'printed' | 'failed';
  photos: Array<{
    id: number;
    fileName: string;
    fileKey: string;
    format: '10x15' | '15x21';
    printed: boolean;
    printedAt?: string;
    error?: string;
  }>;
  totalPhotos: number;
  printedPhotos: number;
  failedPhotos: number;
  notes?: string;
}

const ORDERS_BASE_DIR = process.env.ORDERS_DIR || './pedidos';

/**
 * Cria estrutura de diretórios para um pedido
 */
export async function createOrderStructure(
  orderNumber: string,
  sessionId: string
): Promise<{ orderPath: string; metadata: OrderMetadata }> {
  try {
    // Gera data no formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const orderPath = path.join(ORDERS_BASE_DIR, today, `Pedido_${orderNumber}`);

    // Cria diretórios
    await fsPromises.mkdir(path.join(orderPath, '10x15'), { recursive: true });
    await fsPromises.mkdir(path.join(orderPath, '15x21'), { recursive: true });
    await fsPromises.mkdir(path.join(orderPath, 'originais'), { recursive: true });

    // Cria arquivo de metadados
    const metadata: OrderMetadata = {
      orderNumber,
      sessionId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      photos: [],
      totalPhotos: 0,
      printedPhotos: 0,
      failedPhotos: 0,
    };

    await fsPromises.writeFile(
      path.join(orderPath, 'pedido.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`[Order Organizer] Estrutura criada: ${orderPath}`);

    return { orderPath, metadata };
  } catch (error) {
    console.error(`[Order Organizer] Erro ao criar estrutura:`, error);
    throw new Error(`Falha ao criar estrutura de pedido: ${error}`);
  }
}

/**
 * Salva imagem processada na pasta correta
 */
export async function saveProcessedImage(
  orderPath: string,
  format: '10x15' | '15x21',
  imageBuffer: Buffer,
  fileName: string
): Promise<{ filePath: string; fileName: string }> {
  try {
    const formatDir = path.join(orderPath, format);
    const filePath = path.join(formatDir, fileName);

    await fsPromises.writeFile(filePath, imageBuffer);

    console.log(`[Order Organizer] Imagem salva: ${filePath}`);

    return { filePath, fileName };
  } catch (error) {
    console.error(`[Order Organizer] Erro ao salvar imagem:`, error);
    throw new Error(`Falha ao salvar imagem: ${error}`);
  }
}

/**
 * Atualiza metadados do pedido
 */
export async function updateOrderMetadata(
  orderPath: string,
  updates: Partial<OrderMetadata>
): Promise<OrderMetadata> {
  try {
    const metadataPath = path.join(orderPath, 'pedido.json');
    const currentMetadata = JSON.parse(
      await fsPromises.readFile(metadataPath, 'utf-8')
    ) as OrderMetadata;

    const updatedMetadata = { ...currentMetadata, ...updates };

    // Recalcula contadores
    updatedMetadata.totalPhotos = updatedMetadata.photos.length;
    updatedMetadata.printedPhotos = updatedMetadata.photos.filter(
      (p) => p.printed
    ).length;
    updatedMetadata.failedPhotos = updatedMetadata.photos.filter(
      (p) => p.error
    ).length;

    await fsPromises.writeFile(
      metadataPath,
      JSON.stringify(updatedMetadata, null, 2)
    );

    console.log(`[Order Organizer] Metadados atualizados: ${orderPath}`);

    return updatedMetadata;
  } catch (error) {
    console.error(`[Order Organizer] Erro ao atualizar metadados:`, error);
    throw new Error(`Falha ao atualizar metadados: ${error}`);
  }
}

/**
 * Adiciona foto aos metadados
 */
export async function addPhotoToOrder(
  orderPath: string,
  photo: OrderMetadata['photos'][0]
): Promise<OrderMetadata> {
  try {
    const metadataPath = path.join(orderPath, 'pedido.json');
    const metadata = JSON.parse(
      await fsPromises.readFile(metadataPath, 'utf-8')
    ) as OrderMetadata;

    metadata.photos.push(photo);

    return updateOrderMetadata(orderPath, { photos: metadata.photos });
  } catch (error) {
    console.error(`[Order Organizer] Erro ao adicionar foto:`, error);
    throw error;
  }
}

/**
 * Marca foto como impressa
 */
export async function markPhotoPrinted(
  orderPath: string,
  photoId: number,
  success: boolean,
  error?: string
): Promise<OrderMetadata> {
  try {
    const metadataPath = path.join(orderPath, 'pedido.json');
    const metadata = JSON.parse(
      await fsPromises.readFile(metadataPath, 'utf-8')
    ) as OrderMetadata;

    const photo = metadata.photos.find((p) => p.id === photoId);
    if (photo) {
      photo.printed = success;
      if (success) {
        photo.printedAt = new Date().toISOString();
      } else if (error) {
        photo.error = error;
      }
    }

    return updateOrderMetadata(orderPath, { photos: metadata.photos });
  } catch (error) {
    console.error(`[Order Organizer] Erro ao marcar foto como impressa:`, error);
    throw error;
  }
}

/**
 * Obtém metadados de um pedido
 */
export async function getOrderMetadata(orderPath: string): Promise<OrderMetadata> {
  try {
    const metadataPath = path.join(orderPath, 'pedido.json');
    const metadata = JSON.parse(
      await fsPromises.readFile(metadataPath, 'utf-8')
    ) as OrderMetadata;

    return metadata;
  } catch (error) {
    console.error(`[Order Organizer] Erro ao obter metadados:`, error);
    throw new Error(`Falha ao obter metadados do pedido: ${error}`);
  }
}

/**
 * Lista todos os pedidos
 */
export async function listAllOrders(): Promise<
  Array<{ date: string; orderNumber: string; path: string; metadata: OrderMetadata }>
> {
  try {
    const orders: Array<{
      date: string;
      orderNumber: string;
      path: string;
      metadata: OrderMetadata;
    }> = [];

    if (!fs.existsSync(ORDERS_BASE_DIR)) {
      return orders;
    }

    const dates = await fsPromises.readdir(ORDERS_BASE_DIR);

    for (const date of dates) {
      const datePath = path.join(ORDERS_BASE_DIR, date);
      const stat = await fsPromises.stat(datePath);

      if (!stat.isDirectory()) continue;

      const orderDirs = await fsPromises.readdir(datePath);

      for (const orderDir of orderDirs) {
        const orderPath = path.join(datePath, orderDir);
        const metadataPath = path.join(orderPath, 'pedido.json');

        if (fs.existsSync(metadataPath)) {
          const metadata = await getOrderMetadata(orderPath);
          orders.push({
            date,
            orderNumber: orderDir,
            path: orderPath,
            metadata,
          });
        }
      }
    }

    return orders;
  } catch (error) {
    console.error(`[Order Organizer] Erro ao listar pedidos:`, error);
    return [];
  }
}

/**
 * Limpa pedidos antigos (padrão: 7 dias)
 */
export async function cleanupOldOrders(daysToKeep: number = 7): Promise<number> {
  try {
    const orders = await listAllOrders();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const order of orders) {
      const orderDate = new Date(order.metadata.createdAt);

      if (orderDate < cutoffDate) {
        await fsPromises.rm(path.dirname(order.path), { recursive: true });
        deletedCount++;
        console.log(`[Order Organizer] Pedido deletado: ${order.orderNumber}`);
      }
    }

    console.log(`[Order Organizer] ${deletedCount} pedidos antigos removidos`);
    return deletedCount;
  } catch (error) {
    console.error(`[Order Organizer] Erro ao limpar pedidos antigos:`, error);
    return 0;
  }
}

/**
 * Gera relatório de pedido para balcão
 */
export async function generateOrderReport(orderPath: string): Promise<string> {
  try {
    const metadata = await getOrderMetadata(orderPath);

    let report = `
╔════════════════════════════════════════════════════════════════╗
║                    RELATÓRIO DE PEDIDO                         ║
╚════════════════════════════════════════════════════════════════╝

Pedido: ${metadata.orderNumber}
Data: ${new Date(metadata.createdAt).toLocaleString('pt-BR')}
Status: ${metadata.status.toUpperCase()}

RESUMO:
  Total de fotos: ${metadata.totalPhotos}
  Impressas: ${metadata.printedPhotos}
  Falhadas: ${metadata.failedPhotos}
  Pendentes: ${metadata.totalPhotos - metadata.printedPhotos - metadata.failedPhotos}

FOTOS:
`;

    for (const photo of metadata.photos) {
      const status = photo.printed ? '✓' : photo.error ? '✗' : '○';
      report += `  ${status} ${photo.fileName} (${photo.format})`;
      if (photo.error) {
        report += ` - Erro: ${photo.error}`;
      }
      report += '\n';
    }

    if (metadata.notes) {
      report += `\nNOTAS: ${metadata.notes}\n`;
    }

    report += '\n╚════════════════════════════════════════════════════════════════╝\n';

    return report;
  } catch (error) {
    console.error(`[Order Organizer] Erro ao gerar relatório:`, error);
    throw error;
  }
}
