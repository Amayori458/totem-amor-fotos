# Guia de Compilação do Executável Windows - Totem Amor por Fotos

## 📋 Pré-requisitos

Você precisa de uma máquina Windows com:
- **Node.js 18+** instalado ([https://nodejs.org](https://nodejs.org))
- **pnpm** instalado (`npm install -g pnpm`)
- **Git** instalado (para clonar o repositório)

## 🚀 Passos para Compilar o Executável

### 1. Clonar o Repositório

```bash
git clone <seu-repositorio> totem-amor-fotos
cd totem-amor-fotos
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Recompilar Módulos Nativos para Windows

Como o projeto usa módulos nativos (node-printer, sharp), você precisa recompilá-los para o Windows:

```bash
npx electron-rebuild
```

### 4. Compilar o Projeto

```bash
pnpm build
```

Este comando irá:
- Compilar o frontend React com Vite
- Empacotar o servidor Express com esbuild
- Gerar os arquivos na pasta `dist/`

### 5. Gerar o Executável Windows

```bash
pnpm electron:build
```

Este comando irá:
- Usar o electron-builder para criar o instalador NSIS
- Gerar a pasta `dist-electron/` com:
  - **Amor por Fotos Setup 1.0.0.exe** - Instalador para distribuição
  - **win-unpacked/** - Versão desempacotada para testes rápidos

### 6. Testar o Executável (Opcional)

Você pode testar a versão desempacotada sem instalar:

```bash
.\dist-electron\win-unpacked\Amor por Fotos.exe
```

## 📦 Arquivos Gerados

Após o build bem-sucedido, você terá:

```
dist-electron/
├── Amor por Fotos Setup 1.0.0.exe    ← Instalador para distribuição
├── Amor por Fotos Setup 1.0.0.exe.blockmap
├── builder-effective-config.yaml
└── win-unpacked/
    ├── Amor por Fotos.exe             ← Executável direto
    ├── resources/
    ├── node_modules/
    └── ...
```

## 🔧 Configuração do Totem

### Preços

Os preços estão configurados no banco de dados (tabela `settings`):
- **10x15 cm**: R$ 5,90 (padrão)
- **15x21 cm**: R$ 8,90 (padrão)

Você pode editar via painel administrativo em `/admin` ou diretamente no banco de dados.

### Timeout do QR Code

Configurado em `client/src/pages/QRCodeScreen.tsx`:
- **Padrão**: 240 segundos (4 minutos)

Para alterar, edite a linha:
```typescript
const QR_CODE_TIMEOUT = 240; // em segundos
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL=mysql://usuario:senha@localhost/totem_db
NODE_ENV=production
PORT=3000
```

## 🖥️ Modo Kiosk

O executável abre automaticamente em **modo fullscreen** (sem barra de título, sem barra de endereço).

### Atalhos de Manutenção

- **Ctrl+Q**: Sair do aplicativo
- **F5**: Recarregar a página
- **F12**: Abrir DevTools (apenas em desenvolvimento)
- **Alt+F4**: Fechar a janela

## 🎨 Customizações

### Alterar Logo/Marca

Substitua o arquivo `public/logo.svg` com sua logo em SVG.

### Alterar Cores

As cores da marca estão em `client/src/index.css`:
- Turquesa: `#2beede`
- Coral: `#FF8C69`
- Escuro: `#102220`

### Alterar Textos

Os textos estão em português em cada página:
- `client/src/pages/Welcome.tsx` - Tela inicial
- `client/src/pages/QRCodeScreen.tsx` - QR Code
- `client/src/pages/PhotoSelection.tsx` - Seleção de fotos
- `client/src/pages/FormatSelection.tsx` - Escolha de formato
- `client/src/pages/Receipt.tsx` - Comprovante

## 📝 Troubleshooting

### Erro: "wine is required"

Este erro ocorre quando você tenta compilar no Linux. O electron-builder precisa do Windows ou de wine para compilar para Windows. **Use uma máquina Windows** para compilar o .exe final.

### Erro: "Cannot find module 'electron'"

Execute `pnpm install` novamente para garantir que todas as dependências estão instaladas.

### Erro: "ENOENT: no such file or directory"

Limpe o cache e reinstale:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
npx electron-rebuild
```

### Porta 3000 já em uso

Se a porta 3000 estiver em uso, altere no `main.js`:
```javascript
env: {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '3001'  // Altere para outra porta
}
```

## 🚀 Distribuição

1. Copie o arquivo **Amor por Fotos Setup 1.0.0.exe** para o totem
2. Execute o instalador
3. O aplicativo será instalado em `C:\Program Files\Amor por Fotos\`
4. Um atalho será criado no Desktop

## 📞 Suporte

Para mais informações sobre Electron e electron-builder:
- [Documentação Electron](https://www.electronjs.org/docs)
- [Documentação electron-builder](https://www.electron.build/)

---

**Versão**: 1.0.0  
**Data**: Janeiro 2026  
**Compatibilidade**: Windows 10/11
