import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Interface para representar uma impressora
 */
export interface Printer {
  name: string;
  isDefault: boolean;
  status: string;
  model?: string;
}

/**
 * Obtém lista de impressoras disponíveis no Windows
 */
export async function getPrinters(): Promise<Printer[]> {
  try {
    const platform = os.platform();
    
    if (platform === 'win32') {
      return await getPrintersWindows();
    } else if (platform === 'linux') {
      return await getPrintersLinux();
    } else if (platform === 'darwin') {
      return await getPrintersMac();
    }
    
    return [];
  } catch (error) {
    console.error('[Printer Manager] Erro ao obter lista de impressoras:', error);
    return [];
  }
}

/**
 * Obtém impressoras no Windows usando PowerShell
 */
async function getPrintersWindows(): Promise<Printer[]> {
  try {
    const { stdout } = await execAsync(
      'powershell -Command "Get-Printer | Select-Object Name, Default | ConvertTo-Json"',
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const printers = JSON.parse(stdout);
    const printerList = Array.isArray(printers) ? printers : [printers];

    return printerList.map((p: any) => ({
      name: p.Name,
      isDefault: p.Default === true,
      status: 'Ready',
      model: p.Model || 'Unknown',
    }));
  } catch (error) {
    console.error('[Printer Manager] Erro ao obter impressoras Windows:', error);
    return [];
  }
}

/**
 * Obtém impressoras no Linux usando CUPS
 */
async function getPrintersLinux(): Promise<Printer[]> {
  try {
    const { stdout } = await execAsync('lpstat -p -d');
    const lines = stdout.split('\n');
    const printers: Printer[] = [];

    for (const line of lines) {
      if (line.startsWith('printer')) {
        const match = line.match(/printer ([\w-]+)/);
        if (match) {
          printers.push({
            name: match[1],
            isDefault: line.includes('*'),
            status: 'Ready',
          });
        }
      }
    }

    return printers;
  } catch (error) {
    console.error('[Printer Manager] Erro ao obter impressoras Linux:', error);
    return [];
  }
}

/**
 * Obtém impressoras no macOS
 */
async function getPrintersMac(): Promise<Printer[]> {
  try {
    const { stdout } = await execAsync('lpstat -p -d');
    const lines = stdout.split('\n');
    const printers: Printer[] = [];

    for (const line of lines) {
      if (line.startsWith('printer')) {
        const match = line.match(/printer ([\w-]+)/);
        if (match) {
          printers.push({
            name: match[1],
            isDefault: line.includes('*'),
            status: 'Ready',
          });
        }
      }
    }

    return printers;
  } catch (error) {
    console.error('[Printer Manager] Erro ao obter impressoras macOS:', error);
    return [];
  }
}

/**
 * Imprime um arquivo usando a impressora especificada
 */
export async function printFile(
  filePath: string,
  printerName: string,
  copies: number = 1
): Promise<{ success: boolean; message: string }> {
  try {
    const platform = os.platform();
    
    if (!fs.existsSync(filePath)) {
      return { success: false, message: 'Arquivo não encontrado' };
    }

    if (platform === 'win32') {
      return await printFileWindows(filePath, printerName, copies);
    } else if (platform === 'linux' || platform === 'darwin') {
      return await printFileUnix(filePath, printerName, copies);
    }

    return { success: false, message: 'Sistema operacional não suportado' };
  } catch (error) {
    console.error('[Printer Manager] Erro ao imprimir:', error);
    return { success: false, message: `Erro ao imprimir: ${error}` };
  }
}

/**
 * Imprime arquivo no Windows
 */
async function printFileWindows(
  filePath: string,
  printerName: string,
  copies: number
): Promise<{ success: boolean; message: string }> {
  try {
    const escapedPath = filePath.replace(/\\/g, '\\\\');
    const escapedPrinter = printerName.replace(/"/g, '\\"');

    const command = `powershell -Command "Add-PrinterPort -Name ${escapedPrinter} -PrinterAddress ${escapedPrinter} -ErrorAction SilentlyContinue; Print-Document -PrinterName '${escapedPrinter}' -FilePath '${escapedPath}' -Copies ${copies}"`;

    await execAsync(command);

    console.log(`[Printer Manager] Arquivo impresso com sucesso em ${printerName}`);
    return {
      success: true,
      message: `Impressão iniciada em ${printerName}`,
    };
  } catch (error) {
    console.error('[Printer Manager] Erro ao imprimir no Windows:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Imprime arquivo no Linux/macOS
 */
async function printFileUnix(
  filePath: string,
  printerName: string,
  copies: number
): Promise<{ success: boolean; message: string }> {
  try {
    await execAsync(`lp -d ${printerName} -n ${copies} "${filePath}"`);

    console.log(`[Printer Manager] Arquivo impresso com sucesso em ${printerName}`);
    return {
      success: true,
      message: `Impressão iniciada em ${printerName}`,
    };
  } catch (error) {
    console.error('[Printer Manager] Erro ao imprimir no Unix:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Imprime buffer de imagem diretamente
 */
export async function printImageBuffer(
  imageBuffer: Buffer,
  printerName: string,
  copies: number = 1
): Promise<{ success: boolean; message: string }> {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `print_${Date.now()}.jpg`);

  try {
    // Salva buffer em arquivo temporário
    fs.writeFileSync(tempFile, imageBuffer);

    // Imprime o arquivo
    const result = await printFile(tempFile, printerName, copies);

    // Limpa arquivo temporário após 5 segundos
    setTimeout(() => {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        console.warn('[Printer Manager] Erro ao limpar arquivo temporário:', e);
      }
    }, 5000);

    return result;
  } catch (error) {
    console.error('[Printer Manager] Erro ao imprimir buffer:', error);
    return {
      success: false,
      message: `Erro ao imprimir: ${error}`,
    };
  }
}

/**
 * Define impressora como padrão
 */
export async function setDefaultPrinter(printerName: string): Promise<boolean> {
  try {
    const platform = os.platform();

    if (platform === 'win32') {
      await execAsync(`powershell -Command "Set-PrinterAsDefault -Name '${printerName}'"`);
      return true;
    } else if (platform === 'linux' || platform === 'darwin') {
      await execAsync(`lpadmin -d ${printerName}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Printer Manager] Erro ao definir impressora padrão:', error);
    return false;
  }
}

/**
 * Testa conexão com impressora
 */
export async function testPrinter(printerName: string): Promise<boolean> {
  try {
    const printers = await getPrinters();
    return printers.some(p => p.name === printerName);
  } catch (error) {
    console.error('[Printer Manager] Erro ao testar impressora:', error);
    return false;
  }
}
