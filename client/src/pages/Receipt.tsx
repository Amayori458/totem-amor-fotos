import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

interface ReceiptData {
  orderNumber: string;
  photoCount: number;
  photos: Array<{
    format: "10x15" | "15x21";
    price: number;
  }>;
  totalPrice: number;
  timestamp: string;
}

// Preços configuráveis (em reais)
const PRICES = {
  "10x15": 5.90,
  "15x21": 8.90,
};

export default function Receipt() {
  const [, params] = useRoute("/receipt/:orderNumber");
  const [, setLocation] = useLocation();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [countdown, setCountdown] = useState(30);

  const orderNumber = params?.orderNumber || "";

  useEffect(() => {
    // Simular dados do recibo (em produção, viria do backend)
    const mockReceipt: ReceiptData = {
      orderNumber,
      photoCount: 3,
      photos: [
        { format: "10x15", price: PRICES["10x15"] },
        { format: "10x15", price: PRICES["10x15"] },
        { format: "15x21", price: PRICES["15x21"] },
      ],
      totalPrice: PRICES["10x15"] * 2 + PRICES["15x21"],
      timestamp: new Date().toLocaleString("pt-BR"),
    };
    setReceiptData(mockReceipt);
  }, [orderNumber]);

  // Countdown para retornar à tela inicial
  useEffect(() => {
    if (countdown <= 0) {
      setLocation("/welcome");
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, setLocation]);

  const handlePrint = () => {
    window.print();
  };

  if (!receiptData) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const formatCount = {
    "10x15": receiptData.photos.filter((p) => p.format === "10x15").length,
    "15x21": receiptData.photos.filter((p) => p.format === "15x21").length,
  };

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

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <QRCodeSVG value={receiptData.orderNumber} size={120} level="H" includeMargin={false} />
        </div>

        {/* Detalhes das Fotos */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Detalhes do Pedido</h3>

          {formatCount["10x15"] > 0 && (
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-700">
                {formatCount["10x15"]}x Foto 10x15 cm @ R$ {PRICES["10x15"].toFixed(2)}
              </span>
              <span className="font-semibold text-gray-900">
                R$ {(formatCount["10x15"] * PRICES["10x15"]).toFixed(2)}
              </span>
            </div>
          )}

          {formatCount["15x21"] > 0 && (
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-700">
                {formatCount["15x21"]}x Foto 15x21 cm @ R$ {PRICES["15x21"].toFixed(2)}
              </span>
              <span className="font-semibold text-gray-900">
                R$ {(formatCount["15x21"] * PRICES["15x21"]).toFixed(2)}
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-center text-sm text-gray-700">
          <p className="font-semibold text-blue-900 mb-1">Próximo Passo:</p>
          <p>Leve este comprovante ao balcão e realize o pagamento.</p>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-[#2beede] hover:bg-[#1a9fb8] text-black font-bold py-3 rounded-lg"
          >
            🖨️ Imprimir
          </Button>
          <Button
            onClick={() => setLocation("/welcome")}
            className="flex-1 bg-[#FF8C69] hover:bg-[#e67a57] text-white font-bold py-3 rounded-lg"
          >
            Voltar
          </Button>
        </div>

        {/* Countdown */}
        <div className="text-center mt-4 text-xs text-gray-500">
          Retornando à tela inicial em {countdown}s...
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
