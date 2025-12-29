# Setup Electron para Totem Amor por Fotos

## Instalação de Dependências

```bash
# Instalar Electron e dependências
pnpm add -D electron electron-builder electron-is-dev

# Instalar tipos TypeScript
pnpm add -D @types/electron
```

## Configuração do Package.json

Adicione os seguintes scripts ao `package.json`:

```json
{
  "scripts": {
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron-build": "npm run build && electron-builder",
    "electron-build-win": "npm run build && electron-builder --win",
    "electron-build-linux": "npm run build && electron-builder --linux",
    "electron-build-mac": "npm run build && electron-builder --mac"
  },
  "main": "dist/electron-main.js",
  "homepage": "./",
  "devDependencies": {
    "concurrently": "^8.0.0",
    "wait-on": "^7.0.0"
  }
}
```

## Estrutura de Arquivos

```
totem-amor-fotos/
├── electron-main.ts          # Arquivo principal do Electron
├── electron-builder.json     # Configuração de build
├── preload.ts               # Preload script (segurança)
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   └── ...
│   └── index.html
└── dist/                    # Build output
    ├── electron-main.js
    ├── preload.js
    └── ...
```

## Modo Kiosk - Características

✅ **Tela Cheia:** Sem barra de título, sem barra de endereço
✅ **Sem Escape:** Usuário não consegue sair do fullscreen
✅ **Atalhos de Manutenção:**
   - `Ctrl+Q` → Sair
   - `F5` → Recarregar
   - `F12` → DevTools (apenas em desenvolvimento)

✅ **Inicialização Automática:** Configure no Windows:
   - Copie o executável para `C:\Users\[User]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
   - Ou use Group Policy para iniciar na tela de login

## Build para Windows

### Opção 1: NSIS Installer (Recomendado)

```bash
# Build com NSIS (cria instalador .exe)
pnpm electron-build-win

# Resultado: dist/Amor por Fotos - Totem Setup 1.0.0.exe
```

### Opção 2: Portable Executable

Edite `electron-builder.json`:
```json
{
  "win": {
    "target": ["portable"]
  }
}
```

```bash
pnpm electron-build-win
# Resultado: dist/Amor por Fotos - Totem 1.0.0.exe
```

## Instalação no Totem (Windows)

1. **Executar instalador:**
   ```
   Amor por Fotos - Totem Setup 1.0.0.exe
   ```

2. **Configurar inicialização automática:**
   - Copie o atalho para Startup:
   ```
   C:\Users\[User]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
   ```

3. **Testar:**
   - Reinicie o PC
   - O totem deve abrir automaticamente em modo fullscreen

## Desenvolvimento Local

```bash
# Terminal 1: Inicia servidor Node.js
pnpm dev

# Terminal 2: Inicia Electron
pnpm electron-dev
```

## Configurações de Segurança

O arquivo `preload.ts` expõe apenas APIs seguras:

```typescript
import { contextBridge, ipcMain } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Adicione apenas APIs necessárias aqui
  getVersion: () => process.env.npm_package_version,
});
```

## Troubleshooting

### Problema: "Electron não encontrado"
```bash
pnpm install
pnpm add -D electron
```

### Problema: Porta 3000 já em uso
```bash
# Mude a porta no vite.config.ts
export default {
  server: {
    port: 3001,
  }
}
```

### Problema: Build muito lento
```bash
# Aumente o timeout
pnpm electron-build --publish never
```

## Próximas Etapas

1. ✅ Testar modo Kiosk localmente
2. ✅ Gerar executável para Windows
3. ✅ Testar instalação em PC de produção
4. ✅ Configurar inicialização automática
5. ✅ Documentar procedimento de manutenção

## Referências

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Kiosk Mode](https://www.electronjs.org/docs/latest/api/browser-window#kiosk)
