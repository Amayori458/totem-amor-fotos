import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Driver de impressão específico para Fujifilm ASK-400
 * Otimizado para Windows com driver oficial
 */

export interface ASK400PrintSettings {
  printerName: string;
  format: '10x15' | '15x21';
  copies: number;
  quality: 'Best' | 'High' | 'Normal';
  scaling: 100; // Sempre 100%
  autoEnhance: false; // Sempre desativado
}

/**
 * Configurações padrão para ASK-400
 */
const ASK400_DEFAULTS: Record<'10x15' | '15x21', ASK400PrintSettings> = {
  '10x15': {
    printerName: 'Fujifilm ASK-400',
    format: '10x15',
    copies: 1,
    quality: 'Best',
    scaling: 100,
    autoEnhance: false,
  },
  '15x21': {
    printerName: 'Fujifilm ASK-400',
    format: '15x21',
    copies: 1,
    quality: 'Best',
    scaling: 100,
    autoEnhance: false,
  },
};

/**
 * Mapeia formato para tamanho de papel Windows
 */
function getWindowsPaperSize(format: '10x15' | '15x21'): string {
  return format === '10x15' ? '4x6' : '6x8';
}

/**
 * Gera arquivo de configuração para impressora
 */
async function generatePrinterConfig(
  settings: ASK400PrintSettings,
  imagePath: string
): Promise<string> {
  const configPath = path.join(os.tmpdir(), `ask400_print_${Date.now()}.ini`);

  const paperSize = getWindowsPaperSize(settings.format);
  const config = `
[PrinterSettings]
PrinterName=${settings.printerName}
PaperSize=${paperSize}
Orientation=Portrait
Scaling=100
Quality=${settings.quality}
Copies=${settings.copies}
AutoEnhance=False
ColorMode=Color

[ImageSettings]
FilePath=${imagePath}
DPI=300
Format=JPEG

[ASK400Specific]
MediaType=PhotoPaper
MediaSize=${paperSize}
PrintMode=HighQuality
ColorCorrection=Enabled
`;

  fs.writeFileSync(configPath, config);
  console.log(`[ASK-400 Driver] Configuração gerada: ${configPath}`);

  return configPath;
}

/**
 * Imprime imagem no Windows usando PowerShell
 */
