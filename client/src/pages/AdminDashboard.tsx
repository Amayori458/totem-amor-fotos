import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, RefreshCw, Printer, AlertCircle } from "lucide-react";

interface OrderData {
  orderNumber: string;
  sessionId: string;
  createdAt: string;
  status: "pending" | "processing" | "printed" | "failed";
  totalPhotos: number;
  printedPhotos: number;
  failedPhotos: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalPhotos: 0,
    successfulPrints: 0,
    failedPrints: 0,
    todayRevenue: 0,
  });

  // Simula dados de pedidos (será substituído por chamada tRPC real)
  useEffect(() => {
    // Dados de exemplo
    const mockOrders: OrderData[] = [
      {
        orderNumber: "ORD-001",
        sessionId: "sess-001",
        createdAt: new Date().toISOString(),
        status: "printed",
        totalPhotos: 5,
        printedPhotos: 5,
        failedPhotos: 0,
      },
      {
        orderNumber: "ORD-002",
        sessionId: "sess-002",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: "printed",
        totalPhotos: 3,
        printedPhotos: 3,
        failedPhotos: 0,
      },
      {
        orderNumber: "ORD-003",
        sessionId: "sess-003",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        status: "pending",
        totalPhotos: 2,
        printedPhotos: 0,
        failedPhotos: 0,
      },
      {
        orderNumber: "ORD-004",
        sessionId: "sess-004",
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        status: "failed",
        totalPhotos: 4,
        printedPhotos: 2,
        failedPhotos: 2,
      },
    ];

    setOrders(mockOrders);

    // Calcula estatísticas
    const totalPhotos = mockOrders.reduce((sum, o) => sum + o.totalPhotos, 0);
    const successfulPrints = mockOrders.reduce((sum, o) => sum + o.printedPhotos, 0);
    const failedPrints = mockOrders.reduce((sum, o) => sum + o.failedPhotos, 0);

    setStats({
      totalOrders: mockOrders.length,
      totalPhotos,
      successfulPrints,
      failedPrints,
      todayRevenue: successfulPrints * 15, // R$ 15 por foto
    });
  }, []);

  const chartData = [
    { name: "Sucesso", value: stats.successfulPrints, fill: "#2beede" },
    { name: "Falha", value: stats.failedPrints, fill: "#FF8C69" },
  ];

  const dailyData = [
    { time: "08:00", orders: 2 },
    { time: "10:00", orders: 5 },
    { time: "12:00", orders: 8 },
    { time: "14:00", orders: 6 },
    { time: "16:00", orders: 4 },
    { time: "18:00", orders: 3 },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-2">Gerenciamento de pedidos e histórico de vendas</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalPhotos}</div>
              <p className="text-xs text-muted-foreground mt-1">Processadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Impressões Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.successfulPrints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalPhotos > 0 ? Math.round((stats.successfulPrints / stats.totalPhotos) * 100) : 0}% taxa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Falhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.failedPrints}</div>
              <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R$ {stats.todayRevenue}</div>
              <p className="text-xs text-muted-foreground mt-1">Estimado</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos por Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#2beede" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Histórico de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Pedido</th>
                    <th className="text-left py-3 px-4 font-semibold">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Fotos</th>
                    <th className="text-center py-3 px-4 font-semibold">Impressas</th>
                    <th className="text-center py-3 px-4 font-semibold">Falhas</th>
                    <th className="text-left py-3 px-4 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderNumber} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-foreground">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "printed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status === "printed"
                            ? "Impresso"
                            : order.status === "failed"
                            ? "Falha"
                            : "Pendente"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{order.totalPhotos}</td>
                      <td className="py-3 px-4 text-center text-green-600 font-semibold">{order.printedPhotos}</td>
                      <td className="py-3 px-4 text-center text-red-600 font-semibold">{order.failedPhotos}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {stats.failedPrints > 0 && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Atenção: {stats.failedPrints} Falhas Detectadas</h3>
                <p className="text-sm text-red-700 mt-1">
                  Verifique a impressora ASK-400 e retente os pedidos com falha.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
