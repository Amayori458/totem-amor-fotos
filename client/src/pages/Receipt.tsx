import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

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

export default function Receipt() {
  const [, params] = useRoute("/receipt/:orderNumber");
  const [, setLocation] = useLocation();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isPrinting, setIsPrinting] = useState(false);

  const orderNumber = params?.orderNumber || "";

  // Busca dados reais do pedido do backend
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Aqui você buscaria os dados reais do backend
        // Por enquanto, vamos usar dados simulados que viriam do backend
        const mockReceipt: ReceiptData = {
          orderNumber,
          format10x15: 2,
          format15x21: 1,
          totalPrice: (2 * PRICES["10x15"]) + (1 * PRICES["15x21"]),
          timestamp: new Date().toLocaleString("pt-BR"),
        };
        setReceiptData(mockReceipt);
      } catch (error) {
        console.error("Erro ao buscar dados do pedido:", error);
      }
    };

    if (orderNumber) {
      fetchOrderData();
    }
  }, [orderNumber]);

  // Imprime automaticamente quando os dados estão prontos
  useEffect(() => {
    if (receiptData && !isPrinting) {
      setIsPrinting(true);
      // Aguarda um pouco para garantir que o DOM está renderizado
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [receiptData, isPrinting]);

  // Countdown para retornar à tela inicial
  useEffect(() => {
    if (countdown <= 0) {
      setLocation("/welcome");
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, setLocation]);

  if (!receiptData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#e8f4f8] to-[#f0fafb]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2beede] mx-auto mb-4"></div>
          <p className="text-gray-600">Processando seu pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f4f8] to-[#f0fafb] flex flex-col items-center justify-center p-4">
      {/* Container do Recibo */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full print:shadow-none print:rounded-none print:p-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#2beede]">
            Amor por Fotos
            <span className="text-red-500 ml-2">❤️</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">Suas memórias, reveladas com amor</p>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

        {/* Número do Pedido */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm">Número do Pedido</p>
          <p className="text-2xl font-bold text-[#FF8C69]">{receiptData.orderNumber}</p>
        </div>

        {/* Detalhes das Fotos */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Detalhes do Pedido</h3>

          {receiptData.format10x15 > 0 && (
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-700">
                {receiptData.format10x15}x Foto 10×15 cm @ R$ {PRICES["10x15"].toFixed(2)}
              </span>
              <span className="font-semibold text-gray-900">
                R$ {(receiptData.format10x15 * PRICES["10x15"]).toFixed(2)}
              </span>
            </div>
          )}

          {receiptData.format15x21 > 0 && (
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-700">
                {receiptData.format15x21}x Foto 15×21 cm @ R$ {PRICES["15x21"].toFixed(2)}
              </span>
              <span className="font-semibold text-gray-900">
                R$ {(receiptData.format15x21 * PRICES["15x21"]).toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-gray-300 my-3"></div>

          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-800">Total:</span>
            <span className="text-[#FF8C69]">R$ {receiptData.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Data e Hora */}
        <div className="text-center text-xs text-gray-500 mb-6">
          <p>{receiptData.timestamp}</p>
        </div>

        {/* Instruções */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center text-sm text-gray-700">
          <p className="font-semibold text-green-900 mb-1">✓ Comprovante Impresso</p>
          <p>Suas fotos estão sendo preparadas. Retire-as no balcão.</p>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

        {/* Mensagem de Retorno */}
        <div className="text-center">
          <p className="text-gray-600 font-semibold mb-2">Retornando à tela inicial em {countdown}s...</p>
          <p className="text-xs text-gray-500">Obrigado por usar Amor por Fotos!</p>
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
          .print\\:shadow-none {
            box-shadow: none;
          }
          .print\\:rounded-none {
            border-radius: 0;
          }
          .print\\:p-4 {
            padding: 1rem;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
