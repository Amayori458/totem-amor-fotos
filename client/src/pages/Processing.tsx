import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PrintItem {
  type: "photo" | "receipt";
  id: string;
  fileName?: string;
}

export default function Processing() {
  const [, params] = useRoute("/processing/:orderNumber");
  const [, setLocation] = useLocation();
  const orderNumber = params?.orderNumber || "";

  const [progress, setProgress] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [printQueue, setPrintQueue] = useState<PrintItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentItemType, setCurrentItemType] = useState<"photo" | "receipt">("photo");

  // Busca dados do pedido e fotos para imprimir
  const { data: orderData, error: queryError } = trpc.totem.getOrder.useQuery(
    { orderNumber },
    { enabled: !!orderNumber }
  );

  useEffect(() => {
    if (queryError) {
      setErrorMessage(`Erro ao carregar pedido: ${queryError.message}`);
      setIsLoading(false);
      return;
    }

    if (orderData) {
      try {
        // Extrai fotos do metadata do pedido
        const photos = orderData.metadata?.photos || [];
        
        // Cria fila de impressão: fotos + comprovante no final
        const queue: PrintItem[] = photos.map((p: any, index: number) => ({
          type: "photo",
          id: `photo-${index}`,
          fileName: p.fileName,
        }));

        // Adiciona comprovante no final
        queue.push({
          type: "receipt",
          id: "receipt",
          fileName: `Comprovante-${orderNumber}`,
        });

        setPrintQueue(queue);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao processar fotos:", error);
        setErrorMessage(`Erro ao processar fotos: ${error}`);
        setIsLoading(false);
      }
    }
  }, [orderData, queryError, orderNumber]);

  // Imprime itens da fila um por um (fotos + comprovante)
  useEffect(() => {
    if (printQueue.length === 0 || isLoading) return;
    if (isPrinting) return;

    const printNextItem = async () => {
      if (currentItemIndex >= printQueue.length) {
        // Todas as fotos e comprovante foram impressos
        setProgress(100);
        setShowFinal(true);
        return;
      }

      setIsPrinting(true);
      const item = printQueue[currentItemIndex];
      const newProgress = Math.round(((currentItemIndex + 1) / printQueue.length) * 100);

      try {
        setCurrentItemType(item.type);

        if (item.type === "photo") {
          console.log(`Imprimindo foto ${currentItemIndex + 1}/${printQueue.length}: ${item.fileName}`);
        } else {
          console.log(`Imprimindo comprovante...`);
        }

        // Simula impressão (em produção, chamaria a API real)
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProgress(newProgress);
        setCurrentItemIndex(prev => prev + 1);
      } catch (error) {
        console.error("Erro ao imprimir:", error);
        setErrorMessage(`Erro ao imprimir: ${error}`);
      } finally {
        setIsPrinting(false);
      }
    };

    printNextItem();
  }, [printQueue, currentItemIndex, isPrinting, isLoading]);

  // Countdown para retornar à tela inicial após conclusão
  useEffect(() => {
    if (showFinal && countdown === 0) {
      setLocation("/");
      return;
    }

    if (showFinal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showFinal, countdown, setLocation]);

  // Tela final após todas as fotos e comprovante serem impressos
  if (showFinal) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center max-w-xl w-full text-center">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary">Amor por Fotos</h1>
            <Heart className="text-4xl sm:text-5xl ml-2 fill-accent text-accent" />
          </div>

          <div className="mb-8">
            <svg
              className="w-24 h-24 text-primary mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-[#333333] tracking-tight text-[32px] sm:text-4xl font-bold leading-tight px-4 text-center pb-3">
            Suas Fotos Estão Prontas!
          </h1>

          <p className="text-gray-600 text-lg font-normal leading-normal pb-3 pt-1 px-4 text-center mb-4">
            Todas as fotos e o comprovante foram impressos com sucesso.
          </p>

          <p className="text-sm text-gray-500 mb-2">Pedido: {orderNumber}</p>

          <p className="text-sm text-gray-500">Retornando ao início em {countdown}s...</p>
        </div>
      </div>
    );
  }

  // Tela de processamento
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl w-full text-center">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary">Amor por Fotos</h1>
          <Heart className="text-4xl sm:text-5xl ml-2 fill-accent text-accent" />
        </div>

        <h1 className="text-[#333333] tracking-tight text-[32px] sm:text-4xl font-bold leading-tight px-4 text-center pb-3 pt-6">
          Imprimindo suas Fotos...
        </h1>

        <p className="text-gray-600 text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Por favor, aguarde enquanto imprimimos suas fotos e comprovante.
        </p>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm w-full">
            {errorMessage}
          </div>
        )}

        <div className="w-full max-w-md px-4 py-8">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-lg font-bold text-primary">{progress}%</p>
          {printQueue.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {currentItemType === "photo" 
                  ? `Foto ${currentItemIndex + 1} de ${printQueue.length}`
                  : `Imprimindo comprovante...`
                }
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">Pedido: {orderNumber}</p>

        {/* Animação de impressão */}
        <div className="mt-8 flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
