# Configuração Electron - Totem Amor por Fotos

## 📐 Arquitetura

O projeto usa **Electron** para criar um executável Windows que roda o totem em modo fullscreen (kiosk).

```
┌─────────────────────────────────────────────┐
│         Electron Main Process               │
│  (main.js - Gerencia janela e servidor)     │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│  Express     │  │  BrowserWindow
│  Server      │  │  (Frontend)
│  (dist/...)  │  │
└──────────────┘  └──────────────┘
```

## 🔧 Componentes Principais

### 1. **main.js** (Raiz do projeto)

Arquivo principal que gerencia:
- Inicialização do servidor Express
- Criação da janela Electron
- Atalhos de manutenção (Ctrl+Q, F5, F12)
- Proteção contra múltiplas instâncias

**Fluxo:**
1. App inicia → `app.whenReady()`
2. Inicia servidor backend com `fork(dist/index.js)`
3. Aguarda 2 segundos para servidor subir
4. Cria janela BrowserWindow em fullscreen
5. Carrega `http://localhost:3000`

### 2. **package.json**

Configurações importantes:

```json
{
  "main": "main.js",           // Ponto de entrada do Electron
  "scripts": {
    "electron:dev": "pnpm build && electron .",
    "electron:build": "pnpm build && electron-builder --win --publish never"
  },
  "build": {
    "appId": "com.amorporfotos.totem",
    "productName": "Amor por Fotos",
    "win": {
      "target": "nsis"         // Gera instalador NSIS
    },
    "nsis": {
      "oneClick": false,       // Permite escolher pasta de instalação
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

### 3. **dist/** (Gerado pelo build)

Contém:
- `dist/index.js` - Servidor Express compilado
- `dist/public/` - Frontend compilado (HTML, CSS, JS)

### 4. **dist-electron/** (Gerado pelo electron-builder)

Contém:
- `Amor por Fotos Setup 1.0.0.exe` - Instalador NSIS
- `win-unpacked/` - Versão desempacotada

## 🚀 Processo de Build

### Desenvolvimento

```bash
pnpm electron:dev
```

1. Executa `pnpm build` (compila frontend e backend)
2. Executa `electron .` (abre o app em modo desenvolvimento)
3. Você pode usar F12 para abrir DevTools

### Produção

```bash
pnpm electron:build
```

1. Executa `pnpm build`
2. Executa `electron-builder --win --publish never`
3. Gera instalador em `dist-electron/`

## 🔐 Segurança

### Context Isolation

```javascript
webPreferences: {
  nodeIntegration: false,      // Desabilita acesso ao Node.js no renderer
  contextIsolation: true,      // Isola contexto do renderer
  enableRemoteModule: false    // Desabilita módulo remoto
}
```

Isso garante que o código do frontend não possa acessar APIs perigosas do Node.js.

### Atalhos Bloqueados

Em modo fullscreen, os atalhos padrão do Windows são bloqueados:
- Ctrl+Alt+Delete (bloqueado pelo Windows)
- Windows key (bloqueado pelo Windows)
- Alt+Tab (funciona normalmente)

## 📦 Dependências Nativas

O projeto usa módulos nativos que precisam ser compilados para cada plataforma:

- **node-printer** - Acesso à impressora (C++)
- **sharp** - Processamento de imagens (C++)

Esses módulos precisam ser recompilados com:
```bash
npx electron-rebuild
```

## 🔄 Ciclo de Vida

```
┌─────────────────────────────────────────────┐
│  Usuário executa Amor por Fotos.exe         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Electron inicia main.js                    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Fork do servidor Express (dist/index.js)   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Aguarda 2 segundos                         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Cria BrowserWindow em fullscreen           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Carrega http://localhost:3000              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Frontend React renderiza                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Totem pronto para uso                      │
└─────────────────────────────────────────────┘
```

## 🛠️ Troubleshooting

### Servidor não inicia

Se o servidor não subir em 2 segundos, a janela tentará carregar `http://localhost:3000` e falhará.

**Solução:** Aumentar o timeout em `main.js`:
```javascript
setTimeout(createWindow, 5000); // 5 segundos
```

### Janela não abre

Verifique se o servidor Express está rodando:
```bash
node dist/index.js
```

### Múltiplas instâncias

O código em `main.js` impede múltiplas instâncias:
```javascript
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();
```

## 📝 Modificações Comuns

### Alterar Tamanho da Janela

Em `main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1920,   // Altere aqui
  height: 1080,  // Altere aqui
  fullscreen: true
});
```

### Alterar Porta do Servidor

Em `main.js`:
```javascript
env: {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '3001'  // Altere aqui
}
```

### Desabilitar Fullscreen

Em `main.js`:
```javascript
mainWindow = new BrowserWindow({
  fullscreen: false  // Altere aqui
});
```

## 🔗 Referências

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [NSIS Installer](https://nsis.sourceforge.io/)

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2026
