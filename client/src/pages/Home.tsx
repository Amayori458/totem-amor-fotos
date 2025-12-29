import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 p-4">
      {/* Logo e Marca */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="text-4xl font-bold text-cyan-600">Amor por Fotos</div>
        <Heart className="w-10 h-10 text-red-500 fill-red-500" />
      </div>

      {/* Título Principal */}
      <h1 className="text-foreground tracking-tight text-4xl sm:text-5xl font-bold leading-tight px-4 text-center pb-3 pt-6">
        Suas Fotos Reveladas com Amor
      </h1>

      {/* Subtítulo */}
      <p className="text-gray-500 text-lg font-normal leading-normal pb-3 pt-1 px-4 text-center max-w-2xl">
        Toque para revelar sua história
      </p>

      {/* Botão Principal */}
      <div className="flex px-4 py-8 justify-center w-full">
        <Button
          onClick={() => setLocation("/welcome")}
          size="lg"
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Toque para Começar
        </Button>
      </div>

      {/* Rodapé */}
      <div className="absolute bottom-8 text-center text-sm text-gray-400">
        <p>© 2024 Amor por Fotos</p>
        <p className="mt-2">Suas memórias, reveladas com amor</p>
      </div>

      {/* Elemento decorativo de animação */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}
