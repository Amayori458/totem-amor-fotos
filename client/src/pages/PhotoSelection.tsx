import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PhotoSelection() {
  const [, params] = useRoute("/select/:sessionId");
  const [, setLocation] = useLocation();
  const sessionId = params?.sessionId || "";

  const { data: photos, isLoading } = trpc.totem.getPhotos.useQuery({ sessionId });
  const updateSelection = trpc.totem.updatePhotoSelection.useMutation();

  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());

  const toggleSelection = async (photoId: number) => {
    const newSelected = new Set(selectedPhotos);
    const isSelected = newSelected.has(photoId);

    if (isSelected) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }

    setSelectedPhotos(newSelected);

    await updateSelection.mutateAsync({
      photoId,
      selected: isSelected ? 0 : 1,
    });
  };

  const selectAll = async () => {
    if (!photos) return;

    const allPhotoIds = new Set(photos.map((p) => p.id));
    setSelectedPhotos(allPhotoIds);

    for (const photo of photos) {
      await updateSelection.mutateAsync({
        photoId: photo.id,
        selected: 1,
      });
    }
  };

  const deselectAll = async () => {
    if (!photos) return;

    setSelectedPhotos(new Set());

    for (const photo of photos) {
      await updateSelection.mutateAsync({
        photoId: photo.id,
        selected: 0,
      });
    }
  };

  const handleContinue = () => {
    if (selectedPhotos.size > 0) {
      setLocation(`/format/${sessionId}`);
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
                  Escolha as memórias que você quer revelar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4">
              {photos?.map((photo) => {
                const isSelected = selectedPhotos.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className="group relative flex cursor-pointer flex-col"
                    onClick={() => toggleSelection(photo.id)}
                  >
                    <div
                      className={`absolute inset-0 z-10 rounded-lg border-4 transition-all ${
                        isSelected
                          ? "border-primary ring-4 ring-primary/30 opacity-100"
                          : "border-transparent ring-4 ring-transparent opacity-0 group-hover:border-primary/50"
                      }`}
                    ></div>
                    <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                      {isSelected ? (
                        <CheckCircle2 className="text-primary" strokeWidth={3} />
                      ) : (
                        <Circle className="text-gray-400" />
                      )}
                    </div>
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                      style={{ backgroundImage: `url("${photo.fileUrl}")` }}
                    ></div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center py-10">
              <p className="text-lg font-bold text-gray-600">
                {selectedPhotos.size} foto${selectedPhotos.size !== 1 ? 's' : ''} selecionada${selectedPhotos.size !== 1 ? 's' : ''}
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
                disabled={selectedPhotos.size === 0}
                className="w-full h-14 rounded-full bg-accent hover:bg-accent/90 text-white font-bold disabled:bg-gray-300 disabled:text-gray-500"
              >
                Continuar →
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
          disabled={selectedPhotos.size === 0}
          className="w-full h-14 rounded-full bg-accent hover:bg-accent/90 text-white font-bold disabled:bg-gray-300 disabled:text-gray-500"
        >
          Continuar ({selectedPhotos.size}) →
        </Button>
      </div>
    </div>
  );
}
