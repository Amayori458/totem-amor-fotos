import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Heart } from "lucide-react";

export default function Processing() {
  const [, params] = useRoute("/processing/:orderNumber");
  const [, setLocation] = useLocation();
  const orderNumber = params?.orderNumber || "";

  const [progress, setProgress] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);

  useEffect(() => {
    // Simula processamento de fotos
    // Em produção, aqui você chamaria a API para imprimir de verdade
    
    // Assume que o usuário enviou 3 fotos (você pode buscar do backend)
    const estimatedPhotos = 3;
    setTotalPhotos(estimatedPhotos);

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      const newProgress = Math.round((currentIndex / (estimatedPhotos + 1)) * 100);
      setProgress(newProgress);
      setCurrentPhotoIndex(currentIndex);

      // Quando terminar de processar todas as fotos, redireciona para impressão
      if (currentIndex > estimatedPhotos) {
        clearInterval(interval);
        // Aguarda um pouco antes de redirecionar
        setTimeout(() => {
          setLocation(`/print/${orderNumber}`);
        }, 500);
      }
    }, 1500); // 1.5 segundos por foto

    return () => clearInterval(interval);
  }, [orderNumber, setLocation]);

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

        <h1 className="text-[#333333] tracking-tight text-[32px] sm:text-4xl font-bold leading-tight px-4 text-center pb-3 pt-6">
          Preparando suas Fotos...
        </h1>

        <p className="text-gray-600 text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Por favor, aguarde enquanto preparamos suas fotos para impressão.
        </p>

        <div className="w-full max-w-md px-4 py-8">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-lg font-bold text-primary">{progress}%</p>
          {totalPhotos > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {currentPhotoIndex <= totalPhotos
                  ? `Processando foto ${currentPhotoIndex} de ${totalPhotos}...`
                  : `Preparando para impressão...`
                }
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">Pedido: {orderNumber}</p>

        {/* Animação de processamento */}
        <div className="mt-8 flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
