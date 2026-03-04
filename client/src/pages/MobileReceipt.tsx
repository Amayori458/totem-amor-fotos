import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart } from "lucide-react";

interface ReceiptData {
  orderNumber: string;
  format10x15: number;
  format15x21: number;
  totalPrice: number;
  timestamp: string;
}

// Preços configuráveis (em reais)
const PRICES = {
  "10x15": 0.75,
  "15x21": 2.20,
};

export default function MobileReceipt() {
  const [, params] = useRoute("/mobile-receipt/:orderNumber");
  const [, setLocation] = useLocation();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderNumber = params?.orderNumber || "";

  // Busca dados reais do pedido do backend
  const { data: orderData, isLoading, error: queryError } = trpc.totem.getOrder.useQuery(
    { orderNumber },
    { enabled: !!orderNumber }
  );

  useEffect(() => {
    if (queryError) {
      setError(`Erro ao carregar pedido: ${queryError.message}`);
      return;
    }

    if (!isLoading && orderData) {
      try {
        const result = orderData;
        
        if (!result) {
          setError(`Pedido ${orderNumber} não encontrado`);
          return;
        }

        // Extrai dados das fotos do metadata
        const photos = result.metadata?.photos || [];
        const format10x15 = photos.filter((p: any) => p.format === "10x15").length;
        const format15x21 = photos.filter((p: any) => p.format === "15x21").length;
        const totalPrice = (format10x15 * PRICES["10x15"]) + (format15x21 * PRICES["15x21"]);

        const receipt: ReceiptData = {
          orderNumber: result.orderNumber,
          format10x15,
          format15x21,
          totalPrice,
          timestamp: new Date().toLocaleString("pt-BR"),
        };

        setReceiptData(receipt);
      } catch (error) {
        console.error("Erro ao processar dados do pedido:", error);
        setError(`Erro ao processar pedido: ${error}`);
      }
    }
  }, [orderData, isLoading, queryError]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e8f4f8] to-[#f0fafb] p-4">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-bold mb-4 text-lg">{error}</p>
          <button
            onClick={() => setLocation("/welcome")}
            className="px-6 py-3 bg-[#2beede] text-black font-bold rounded-lg"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e8f4f8] to-[#f0fafb]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2beede] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando comprovante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f4f8] to-[#f0fafb] flex flex-col items-center justify-center p-4">
      {/* Container do Recibo */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <h1 className="text-2xl font-bold text-[#2beede]">Amor por Fotos</h1>
            <Heart className="text-2xl ml-2 fill-accent text-accent" />
          </div>
          <p className="text-gray-500 text-xs mt-2">Suas memórias, reveladas com amor</p>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Número do Pedido */}
        <div className="text-center mb-4">
          <p className="text-gray-600 text-xs">Número do Pedido</p>
          <p className="text-xl font-bold text-[#FF8C69] break-all">{receiptData.orderNumber}</p>
        </div>

        {/* Detalhes das Fotos */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Detalhes do Pedido</h3>

          {receiptData.format10x15 > 0 && (
            <div className="flex justify-between mb-2 text-xs">
              <span className="text-gray-700">
                {receiptData.format10x15}x Foto 10×15 cm @ R$ {PRICES["10x15"].toFixed(2)}
              </span>
              <span className="font-semibold text-gray-900">
                R$ {(receiptData.format10x15 * PRICES["10x15"]).toFixed(2)}
              </span>
            </div>
          )}

          {receiptData.format15x21 > 0 && (
            <div className="flex justify-between mb-2 text-xs">
              <span className="text-gray-700">
                {receiptData.format15x21}x Foto 15×21 cm @ R$ {PRICES["15x21"].toFixed(2)}
              </span>
              <span className="font-semibold text-gray-900">
                R$ {(receiptData.format15x21 * PRICES["15x21"]).toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-gray-300 my-2"></div>

          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-800">Total:</span>
            <span className="text-[#FF8C69]">R$ {receiptData.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Data e Hora */}
        <div className="text-center text-xs text-gray-500 mb-4">
          <p>{receiptData.timestamp}</p>
        </div>

        {/* Instruções */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center text-xs text-gray-700">
          <p className="font-semibold text-green-900 mb-1">✓ Pedido Confirmado</p>
          <p>Suas fotos estão sendo impressas. Retire-as no balcão em breve.</p>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Mensagem de Retorno */}
        <div className="text-center">
          <p className="text-gray-600 font-semibold mb-2 text-sm">Obrigado por usar Amor por Fotos!</p>
          <p className="text-xs text-gray-500">Guarde este comprovante como referência.</p>
        </div>
      </div>
    </div>
  );
}
