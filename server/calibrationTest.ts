import sharp from 'sharp';
import { processForASK400 } from './ask400Processor';

/**
 * Gerador de imagens de teste para calibração da ASK-400
 */

/**
 * Gera grade milimetrada para teste de alinhamento
 */
export async function generateGridTestImage(
  format: '10x15' | '15x21'
): Promise<Buffer> {
  const specs = {
    '10x15': { width: 1181, height: 1772 },
    '15x21': { width: 1772, height: 2480 },
  };

  const spec = specs[format];

  // Cria SVG com grade milimetrada
  const svg = `
    <svg width="${spec.width}" height="${spec.height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Fundo branco -->
      <rect width="${spec.width}" height="${spec.height}" fill="white"/>
      
      <!-- Grade milimetrada -->
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cccccc" stroke-width="1"/>
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#999999" stroke-width="2" stroke-dasharray="5,5"/>
        </pattern>
      </defs>
      
      <rect width="${spec.width}" height="${spec.height}" fill="url(#grid)"/>
      
      <!-- Bordas de corte -->
      <rect x="0" y="0" width="${spec.width}" height="${spec.height}" fill="none" stroke="red" stroke-width="3" stroke-dasharray="10,10"/>
      
      <!-- Marcas de centro -->
      <line x1="${spec.width / 2}" y1="0" x2="${spec.width / 2}" y2="50" stroke="blue" stroke-width="2"/>
      <line x1="0" y1="${spec.height / 2}" x2="50" y2="${spec.height / 2}" stroke="blue" stroke-width="2"/>
      
      <!-- Texto de informação -->
      <text x="${spec.width / 2}" y="100" font-size="40" font-family="Arial" text-anchor="middle" fill="black">
        Teste de Calibração ${format}
      </text>
      
      <text x="${spec.width / 2}" y="150" font-size="30" font-family="Arial" text-anchor="middle" fill="gray">
        ${spec.width}x${spec.height}px
      </text>
      
      <!-- Cantos para verificar alinhamento -->
      <circle cx="20" cy="20" r="15" fill="black"/>
      <circle cx="${spec.width - 20}" cy="20" r="15" fill="black"/>
      <circle cx="20" cy="${spec.height - 20}" r="15" fill="black"/>
      <circle cx="${spec.width - 20}" cy="${spec.height - 20}" r="15" fill="black"/>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg))
    .jpeg({ quality: 95 })
    .toBuffer();

  return buffer;
}

/**
 * Gera imagem com rosto centralizado (usando padrão de teste)
 */
export async function generateFaceTestImage(
  format: '10x15' | '15x21'
): Promise<Buffer> {
  const specs = {
    '10x15': { width: 1181, height: 1772 },
    '15x21': { width: 1772, height: 2480 },
  };

  const spec = specs[format];

  // Cria SVG com círculo centralizado (simulando rosto)
  const svg = `
    <svg width="${spec.width}" height="${spec.height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Fundo gradiente -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8f4f8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c0e8f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="${spec.width}" height="${spec.height}" fill="url(#grad)"/>
      
      <!-- Círculo centralizado (rosto) -->
      <circle cx="${spec.width / 2}" cy="${spec.height / 2}" r="${Math.min(spec.width, spec.height) / 3}" fill="#FFB6C1" stroke="black" stroke-width="3"/>
      
      <!-- Olhos -->
      <circle cx="${spec.width / 2 - 80}" cy="${spec.height / 2 - 50}" r="30" fill="white" stroke="black" stroke-width="2"/>
      <circle cx="${spec.width / 2 + 80}" cy="${spec.height / 2 - 50}" r="30" fill="white" stroke="black" stroke-width="2"/>
      
      <!-- Pupilas -->
      <circle cx="${spec.width / 2 - 80}" cy="${spec.height / 2 - 50}" r="15" fill="black"/>
      <circle cx="${spec.width / 2 + 80}" cy="${spec.height / 2 - 50}" r="15" fill="black"/>
      
      <!-- Nariz -->
      <polygon points="${spec.width / 2},${spec.height / 2} ${spec.width / 2 - 20},${spec.height / 2 + 20} ${spec.width / 2 + 20},${spec.height / 2 + 20}" fill="black"/>
      
      <!-- Boca -->
      <path d="M ${spec.width / 2 - 50} ${spec.height / 2 + 80} Q ${spec.width / 2} ${spec.height / 2 + 120} ${spec.width / 2 + 50} ${spec.height / 2 + 80}" stroke="black" stroke-width="3" fill="none"/>
      
      <!-- Bordas de segurança -->
      <rect x="50" y="50" width="${spec.width - 100}" height="${spec.height - 100}" fill="none" stroke="green" stroke-width="2" stroke-dasharray="20,10"/>
      
      <!-- Texto -->
      <text x="${spec.width / 2}" y="${spec.height - 150}" font-size="40" font-family="Arial" text-anchor="middle" fill="black">
        Teste de Centralização
      </text>
      
      <text x="${spec.width / 2}" y="${spec.height - 80}" font-size="30" font-family="Arial" text-anchor="middle" fill="gray">
        Rosto deve estar centralizado
      </text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg))
    .jpeg({ quality: 95 })
    .toBuffer();

  return buffer;
}

