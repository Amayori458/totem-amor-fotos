import { useEffect, useState } from "react";
import { QrCode, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import QRCode from "react-qr-code";

export default function QRCodeScreen() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>("");
  const [photosReceived, setPhotosReceived] = useState<number>(0);
  const { data: photos } = trpc.totem.getPhotos.useQuery(
    { sessionId },
    { enabled: !!sessionId, refetchInterval: 2000 }
  );

  useEffect(() => {
    if (photos && photos.length > 0) {
      setPhotosReceived(photos.length);
    }
  }, [photos]);
  const [inactivityTimer, setInactivityTimer] = useState<number>(60);

  const createSession = trpc.totem.createSession.useMutation();

  useEffect(() => {
    const initSession = async () => {
      const result = await createSession.mutateAsync();
      setSessionId(result.sessionId);
    };
    initSession();
  }, []);

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

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="layout-container flex h-full max-w-4xl grow flex-col items-center">
        <div className="flex w-full flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
          <h1 className="text-[#333333] text-[32px] font-bold leading-tight tracking-tight sm:text-4xl">
            Revele suas Memórias Favoritas
          </h1>
          <p className="mt-2 text-primary text-base font-normal leading-normal">
            Siga os passos abaixo para enviar suas fotos e eternizar seus momentos.
          </p>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-8 md:flex-row md:items-start">
          <div className="flex w-full max-w-md flex-col gap-4 px-4 md:w-1/2 md:max-w-none md:px-0 md:pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-[#333333]">
                  <QrCode className="h-8 w-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-normal leading-normal text-primary">Passo 1</p>
                  <h2 className="text-base font-bold leading-tight text-[#333333]">
                    Aponte a Câmera do seu Celular
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-[#333333]">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-normal leading-normal text-primary">Passo 2</p>
                  <h2 className="text-base font-bold leading-tight text-[#333333]">
                    Selecione e Envie suas Fotos
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col items-center gap-6 px-4 md:w-1/2 md:max-w-none md:px-0">
            <div className="flex w-full flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm">
              <p className="mb-4 text-center text-lg font-bold text-[#333333]">
                Escaneie para Começar
              </p>
              <div className="aspect-square w-full max-w-[280px] rounded-lg bg-white p-4">
                {uploadUrl ? (
                  <QRCode value={uploadUrl} size={256} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                    <p className="text-gray-500">Gerando Código QR...</p>
                  </div>
                )}
              </div>
              <p className="mt-4 text-center text-sm text-primary">ID da Sessão: {sessionId || "..."}</p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3">
              <Button
                disabled={photosReceived === 0}
                onClick={() => photosReceived > 0 && setLocation(`/select/${sessionId}`)}
                className="h-14 rounded-full bg-primary text-white font-bold hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500"
              >
                {photosReceived === 0
                  ? "Aguardando Fotos..."
                  : `Continuar com ${photosReceived} Foto${photosReceived > 1 ? 's' : ''}`}
              </Button>
              <Button
                variant="ghost"
                className="h-14 rounded-full text-primary font-bold hover:bg-gray-100"
              >
                Precisa de Ajuda?
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Tempo restante: {inactivityTimer}s
            </p>
          </div>
        </div>

        <footer className="w-full py-6 text-center">
          <p className="text-sm text-gray-500">© 2025 Amor por Fotos</p>
        </footer>
      </div>
    </div>
  );
}
