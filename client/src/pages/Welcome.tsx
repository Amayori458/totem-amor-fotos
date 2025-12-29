import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const createSession = trpc.totem.createSession.useMutation();

  const handleStart = async () => {
    try {
      setIsLoading(true);
      const result = await createSession.mutateAsync();
      setLocation(`/qrcode/${result.sessionId}`);
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl w-full">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary">Amor por Fotos</h1>
          <Heart className="text-4xl sm:text-5xl ml-2 fill-accent text-accent" />
        </div>

        <h1 className="text-[#333333] tracking-tight text-[32px] sm:text-4xl font-bold leading-tight px-4 text-center pb-3 pt-6">
          Suas Fotos Reveladas com Amor
        </h1>
        
        <p className="text-gray-500 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Toque para revelar sua história
        </p>

        <div className="flex px-4 py-8 justify-center w-full">
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full max-w-xs h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-full disabled:opacity-50"
          >
            {isLoading ? "Carregando..." : "Toque para Começar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
