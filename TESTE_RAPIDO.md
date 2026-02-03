# ⚡ Teste Rápido - 5 Minutos

Se você quer validar tudo rapidinho, siga este guia.

## 🎯 Objetivo

Validar que o totem funciona do início ao fim, com impressora comum.

## ✅ Checklist Rápido

### **1. Servidor Rodando? (30 segundos)**

```
Abra: https://3000-i3rmlcelwu19kteefbl6a-cb1ecdbc.us2.manus.computer

Você deve ver:
- Logo "Amor por Fotos ❤️"
- Botão "Toque para Começar"
```

✅ Se sim → Próximo passo
❌ Se não → Servidor offline, reinicie com `pnpm dev`

---

### **2. Impressora Configurada? (1 minuto)**

```
1. Vá para: Configurações > Dispositivos > Impressoras
2. Procure sua impressora
3. Clique nela e defina como "Padrão"
4. Coloque papel na impressora
```

✅ Se sim → Próximo passo
❌ Se não → Configure agora antes de continuar

---

### **3. Teste do Fluxo (3 minutos)**

**Passo 1:** Clique "Toque para Começar"
- ✅ Deve ir para tela do QR Code

**Passo 2:** Clique no QR Code (ou use seu celular para escanear)
- ✅ Deve abrir página de upload

**Passo 3:** Selecione 2-3 fotos do seu computador
- ✅ Fotos devem aparecer como miniaturas

**Passo 4:** Clique "Voltar ao Totem"
- ✅ Deve voltar à tela de seleção

**Passo 5:** Clique "Selecionar Tudo"
- ✅ Todas as fotos devem ficar marcadas

**Passo 6:** Clique "Avançar"
- ✅ Deve ir para tela de formato

**Passo 7:** Clique em um formato (ex: 10×15)
- ✅ Deve mostrar prévia

**Passo 8:** Clique "Confirmar Impressão"
- ✅ Deve ir para tela de processamento

**Passo 9:** Aguarde processamento
- ✅ Barra de progresso deve avançar
- ✅ Fotos devem sair na impressora

**Passo 10:** Clique "Voltar ao Início"
- ✅ Deve voltar para tela inicial

---

## 🎉 Resultado

Se todos os passos funcionaram: **PARABÉNS! Seu totem está pronto! 🚀**

Se algo não funcionou, veja a seção "Troubleshooting" no `GUIA_TESTE_NAVEGADOR.md`.

---

## 📋 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Servidor offline | Execute `pnpm dev` |
| Impressora não imprime | Defina como padrão em Configurações |
| Fotos não aparecem | Aguarde 5 segundos, atualize a página |
| QR Code não funciona | Use acesso direto (veja guia completo) |
| Tela branca | Limpe cache (Ctrl+Shift+Delete) |

---

## 🚀 Próximo Passo

Após validar tudo:

1. Abra PowerShell no Windows
2. Navegue até a pasta do projeto
3. Execute: `pnpm electron:build`
4. Aguarde a compilação
5. Teste o `.exe` gerado
6. Se funcionar, está pronto para o totem!

---

**Tempo estimado:** 5 minutos  
**Dificuldade:** Fácil  
**Status:** Pronto para começar
