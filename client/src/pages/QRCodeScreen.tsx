import { useState, useEffect } from "react";
import { QrCode, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import QRCode from "react-qr-code";

export default function QRCodeScreen() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/qrcode/:sessionId");
  const sessionId = params?.sessionId || "";
  
  const [photosReceived, setPhotosReceived] = useState<number>(0);
  const [inactivityTimer, setInactivityTimer] = useState<number>(240); // 240 segundos = 4 minutos
  
  const { data: photos } = trpc.totem.getPhotos.useQuery(
    { sessionId },
    { enabled: !!sessionId, refetchInterval: 2000 }
  );

  useEffect(() => {
    if (photos && photos.length > 0) {
      setPhotosReceived(photos.length);
      // Se recebeu fotos, redireciona para seleção após 3 segundos
      setTimeout(() => {
        setLocation(`/select/${sessionId}`);
      }, 3000);
    }
  }, [photos, sessionId, setLocation]);

  useEffect(() => {
    if (inactivityTimer === 0) {
      setLocation("/");
    }
    const timer = setTimeout(() => {
      setInactivityTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [inactivityTimer, setLocation]);

  const uploadUrl = sessionId
    ? `${window.location.origin}/upload/${sessionId}`
    : "";

  const qrCodeUrl = sessionId
    ? `${window.location.origin}/upload/${sessionId}`
    : "";

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="layout-container flex h-full max-w-4xl grow flex-col items-center justify-center gap-8">
        {/* Botão Voltar */}
        <div className="absolute top-6 left-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Button>
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Revele suas Memórias Favoritas
          </h1>
          <p className="text-muted-foreground text-lg">
            Siga os passos abaixo para enviar suas fotos e eternizar seus momentos.
          </p>
        </div>

        {/* Instruções */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <div className="p-6 bg-muted rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-primary bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Passo 1</h3>
                <p className="text-sm text-muted-foreground">
                  Aponte a câmera do seu celular para o QR Code
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-primary bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Passo 2</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione e envie suas fotos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Escaneie para Começar</h2>
          <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-primary">
            {qrCodeUrl && (
              <QRCode
                value={qrCodeUrl}
                size={256}
                level="H"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Sessão ID: <span className="font-mono text-foreground">{sessionId}</span>
          </p>
        </div>

        {/* Status */}
        <div className="w-full max-w-md">
          <div className="p-4 bg-muted rounded-lg border border-border text-center">
            {photosReceived > 0 ? (
              <div>
                <p className="text-lg font-semibold text-green-600">
                  ✓ {photosReceived} foto{photosReceived !== 1 ? "s" : ""} recebida{photosReceived !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecionando em breve...
                </p>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground font-medium">Aguardando Fotos...</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tempo restante: {inactivityTimer}s
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Link de Ajuda */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda?{" "}
            <button className="text-primary hover:underline font-semibold">
              Clique aqui
            </button>
          </p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="absolute bottom-6 text-center text-xs text-muted-foreground">
        <p>© 2024 Amor por Fotos</p>
      </div>
    </div>
  );
}
