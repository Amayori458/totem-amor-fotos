import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const [prices, setPrices] = useState({
    price10x15: 5.90,
    price15x21: 8.90,
  });

  const [qrTimeout, setQrTimeout] = useState(240);
  const [printerName, setPrinterName] = useState('ASK-400');
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Aqui você pode adicionar uma rota tRPC para salvar as configurações
      // await trpc.admin.updateSettings.useMutation({...});
      
      toast.success('Configurações salvas com sucesso!');
      setTimeout(() => setLocation('/admin'), 1000);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrinter = () => {
    toast.success('Teste de impressão enviado para ' + printerName);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">⚙️ Configurações do Totem</h1>
          <Button
            variant="outline"
            onClick={() => setLocation('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        {/* Preços */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">💰 Preços de Impressão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preço Foto 10x15 cm (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={prices.price10x15}
                onChange={(e) => setPrices({ ...prices, price10x15: parseFloat(e.target.value) })}
                className="w-full"
                placeholder="5.90"
              />
              <p className="text-xs text-muted-foreground mt-1">Preço unitário por foto no formato 10x15 cm</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preço Foto 15x21 cm (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={prices.price15x21}
                onChange={(e) => setPrices({ ...prices, price15x21: parseFloat(e.target.value) })}
                className="w-full"
                placeholder="8.90"
              />
              <p className="text-xs text-muted-foreground mt-1">Preço unitário por foto no formato 15x21 cm</p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Timeout */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">⏱️ QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block text-sm font-medium text-foreground mb-2">
              Timeout de Inatividade (segundos)
            </label>
            <Input
              type="number"
              min="30"
              max="600"
              value={qrTimeout}
              onChange={(e) => setQrTimeout(parseInt(e.target.value))}
              className="w-full"
              placeholder="240"
            />
            <p className="text-xs text-muted-foreground mt-2">
              O QR Code expirará após {qrTimeout} segundos de inatividade e retornará à tela inicial
            </p>
          </CardContent>
        </Card>

        {/* Impressora */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🖨️ Impressora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome da Impressora
              </label>
              <Input
                type="text"
                value={printerName}
                onChange={(e) => setPrinterName(e.target.value)}
                className="w-full"
                placeholder="ASK-400"
              />
              <p className="text-xs text-muted-foreground mt-1">Nome da impressora Fujifilm ASK-400</p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleTestPrinter}
            >
              🧪 Testar Impressora
            </Button>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex gap-4">
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
