import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, RefreshCw, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-2">Gerenciamento do Totem Amor por Fotos</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/admin/settings")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configurações
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

        {/* Welcome Message */}
        <Card className="mb-8 bg-gradient-to-r from-[#2beede]/10 to-[#FF8C69]/10 border-[#2beede]/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo ao Painel Administrativo</h2>
            <p className="text-muted-foreground">
              Use o menu de configurações para gerenciar impressoras, preços e outras opções do totem.
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/admin/settings")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#2beede]" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Gerenciar impressoras, preços das fotos e outras configurações do totem.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#FF8C69]" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                O sistema está funcionando normalmente. Todas as impressoras estão online.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-green-600" />
                Retornar ao Totem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Volte para a tela principal do totem para começar a revelar fotos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>Amor por Fotos © 2026 - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
