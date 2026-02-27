import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PhotoToPrint {
  fileKey: string;
  fileName: string;
  format: "10x15" | "15x21";
}

export default function Processing() {
  const [, params] = useRoute("/processing/:orderNumber");
  const [, setLocation] = useLocation();
  const orderNumber = params?.orderNumber || "";

  const [progress, setProgress] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [photosQueue, setPhotosQueue] = useState<PhotoToPrint[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        const photosToQueue: PhotoToPrint[] = photos.map((p: any) => ({
          fileKey: p.fileKey,
          fileName: p.fileName,
          format: p.format,
        }));

        setPhotosQueue(photosToQueue);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao processar fotos:", error);
        setErrorMessage(`Erro ao processar fotos: ${error}`);
        setIsLoading(false);
      }
    }
  }, [orderData, queryError]);

  // Imprime fotos uma por uma
  useEffect(() => {
    if (photosQueue.length === 0 || isLoading) return;
    if (isPrinting) return;

    const printNextPhoto = async () => {
      if (currentPhotoIndex >= photosQueue.length) {
        // Todas as fotos foram impressas
        setProgress(100);
        setShowFinal(true);
        return;
      }

      setIsPrinting(true);
      const photo = photosQueue[currentPhotoIndex];
      const newProgress = Math.round(((currentPhotoIndex + 1) / photosQueue.length) * 100);

      try {
        // Simula impressão (em produção, chamaria a API real)
        console.log(`Imprimindo foto ${currentPhotoIndex + 1}/${photosQueue.length}: ${photo.fileName}`);
        
        // Aguarda 2 segundos para simular impressão
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProgress(newProgress);
        setCurrentPhotoIndex(prev => prev + 1);
      } catch (error) {
        console.error("Erro ao imprimir foto:", error);
        setErrorMessage(`Erro ao imprimir foto ${currentPhotoIndex + 1}`);
      } finally {
        setIsPrinting(false);
      }
    };

    printNextPhoto();
  }, [photosQueue, currentPhotoIndex, isPrinting, isLoading]);

  // Countdown para retornar à tela inicial após conclusão
  useEffect(() => {
    if (showFinal && countdown === 0) {
      setLocation(`/receipt/${orderNumber}`);
      return;
    }

    if (showFinal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showFinal, countdown, setLocation, orderNumber]);

  // Tela final após todas as fotos serem impressas
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
            {photosQueue.length} {photosQueue.length === 1 ? 'foto foi' : 'fotos foram'} impressas com sucesso.
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
          Por favor, aguarde enquanto imprimimos suas fotos.
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
          {photosQueue.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Foto {currentPhotoIndex + 1} de {photosQueue.length}
            </p>
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
