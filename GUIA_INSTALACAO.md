# Guia de Instalação - Totem Amor por Fotos

## Opção 1: Rodar Localmente (Recomendado para Testes)

### Pré-requisitos
- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)

### Passos
1. **Extrair o projeto**
   ```bash
   unzip totem-amor-fotos.zip
   cd totem-amor-fotos
   ```

2. **Instalar dependências**
   ```bash
   pnpm install
   ```

3. **Iniciar o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

4. **Acessar no navegador**
   - Abrir: `http://localhost:3000`
   - O totem estará disponível em modo desenvolvimento

---

## Opção 2: Rodar em Modo Kiosk (Windows)

### Pré-requisitos
- Windows 10/11
- Node.js 18+ instalado
- Navegador Chrome ou Edge instalado

### Passos
1. **Compilar o projeto**
   ```bash
   cd totem-amor-fotos
   pnpm install
   pnpm build
   ```

2. **Criar script de inicialização (kiosk.bat)**
   ```batch
   @echo off
   cd C:\caminho\para\totem-amor-fotos
   start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --no-first-run --no-default-browser-check http://localhost:3000
   node dist/index.js
   ```

3. **Salvar como `kiosk.bat` na pasta do projeto**

4. **Executar o script**
   - Duplo clique em `kiosk.bat`
   - O Chrome abrirá em modo fullscreen (kiosk)
   - O servidor Node.js rodará em background

5. **Para sair do modo kiosk**
   - Pressione `Alt + F4` ou `Ctrl + Q`

---

## Opção 3: Gerar Executável (Avançado)

Se você quer um executável `.exe` standalone:

1. **Instalar ferramentas necessárias**
   ```bash
   pnpm install -D electron electron-builder
   ```

2. **Compilar**
   ```bash
   pnpm build
   npx electron-builder --win --publish never
   ```

3. **O executável será gerado em**
   ```
   dist-electron/Amor por Fotos - Totem Setup.exe
   ```

---

## Configuração do Totem

### Preços
Os preços estão configurados em `client/src/pages/Receipt.tsx`:
- **10x15 cm**: R$ 5,90
- **15x21 cm**: R$ 8,90

Para alterar, edite o arquivo e recompile.

### Timeout do QR Code
Configurado em `client/src/pages/QRCodeScreen.tsx`:
- **Padrão**: 240 segundos (4 minutos)

Para alterar, edite a linha:
```typescript
const QR_CODE_TIMEOUT = 240; // em segundos
```

### Impressora ASK-400
A integração com a Fujifilm ASK-400 está em:
- `server/ask400Processor.ts` - Processamento de imagens
- `server/ask400PrintDriver.ts` - Driver de impressão

---

## Troubleshooting

### Porta 3000 já em uso
```bash
# Mudar para outra porta
PORT=3001 pnpm dev
```

### Erro de banco de dados
Certifique-se que a variável `DATABASE_URL` está configurada:
```bash
export DATABASE_URL="mysql://usuario:senha@localhost/totem"
```

### QR Code não funciona
1. Verifique se o servidor está rodando
2. Teste em outro dispositivo na mesma rede
3. Confirme que a URL está correta no QR Code

---

## Suporte

Para mais informações, consulte:
- `ELECTRON_BUILD.md` - Detalhes sobre build com Electron
- `ELECTRON_SETUP.md` - Configuração avançada do Electron
- `README.md` - Documentação técnica do projeto
