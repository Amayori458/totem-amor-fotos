import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PhotoCropPreviewProps {
  photoUrl: string;
  photoName: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: "10x15" | "15x21") => void;
}

// Proporções dos formatos (altura/largura)
const ASPECT_RATIOS = {
  "10x15": 10 / 15, // 0.667 (vertical)
  "15x21": 15 / 21, // 0.714 (vertical)
};

export default function PhotoCropPreview({
  photoUrl,
  photoName,
  isOpen,
  onClose,
  onSelectFormat,
}: PhotoCropPreviewProps) {
  const [selectedFormat, setSelectedFormat] = useState<"10x15" | "15x21">("10x15");

  const handleSelectFormat = (format: "10x15" | "15x21") => {
    setSelectedFormat(format);
    onSelectFormat(format);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pré-visualização de Corte</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Foto com crop overlay */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600">{photoName}</p>

            {/* Container com proporção fixa */}
            <div className="relative w-full max-w-sm bg-black rounded-lg overflow-hidden">
              <div
                className="relative w-full"
                style={{
                  aspectRatio: `1 / ${ASPECT_RATIOS[selectedFormat]}`,
                }}
              >
                {/* Imagem de fundo */}
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay de corte */}
                <div className="absolute inset-0 border-4 border-yellow-400 shadow-lg" />

                {/* Áreas que serão cortadas (semi-transparente) */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Topo */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-black/40" />
                  {/* Fundo */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/40" />
                </div>
              </div>
            </div>

            {/* Informações do formato */}
            <div className="text-center text-sm">
              <p className="font-semibold text-gray-800">
                {selectedFormat === "10x15" ? "10 × 15 cm" : "15 × 21 cm"}
              </p>
              <p className="text-gray-600">
                Proporção: {selectedFormat === "10x15" ? "2:3" : "5:7"}
              </p>
            </div>
          </div>

          {/* Seletor de formato */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Escolha o Formato:</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Opção 10x15 */}
              <button
                onClick={() => setSelectedFormat("10x15")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedFormat === "10x15"
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-primary/50"
                }`}
              >
                <div className="font-semibold text-gray-800">10 × 15 cm</div>
                <div className="text-xs text-gray-600">R$ 0,75</div>
                <div className="text-xs text-gray-500 mt-1">Proporção 2:3</div>
              </button>

              {/* Opção 15x21 */}
              <button
                onClick={() => setSelectedFormat("15x21")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedFormat === "15x21"
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-primary/50"
                }`}
              >
                <div className="font-semibold text-gray-800">15 × 21 cm</div>
                <div className="text-xs text-gray-600">R$ 2,20</div>
                <div className="text-xs text-gray-500 mt-1">Proporção 5:7</div>
              </button>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleSelectFormat(selectedFormat)}
              className="flex-1 h-12 rounded-full bg-accent hover:bg-accent/90 text-white font-bold"
            >
              Confirmar {selectedFormat === "10x15" ? "10×15" : "15×21"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
