import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PhotoCropPreview from "@/components/PhotoCropPreview";

interface PhotoWithFormat {
  id: number;
  fileKey: string;
  fileName: string;
  fileUrl: string;
  selected: number;
  format: "10x15" | "15x21";
}

export default function PhotoSelection() {
  const [, params] = useRoute("/select/:sessionId");
  const [, setLocation] = useLocation();
  const sessionId = params?.sessionId || "";

  const { data: photos, isLoading } = trpc.totem.getPhotos.useQuery({ sessionId });
  const updateSelection = trpc.totem.updatePhotoSelection.useMutation();
  const createOrder = trpc.totem.createOrder.useMutation();

  const [selectedPhotos, setSelectedPhotos] = useState<Map<number, PhotoWithFormat>>(new Map());
  const [processing, setProcessing] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const toggleSelection = async (photo: any) => {
    const newSelected = new Map(selectedPhotos);
    const isSelected = newSelected.has(photo.id);

    if (isSelected) {
      newSelected.delete(photo.id);
    } else {
      newSelected.set(photo.id, {
        ...photo,
        format: "10x15", // Default format
      });
    }

    setSelectedPhotos(newSelected);

    await updateSelection.mutateAsync({
      photoId: photo.id,
      selected: isSelected ? 0 : 1,
      format: isSelected ? "10x15" : "10x15",
    });
  };

  const openPreview = (photo: any) => {
    setPreviewPhoto(photo);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewPhoto(null);
  };

  const updatePhotoFormat = async (photoId: number, format: "10x15" | "15x21") => {
    const newSelected = new Map(selectedPhotos);
    const photo = newSelected.get(photoId);
    if (photo) {
      photo.format = format;
      newSelected.set(photoId, photo);
      setSelectedPhotos(newSelected);

      await updateSelection.mutateAsync({
        photoId,
        selected: 1,
        format,
      });
    }
  };

  const selectAll = async () => {
    if (!photos) return;

    const newSelected = new Map<number, PhotoWithFormat>();
    for (const photo of photos) {
      newSelected.set(photo.id, {
        ...photo,
        format: "10x15",
      });

      await updateSelection.mutateAsync({
        photoId: photo.id,
        selected: 1,
        format: "10x15",
      });
    }
    setSelectedPhotos(newSelected);
  };

  const deselectAll = async () => {
    if (!photos) return;

    setSelectedPhotos(new Map());

    for (const photo of photos) {
      await updateSelection.mutateAsync({
        photoId: photo.id,
        selected: 0,
      });
    }
  };

  const handleContinue = async () => {
    if (selectedPhotos.size === 0) return;

    setProcessing(true);

    try {
      const selectedPhotosArray = Array.from(selectedPhotos.values()).map((p) => ({
        photoId: p.id,
        fileKey: p.fileKey,
        fileName: p.fileName,
        format: p.format,
      }));

      const result = await createOrder.mutateAsync({
        sessionId,
        selectedPhotos: selectedPhotosArray,
      });

      setLocation(`/processing/${result.orderNumber}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Erro ao criar pedido. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-gray-600">Carregando Fotos...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col overflow-hidden bg-background">
      <div className="flex h-full grow">
        <main className="flex h-full w-full flex-col pb-32 lg:pb-0">
          <header className="flex shrink-0 items-center justify-between border-b border-solid border-gray-200 px-6 py-4 md:px-8">
            <div className="flex items-center gap-4">
              <div className="size-6 text-primary">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#333333]">
                Amor por Fotos
              </h2>
            </div>
            <button
              onClick={() => setLocation("/qrcode")}
              className="flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/20 text-[#333333] hover:bg-primary/30"
            >
              <ArrowLeft className="text-2xl" />
            </button>
          </header>

          <div className="flex-grow overflow-y-auto px-4 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 py-8">
              <div className="flex flex-col gap-2">
                <p className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#333333]">
                  Selecione suas Fotos
                </p>
                <p className="text-base font-normal leading-normal text-gray-600">
                  Escolha as memórias que você quer revelar e o tamanho de cada uma.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
              {photos?.map((photo) => {
                const isSelected = selectedPhotos.has(photo.id);
                const selectedPhoto = selectedPhotos.get(photo.id);
                const format = selectedPhoto?.format || "10x15";

                return (
                  <div
                    key={photo.id}
                    className="group relative flex flex-col"
                  >
                    <div
                      className={`relative cursor-pointer rounded-lg border-3 overflow-hidden transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-gray-300 hover:border-primary/50"
                      }`}
                      onClick={() => toggleSelection(photo)}
                    >
                      <div
                        className="w-full aspect-square bg-center bg-no-repeat bg-cover"
                        style={{ backgroundImage: `url("${photo.fileUrl}")` }}
                      ></div>
                      <div className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
                        {isSelected ? (
                          <CheckCircle2 className="text-primary" size={20} strokeWidth={3} />
                        ) : (
                          <Circle className="text-gray-400" size={20} />
                        )}
                      </div>

                      {/* Botão de pré-visualização */}
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(photo);
                          }}
                          className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all"
                          title="Pré-visualizar corte"
                        >
                          <Eye className="text-primary" size={16} />
                        </button>
                      )}
                    </div>

                    {isSelected && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => updatePhotoFormat(photo.id, "10x15")}
                          className={`flex-1 py-1 px-2 text-xs rounded font-semibold transition-all ${
                            format === "10x15"
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          10×15
                        </button>
                        <button
                          onClick={() => updatePhotoFormat(photo.id, "15x21")}
                          className={`flex-1 py-1 px-2 text-xs rounded font-semibold transition-all ${
                            format === "15x21"
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          15×21
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center py-10">
              <p className="text-lg font-bold text-gray-600">
                {selectedPhotos.size} {selectedPhotos.size !== 1 ? 'fotos' : 'foto'} {selectedPhotos.size !== 1 ? 'selecionadas' : 'selecionada'}
              </p>
            </div>
          </div>
        </main>

        <aside className="hidden lg:flex w-80 shrink-0 flex-col border-l border-solid border-gray-200 bg-white">
          <div className="flex flex-col p-6 gap-6">
            <h3 className="text-lg font-bold text-[#333333]">Ferramentas de Seleção</h3>
            <Button
              onClick={selectAll}
              className="w-full h-14 rounded-full bg-primary/20 hover:bg-primary/30 text-[#333333] font-bold"
            >
              Selecionar Todas
            </Button>
            <Button
              onClick={deselectAll}
              className="w-full h-14 rounded-full bg-primary/20 hover:bg-primary/30 text-[#333333] font-bold"
            >
              Remover Todas
            </Button>
            <div className="mt-auto">
              <p className="text-center text-2xl font-bold mb-4 text-[#333333]">
                {selectedPhotos.size}
              </p>
              <p className="text-center text-sm text-gray-500 mb-6">foto${selectedPhotos.size !== 1 ? 's' : ''} selecionada${selectedPhotos.size !== 1 ? 's' : ''}</p>
              <Button
                onClick={handleContinue}
                disabled={selectedPhotos.size === 0 || processing}
                className="w-full h-14 rounded-full bg-accent hover:bg-accent/90 text-white font-bold disabled:bg-gray-300 disabled:text-gray-500"
              >
                {processing ? "Processando..." : "Continuar →"}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2 mb-3">
          <Button
            onClick={selectAll}
            className="flex-1 h-12 rounded-full bg-primary/20 hover:bg-primary/30 text-[#333333] font-bold text-sm"
          >
            Selecionar Todas
          </Button>
          <Button
            onClick={deselectAll}
            className="flex-1 h-12 rounded-full bg-primary/20 hover:bg-primary/30 text-[#333333] font-bold text-sm"
          >
            Remover Todas
          </Button>
        </div>
        <Button
          onClick={handleContinue}
          disabled={selectedPhotos.size === 0 || processing}
          className="w-full h-14 rounded-full bg-accent hover:bg-accent/90 text-white font-bold disabled:bg-gray-300 disabled:text-gray-500"
        >
          {processing ? "Processando..." : `Continuar (${selectedPhotos.size}) →`}
        </Button>
      </div>

      {/* Modal de pré-visualização */}
      {previewPhoto && (
        <PhotoCropPreview
          photoUrl={previewPhoto.fileUrl}
          photoName={previewPhoto.fileName}
          isOpen={showPreview}
          onClose={closePreview}
          onSelectFormat={(format) => {
            updatePhotoFormat(previewPhoto.id, format);
          }}
        />
      )}
    </div>
  );
}
