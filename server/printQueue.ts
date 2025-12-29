import { EventEmitter } from 'events';

/**
 * Fila de impressão com watchdog para ASK-400
 * - Fila travada durante impressão
 * - Um tamanho por job
 * - Watchdog para detectar erros
 */

export interface PrintJob {
  id: string;
  orderNumber: string;
  format: '10x15' | '15x21';
  imageBuffer: Buffer;
  printerName: string;
  copies: number;
  createdAt: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export class PrintQueue extends EventEmitter {
  private queue: PrintJob[] = [];
  private isProcessing = false;
  private currentJob: PrintJob | null = null;
  private watchdogTimeout: NodeJS.Timeout | null = null;
  private watchdogInterval = 30000; // 30 segundos

  constructor() {
    super();
    console.log('[Print Queue] Fila de impressão inicializada');
  }

  /**
   * Adiciona job à fila
   */
  addJob(job: PrintJob): void {
    this.queue.push(job);
    console.log(`[Print Queue] Job adicionado: ${job.id} (${job.format})`);
    this.emit('jobAdded', job);

    // Inicia processamento se não estiver rodando
    if (!this.isProcessing) {
      this.processNext();
    }
  }

  /**
   * Processa próximo job da fila
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.currentJob = this.queue.shift() || null;

    if (!this.currentJob) {
      this.isProcessing = false;
      return;
    }

    try {
      this.currentJob.status = 'printing';
      this.currentJob.startedAt = new Date();

      console.log(`[Print Queue] Iniciando impressão: ${this.currentJob.id}`);
      this.emit('jobStarted', this.currentJob);

      // Inicia watchdog
      this.startWatchdog();

      // Simula impressão (será substituído por chamada real ao driver)
      await this.printJob(this.currentJob);

      this.currentJob.status = 'completed';
      this.currentJob.completedAt = new Date();

      console.log(`[Print Queue] Impressão concluída: ${this.currentJob.id}`);
      this.emit('jobCompleted', this.currentJob);
    } catch (error) {
      this.currentJob.status = 'failed';
      this.currentJob.error = `${error}`;
      this.currentJob.completedAt = new Date();

      console.error(`[Print Queue] Erro na impressão: ${this.currentJob.id}`, error);
      this.emit('jobFailed', this.currentJob);
    } finally {
      this.stopWatchdog();
      this.isProcessing = false;
      this.currentJob = null;

      // Processa próximo job
      setTimeout(() => this.processNext(), 1000);
    }
  }

  /**
   * Inicia watchdog para detectar travamentos
   */
  private startWatchdog(): void {
    this.watchdogTimeout = setTimeout(() => {
      if (this.currentJob && this.currentJob.status === 'printing') {
        console.error(`[Print Queue] Watchdog: Job travado por mais de ${this.watchdogInterval}ms`);
        this.emit('watchdogTimeout', this.currentJob);

        // Marca como falha
        if (this.currentJob) {
          this.currentJob.status = 'failed';
          this.currentJob.error = 'Watchdog timeout: impressora não respondeu';
        }
      }
    }, this.watchdogInterval);
  }

  /**
   * Para watchdog
   */
  private stopWatchdog(): void {
    if (this.watchdogTimeout) {
      clearTimeout(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
  }

  /**
   * Executa impressão (placeholder)
   */
  private async printJob(job: PrintJob): Promise<void> {
    // Será implementado com chamada real ao driver
    return new Promise((resolve, reject) => {
      console.log(`[Print Queue] Enviando para impressora: ${job.printerName}`);

      // Simula tempo de impressão
      const printTime = Math.random() * 5000 + 2000; // 2-7 segundos

      setTimeout(() => {
        // Simula 95% de sucesso
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Erro simulado na impressora'));
        }
      }, printTime);
    });
  }

  /**
   * Obtém status da fila
   */
  getStatus(): {
    isProcessing: boolean;
    queueLength: number;
    currentJob: PrintJob | null;
    jobs: PrintJob[];
  } {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      currentJob: this.currentJob,
      jobs: [...this.queue, ...(this.currentJob ? [this.currentJob] : [])],
    };
  }

  /**
   * Limpa fila
   */
  clear(): void {
    this.queue = [];
    console.log('[Print Queue] Fila limpa');
  }

  /**
   * Pausa processamento
   */
  pause(): void {
    this.isProcessing = true;
    console.log('[Print Queue] Processamento pausado');
    this.emit('paused');
  }

  /**
   * Retoma processamento
   */
  resume(): void {
    this.isProcessing = false;
    console.log('[Print Queue] Processamento retomado');
    this.emit('resumed');
    this.processNext();
  }

  /**
   * Cancela job específico
   */
  cancelJob(jobId: string): boolean {
    const index = this.queue.findIndex((j) => j.id === jobId);
    if (index !== -1) {
      const job = this.queue.splice(index, 1)[0];
      console.log(`[Print Queue] Job cancelado: ${jobId}`);
      this.emit('jobCancelled', job);
      return true;
    }
    return false;
  }

  /**
   * Aguarda conclusão de todos os jobs
   */
  async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (!this.isProcessing && this.queue.length === 0) {
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  }
}

// Instância global da fila
export const printQueue = new PrintQueue();

// Event listeners para logging
printQueue.on('jobAdded', (job) => {
  console.log(`[Print Queue Event] Job adicionado: ${job.id}`);
});

printQueue.on('jobStarted', (job) => {
  console.log(`[Print Queue Event] Job iniciado: ${job.id}`);
});

printQueue.on('jobCompleted', (job) => {
  console.log(`[Print Queue Event] Job concluído: ${job.id}`);
});

printQueue.on('jobFailed', (job) => {
  console.log(`[Print Queue Event] Job falhou: ${job.id} - ${job.error}`);
});

printQueue.on('watchdogTimeout', (job) => {
  console.error(`[Print Queue Event] Watchdog timeout: ${job.id}`);
});
