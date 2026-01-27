#!/bin/bash

# Script para gerar o executável Windows do Totem Amor por Fotos

echo "=== Compilando Frontend (Vite) ==="
pnpm build

echo ""
echo "=== Gerando Executável Windows com electron-builder ==="

# Criar arquivo package.json simplificado para electron-builder
cat > /tmp/electron-builder-config.json << 'EOF'
{
  "appId": "com.amorporfotos.totem",
  "productName": "Amor por Fotos - Totem",
  "directories": {
    "buildResources": "assets",
    "output": "dist-electron"
  },
  "files": [
    "dist",
    "node_modules",
    "electron-main.js",
    "preload.js"
  ],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": false,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Amor por Fotos - Totem"
  }
}
EOF

# Copiar para o projeto
cp /tmp/electron-builder-config.json electron-builder.json

# Gerar executável
npx electron-builder --win --publish never --config electron-builder.json

echo ""
echo "=== Build Concluído! ==="
echo "Executável gerado em: dist-electron/"
ls -lh dist-electron/*.exe 2>/dev/null || echo "Arquivo .exe não encontrado"