async function printOnWindows(
  imagePath: string,
  settings: ASK400PrintSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const paperSize = getWindowsPaperSize(settings.format);

    // PowerShell script para impressão
    const psScript = `
$printerName = '${settings.printerName}'
$imagePath = '${imagePath.replace(/\\/g, '\\\\')}'
$paperSize = '${paperSize}'
$copies = ${settings.copies}

# Verifica se impressora existe
$printer = Get-Printer -Name $printerName -ErrorAction SilentlyContinue
if (-not $printer) {
    throw "Impressora não encontrada: $printerName"
}

# Configura impressora como padrão
Set-PrinterAsDefault -Name $printerName

# Cria documento de impressão
$doc = New-Object System.Diagnostics.ProcessStartInfo
$doc.FileName = 'mspaint.exe'
$doc.Arguments = "/pt \\"$imagePath\\" \\"$printerName\\""
$doc.UseShellExecute = $false
$doc.CreateNoWindow = $true

# Executa impressão
$process = [System.Diagnostics.Process]::Start($doc)
$process.WaitForExit()

Write-Host "Impressão enviada com sucesso"
`;

    const psPath = path.join(os.tmpdir(), `ask400_print_${Date.now()}.ps1`);
    fs.writeFileSync(psPath, psScript);

    // Executa PowerShell script
    await execAsync(
      `powershell -ExecutionPolicy Bypass -File "${psPath}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    // Limpa arquivo temporário
    setTimeout(() => {
      try {
        fs.unlinkSync(psPath);
      } catch (e) {
        console.warn('[ASK-400 Driver] Erro ao limpar script temporário:', e);
      }
    }, 2000);

    console.log(`[ASK-400 Driver] Impressão enviada com sucesso`);
    return {
      success: true,
      message: `Impressão enviada para ${settings.printerName}`,
    };
  } catch (error) {
    console.error('[ASK-400 Driver] Erro ao imprimir no Windows:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Imprime imagem no Linux usando CUPS
 */
async function printOnLinux(
  imagePath: string,
  settings: ASK400PrintSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const paperSize = getWindowsPaperSize(settings.format);

    // Comando lp para impressão
    const command = `lp -d ${settings.printerName} -o media=${paperSize} -o sides=one-sided -n ${settings.copies} "${imagePath}"`;

    await execAsync(command);

    console.log(`[ASK-400 Driver] Impressão enviada com sucesso`);
    return {
      success: true,
      message: `Impressão enviada para ${settings.printerName}`,
    };
  } catch (error) {
    console.error('[ASK-400 Driver] Erro ao imprimir no Linux:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Imprime imagem no macOS
 */
async function printOnMac(
  imagePath: string,
  settings: ASK400PrintSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const paperSize = getWindowsPaperSize(settings.format);

    // Comando lp para impressão
    const command = `lp -d ${settings.printerName} -o media=${paperSize} -n ${settings.copies} "${imagePath}"`;

    await execAsync(command);

    console.log(`[ASK-400 Driver] Impressão enviada com sucesso`);
    return {
      success: true,
      message: `Impressão enviada para ${settings.printerName}`,
    };
  } catch (error) {
    console.error('[ASK-400 Driver] Erro ao imprimir no macOS:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Imprime imagem na ASK-400
 */
export async function printToASK400(
  imagePath: string,
  format: '10x15' | '15x21',
  printerName: string = 'Fujifilm ASK-400',
  copies: number = 1
): Promise<{ success: boolean; message: string }> {
  try {
    // Valida arquivo
    if (!fs.existsSync(imagePath)) {
      return {
        success: false,
        message: 'Arquivo de imagem não encontrado',
      };
    }

    // Prepara configurações
    const settings: ASK400PrintSettings = {
      printerName,
      format,
      copies,
      quality: 'Best',
      scaling: 100,
      autoEnhance: false,
    };

    console.log(`[ASK-400 Driver] Iniciando impressão: ${format} (${copies} cópia(s))`);

    const platform = os.platform();

    if (platform === 'win32') {
      return await printOnWindows(imagePath, settings);
    } else if (platform === 'linux') {
      return await printOnLinux(imagePath, settings);
    } else if (platform === 'darwin') {
      return await printOnMac(imagePath, settings);
    }

    return {
      success: false,
      message: 'Sistema operacional não suportado',
    };
  } catch (error) {
    console.error('[ASK-400 Driver] Erro geral:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Imprime buffer de imagem
 */
export async function printBufferToASK400(
  imageBuffer: Buffer,
  format: '10x15' | '15x21',
  printerName: string = 'Fujifilm ASK-400',
  copies: number = 1
): Promise<{ success: boolean; message: string }> {
  const tempPath = path.join(os.tmpdir(), `ask400_print_${Date.now()}.jpg`);

  try {
    // Salva buffer em arquivo temporário
    fs.writeFileSync(tempPath, imageBuffer);

    // Imprime
    const result = await printToASK400(tempPath, format, printerName, copies);

    // Limpa arquivo temporário após 5 segundos
    setTimeout(() => {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.warn('[ASK-400 Driver] Erro ao limpar arquivo temporário:', e);
      }
    }, 5000);

    return result;
  } catch (error) {
    console.error('[ASK-400 Driver] Erro ao imprimir buffer:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Obtém informações de configuração para ASK-400
 */
export function getASK400Config(format: '10x15' | '15x21'): ASK400PrintSettings {
  return ASK400_DEFAULTS[format];
}

/**
 * Valida configurações de impressão
 */
export function validateASK400Settings(
  settings: Partial<ASK400PrintSettings>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!settings.printerName) {
    errors.push('Nome da impressora não especificado');
  }

  if (!settings.format || !['10x15', '15x21'].includes(settings.format)) {
    errors.push('Formato inválido');
  }

  if (settings.scaling !== 100) {
    errors.push('Escala deve ser sempre 100%');
  }

  if (settings.autoEnhance !== false) {
    errors.push('Auto-enhance deve estar desativado');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