/**
 * Gera imagem com texto nas bordas para verificar crop
 */
export async function generateBorderTestImage(
  format: '10x15' | '15x21'
): Promise<Buffer> {
  const specs = {
    '10x15': { width: 1181, height: 1772 },
    '15x21': { width: 1772, height: 2480 },
  };

  const spec = specs[format];

  // Cria SVG com texto nas bordas
  const svg = `
    <svg width="${spec.width}" height="${spec.height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Fundo -->
      <rect width="${spec.width}" height="${spec.height}" fill="white"/>
      
      <!-- Borda externa -->
      <rect x="0" y="0" width="${spec.width}" height="${spec.height}" fill="none" stroke="red" stroke-width="5"/>
      
      <!-- Área segura (margem de 5%) -->
      <rect x="${spec.width * 0.05}" y="${spec.height * 0.05}" width="${spec.width * 0.9}" height="${spec.height * 0.9}" fill="none" stroke="green" stroke-width="3" stroke-dasharray="10,5"/>
      
      <!-- Texto nas bordas -->
      <text x="50" y="80" font-size="35" font-family="Arial" fill="black">TOPO</text>
      <text x="50" y="${spec.height - 30}" font-size="35" font-family="Arial" fill="black">FUNDO</text>
      <text x="20" y="${spec.height / 2}" font-size="35" font-family="Arial" fill="black" transform="rotate(-90 20 ${spec.height / 2})">ESQUERDA</text>
      <text x="${spec.width - 100}" y="${spec.height / 2}" font-size="35" font-family="Arial" fill="black" transform="rotate(90 ${spec.width - 100} ${spec.height / 2})">DIREITA</text>
      
      <!-- Centro -->
      <circle cx="${spec.width / 2}" cy="${spec.height / 2}" r="100" fill="none" stroke="blue" stroke-width="3"/>
      <text x="${spec.width / 2}" y="${spec.height / 2}" font-size="40" font-family="Arial" text-anchor="middle" fill="blue">CENTRO</text>
      
      <!-- Informações -->
      <text x="${spec.width / 2}" y="150" font-size="30" font-family="Arial" text-anchor="middle" fill="black">
        Teste de Bordas - ${format}
      </text>
      
      <text x="${spec.width / 2}" y="${spec.height - 100}" font-size="25" font-family="Arial" text-anchor="middle" fill="gray">
        Verifique se o texto está visível nas bordas
      </text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg))
    .jpeg({ quality: 95 })
    .toBuffer();

  return buffer;
}

/**
 * Executa suite completa de testes de calibração
 */
export async function runCalibrationSuite(
  format: '10x15' | '15x21'
): Promise<{
  gridTest: Buffer;
  faceTest: Buffer;
  borderTest: Buffer;
}> {
  console.log(`[Calibration] Gerando suite de testes para ${format}`);

  const gridTest = await generateGridTestImage(format);
  const faceTest = await generateFaceTestImage(format);
  const borderTest = await generateBorderTestImage(format);

  console.log(`[Calibration] Suite de testes gerada com sucesso`);

  return {
    gridTest,
    faceTest,
    borderTest,
  };
}

/**
 * Gera relatório de calibração
 */
export function generateCalibrationReport(format: '10x15' | '15x21'): string {
  const report = `
╔════════════════════════════════════════════════════════════════╗
║            RELATÓRIO DE CALIBRAÇÃO - ASK-400                   ║
╚════════════════════════════════════════════════════════════════╝

Formato: ${format}
Data: ${new Date().toLocaleString('pt-BR')}

TESTES GERADOS:
  1. Grade Milimetrada (gridTest)
     - Verifica alinhamento de pixels
     - Valida proporção correta
     - Marca de centro em azul

  2. Teste de Rosto (faceTest)
     - Rosto centralizado em rosa
     - Bordas de segurança em verde
     - Verifica centralização

  3. Teste de Bordas (borderTest)
     - Texto em todas as bordas
     - Área segura marcada em verde
     - Verifica corte correto

INSTRUÇÕES:
  1. Imprima cada imagem de teste
  2. Verifique se:
     - Rosto está perfeitamente centralizado
     - Texto das bordas está visível
     - Grade está alinhada
     - Sem bordas brancas
  3. Se algum teste falhar, ajuste o crop no software

CONFIGURAÇÕES ESPERADAS:
  - DPI: 300
  - Tamanho: ${format === '10x15' ? '10x15 cm' : '15x21 cm'}
  - Proporção: ${format === '10x15' ? '1181x1772' : '1772x2480'} pixels
  - Formato: JPEG
  - Escala: 100%
  - Auto-enhance: Desativado

PRÓXIMOS PASSOS:
  1. Execute os testes
  2. Verifique os resultados
  3. Ajuste o crop se necessário
  4. Teste novamente até perfeição
  5. Libere para produção

╚════════════════════════════════════════════════════════════════╝
`;

  return report;
}
