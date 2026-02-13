import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

interface PhotoItem {
  fileKey: string;
  fileName: string;
  format: "10x15" | "15x21";
  fileUrl?: string;
}

export default function PrintPage() {
  const [, params] = useRoute("/print/:orderNumber");
  const orderNumber = params?.orderNumber || "";

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca dados do pedido
  const { data: orderData, error: queryError } = trpc.totem.getOrder.useQuery(
    { orderNumber },
    { enabled: !!orderNumber }
  );

  useEffect(() => {
    if (queryError) {
      setError(`Erro ao carregar pedido: ${queryError.message}`);
      setIsLoading(false);
      return;
    }

    if (orderData) {
      try {
        const photosData = (orderData.metadata?.photos || []) as PhotoItem[];
        setPhotos(photosData);

        // Prepara dados do comprovante
        const format10x15 = photosData.filter((p: any) => p.format === "10x15").length;
        const format15x21 = photosData.filter((p: any) => p.format === "15x21").length;
        const totalPrice = (format10x15 * 0.75) + (format15x21 * 2.20);

        setReceiptData({
          orderNumber: orderData.orderNumber,
          format10x15,
          format15x21,
          totalPrice,
          timestamp: new Date().toLocaleString("pt-BR"),
        });

        setIsLoading(false);

        // Auto-print ao carregar
        setTimeout(() => {
          window.print();
        }, 1000);
      } catch (error) {
        console.error("Erro ao processar dados:", error);
        setError(`Erro ao processar dados: ${error}`);
        setIsLoading(false);
      }
    }
  }, [orderData, queryError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2beede] mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando para impressão...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      {/* Fotos para Impressão */}
      <div className="page-break">
        <h1 className="text-3xl font-bold text-[#2beede] mb-6">Suas Fotos</h1>
        <div className="grid grid-cols-2 gap-8 mb-8">
          {photos.map((photo, index) => (
            <div key={index} className="border-2 border-gray-300 p-4 break-inside-avoid">
              <div className="bg-gray-100 aspect-square flex items-center justify-center mb-3">
                <div className="text-center text-gray-500">
                  <p className="font-semibold">{photo.fileName}</p>
                  <p className="text-sm">Formato: {photo.format}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {photo.format === "10x15" ? "10 × 15 cm" : "15 × 21 cm"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Comprovante para Impressão */}
      <div className="page-break mt-12 pt-12 border-t-4 border-dashed border-gray-300">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#2beede]">Amor por Fotos ❤️</h1>
            <p className="text-gray-500 text-sm mt-2">Suas memórias, reveladas com amor</p>
          </div>

          {/* Divisor */}
          <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

          {/* Número do Pedido */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">Número do Pedido</p>
            <p className="text-2xl font-bold text-[#FF8C69]">{receiptData?.orderNumber}</p>
          </div>

          {/* Detalhes do Pedido */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Detalhes do Pedido</h3>

            {receiptData?.format10x15 > 0 && (
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-700">
                  {receiptData.format10x15}x Foto 10×15 cm @ R$ 0.75
                </span>
                <span className="font-semibold text-gray-900">
                  R$ {(receiptData.format10x15 * 0.75).toFixed(2)}
                </span>
              </div>
            )}

            {receiptData?.format15x21 > 0 && (
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-700">
                  {receiptData.format15x21}x Foto 15×21 cm @ R$ 2.20
                </span>
                <span className="font-semibold text-gray-900">
                  R$ {(receiptData.format15x21 * 2.20).toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t border-gray-300 my-3"></div>

            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-800">Total:</span>
              <span className="text-[#FF8C69]">R$ {receiptData?.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Data e Hora */}
          <div className="text-center text-xs text-gray-500 mb-6">
            <p>{receiptData?.timestamp}</p>
          </div>

          {/* Instruções */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center text-sm text-gray-700">
            <p className="font-semibold text-green-900 mb-1">✓ Comprovante</p>
            <p>Guarde este comprovante para sua segurança.</p>
          </div>

          {/* Divisor */}
          <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

          {/* Rodapé */}
          <div className="text-center">
            <p className="text-gray-600 font-semibold text-sm">Obrigado por usar Amor por Fotos!</p>
          </div>
        </div>
      </div>

      {/* Estilos de Impressão */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .page-break {
            page-break-after: always;
            page-break-inside: avoid;
          }
          
          .break-inside-avoid {
            break-inside: avoid;
          }
          
          button {
            display: none;
          }
          
          nav {
            display: none;
          }
        }
        
        @media screen {
          .page-break {
            border-bottom: 2px dashed #ccc;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
