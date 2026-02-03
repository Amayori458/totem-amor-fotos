import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { getOrderByOrderNumber } from './db';

interface ReceiptData {
  orderNumber: string;
  photoCount: number;
  format10x15: number;
  format15x21: number;
  price10x15: number;
  price15x21: number;
  totalPrice: number;
  timestamp: string;
}

/**
 * Gera um comprovante em PDF com os detalhes do pedido
 * Otimizado para impressão em papel comum (A4)
 */
export async function generateReceiptPDF(orderNumber: string): Promise<Buffer> {
  // Busca dados do pedido
  const order = await getOrderByOrderNumber(orderNumber);
  
  if (!order) {
    throw new Error(`Pedido ${orderNumber} não encontrado`);
  }

  // Prepara dados do comprovante
  const receiptData: ReceiptData = {
    orderNumber: order.orderNumber,
    photoCount: order.photoCount,
    format10x15: order.metadata?.photos?.filter((p: any) => p.format === '10x15').length || 0,
    format15x21: order.metadata?.photos?.filter((p: any) => p.format === '15x21').length || 0,
    price10x15: 0.75, // Preço em reais
    price15x21: 2.20, // Preço em reais
    totalPrice: 0,
    timestamp: new Date().toLocaleString('pt-BR'),
  };

  // Calcula preço total
  receiptData.totalPrice = 
    (receiptData.format10x15 * receiptData.price10x15) +
    (receiptData.format15x21 * receiptData.price15x21);

  // Cria documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4: 210mm x 297mm em pontos

  // Define cores
  const primaryColor = rgb(0.16, 0.94, 0.93); // Turquesa #2beede
  const accentColor = rgb(1, 0.55, 0.41); // Coral #FF8C69
  const darkColor = rgb(0.06, 0.13, 0.13); // Escuro #102220
  const grayColor = rgb(0.5, 0.5, 0.5);
  const lightGrayColor = rgb(0.9, 0.9, 0.9);

  // Dimensões
  const margin = 40;
  const pageWidth = 595;
  const pageHeight = 842;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = pageHeight - margin;

  // Função auxiliar para desenhar texto
  const drawText = (
    text: string,
    x: number,
    y: number,
    size: number,
    color = darkColor,
    bold = false
  ) => {
    page.drawText(text, {
      x,
      y,
      size,
      color,
    });
  };

  // Função auxiliar para desenhar linha
  const drawLine = (y: number, color = lightGrayColor) => {
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      color,
      thickness: 1,
    });
  };

  // Cabeçalho - Logo
  drawText('Amor por Fotos ❤️', margin, yPosition, 24, primaryColor, true);
  yPosition -= 35;

  drawText('Suas memórias, reveladas com amor', margin, yPosition, 10, grayColor);
  yPosition -= 20;

  // Linha divisória
  drawLine(yPosition);
  yPosition -= 20;

  // Número do Pedido
  drawText('NÚMERO DO PEDIDO', margin, yPosition, 8, grayColor, true);
  yPosition -= 12;
  drawText(receiptData.orderNumber, margin, yPosition, 16, accentColor, true);
  yPosition -= 30;

  // Linha divisória
  drawLine(yPosition);
  yPosition -= 20;

  // Detalhes do Pedido
  drawText('DETALHES DO PEDIDO', margin, yPosition, 10, darkColor, true);
  yPosition -= 18;

  // Fotos 10x15
  if (receiptData.format10x15 > 0) {
    const subtotal10x15 = receiptData.format10x15 * receiptData.price10x15;
    drawText(
      `${receiptData.format10x15}x Foto 10×15 cm @ R$ ${receiptData.price10x15.toFixed(2)}`,
      margin,
      yPosition,
      10,
      darkColor
    );
    drawText(
      `R$ ${subtotal10x15.toFixed(2)}`,
      pageWidth - margin - 80,
      yPosition,
      10,
      darkColor,
      true
    );
    yPosition -= 15;
  }

  // Fotos 15x21
  if (receiptData.format15x21 > 0) {
    const subtotal15x21 = receiptData.format15x21 * receiptData.price15x21;
    drawText(
      `${receiptData.format15x21}x Foto 15×21 cm @ R$ ${receiptData.price15x21.toFixed(2)}`,
      margin,
      yPosition,
      10,
      darkColor
    );
    drawText(
      `R$ ${subtotal15x21.toFixed(2)}`,
      pageWidth - margin - 80,
      yPosition,
      10,
      darkColor,
      true
    );
    yPosition -= 15;
  }

  yPosition -= 10;

  // Linha divisória
  drawLine(yPosition);
  yPosition -= 15;

  // Total
  drawText('TOTAL:', margin, yPosition, 12, darkColor, true);
  drawText(
    `R$ ${receiptData.totalPrice.toFixed(2)}`,
    pageWidth - margin - 80,
    yPosition,
    12,
    accentColor,
    true
  );
  yPosition -= 30;

  // Linha divisória
  drawLine(yPosition);
  yPosition -= 20;

  // Data e Hora
  drawText(`Data: ${receiptData.timestamp}`, margin, yPosition, 9, grayColor);
  yPosition -= 20;

  // Instruções
  drawText('INSTRUÇÕES:', margin, yPosition, 10, darkColor, true);
  yPosition -= 15;
  drawText('1. Este é seu comprovante de pedido', margin, yPosition, 9, grayColor);
  yPosition -= 12;
  drawText('2. Retire suas fotos no balcão', margin, yPosition, 9, grayColor);
  yPosition -= 12;
  drawText('3. Realize o pagamento conforme indicado', margin, yPosition, 9, grayColor);
  yPosition -= 20;

  // Linha divisória
  drawLine(yPosition);
  yPosition -= 20;

  // Rodapé
  drawText('Obrigado por confiar em nós! 💚', margin, yPosition, 10, primaryColor, true);

  // Converte para buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Gera comprovante e retorna como buffer para impressão
 */
export async function generateReceiptForPrinting(orderNumber: string): Promise<Buffer> {
  return generateReceiptPDF(orderNumber);
}
