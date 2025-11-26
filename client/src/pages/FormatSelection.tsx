import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

type FormatType = "10x15" | "15x21";

export default function FormatSelection() {
  const [, params] = useRoute("/format/:sessionId");
  const [, setLocation] = useLocation();
  const sessionId = params?.sessionId || "";

  const { data: photos, isLoading } = trpc.totem.getPhotos.useQuery({ sessionId });
  const updateSelection = trpc.totem.updatePhotoSelection.useMutation();
  const createOrder = trpc.totem.createOrder.useMutation();

  const [selectedFormat, setSelectedFormat] = useState<FormatType>("10x15");
  const [processing, setProcessing] = useState(false);

  const selectedPhotos = photos?.filter((p) => p.selected === 1) || [];

  const handleFormatSelect = async (format: FormatType) => {
    setSelectedFormat(format);

    // Update all selected photos with the chosen format
    for (const photo of selectedPhotos) {
      await updateSelection.mutateAsync({
        photoId: photo.id,
        selected: 1,
        format,
      });
    }
  };

  const handleConfirm = async () => {
    if (selectedPhotos.length === 0) return;

    setProcessing(true);

    try {
      const result = await createOrder.mutateAsync({
        sessionId,
        selectedPhotos: selectedPhotos.map((p) => ({
          photoId: p.id,
          fileKey: p.fileKey,
          fileName: p.fileName,
          format: selectedFormat,
        })),
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
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col overflow-hidden bg-background">
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
          onClick={() => setLocation(`/select/${sessionId}`)}
          className="flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/20 text-[#333333] hover:bg-primary/30"
        >
          <ArrowLeft className="text-2xl" />
        </button>
      </header>

      <div className="flex-grow overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#333333]">
              Choose Print Format
            </p>
            <p className="text-base font-normal leading-normal text-gray-600">
              Select the size for your {selectedPhotos.length} photo(s).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div
              onClick={() => handleFormatSelect("10x15")}
              className={`relative cursor-pointer rounded-2xl border-4 p-8 transition-all ${
                selectedFormat === "10x15"
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-gray-200 bg-white hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-full aspect-[3/2] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-500">3:2 ratio</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#333333]">10×15 cm</h3>
                  <p className="text-sm text-gray-600 mt-1">Standard photo size</p>
                </div>
                {selectedFormat === "10x15" && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div
              onClick={() => handleFormatSelect("15x21")}
              className={`relative cursor-pointer rounded-2xl border-4 p-8 transition-all ${
                selectedFormat === "15x21"
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-gray-200 bg-white hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-full aspect-[5/7] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-500">5:7 ratio</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#333333]">15×21 cm</h3>
                  <p className="text-sm text-gray-600 mt-1">Larger photo size</p>
                </div>
                {selectedFormat === "15x21" && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={processing}
              className="w-full max-w-md h-16 rounded-full bg-accent hover:bg-accent/90 text-white text-lg font-bold disabled:bg-gray-300 disabled:text-gray-500"
            >
              {processing ? "Processing..." : "Confirm Print"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
