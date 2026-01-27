import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Processing() {
  const [, params] = useRoute("/processing/:orderNumber");
  const [, setLocation] = useLocation();
  const orderNumber = params?.orderNumber || "";

  const [progress, setProgress] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Simulate processing progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowFinal(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showFinal && countdown === 0) {
      setLocation(`/receipt/${orderNumber}`);
    }
  }, [showFinal, countdown, setLocation, orderNumber]);

  useEffect(() => {
    if (showFinal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showFinal, countdown]);

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
            Por favor, retire-as no balcão.
          </p>

          <p className="text-sm text-gray-500 mb-2">Pedido: {orderNumber}</p>

          <div className="flex px-4 py-8 justify-center w-full">
            <Button
              onClick={() => setLocation(`/receipt/${orderNumber}`)}
              className="w-full max-w-xs h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-full"
            >
              Ver Comprovante
            </Button>
          </div>

          <p className="text-sm text-gray-500">Retornando ao início em {countdown}s...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl w-full text-center">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary">Amor por Fotos</h1>
          <Heart className="text-4xl sm:text-5xl ml-2 fill-accent text-accent" />
        </div>

        <h1 className="text-[#333333] tracking-tight text-[32px] sm:text-4xl font-bold leading-tight px-4 text-center pb-3 pt-6">
          Processando seu Pedido...
        </h1>

        <p className="text-gray-600 text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Por favor, aguarde enquanto preparamos suas fotos.
        </p>

        <div className="w-full max-w-md px-4 py-8">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-lg font-bold text-primary">{progress}%</p>
        </div>

        <p className="text-sm text-gray-500">Pedido: {orderNumber}</p>
      </div>
    </div>
  );
}
