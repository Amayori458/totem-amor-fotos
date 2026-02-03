# 🧪 Guia Prático de Teste - Totem Amor por Fotos

## 📱 Acesso ao Totem

**URL do Totem:** https://3000-i3rmlcelwu19kteefbl6a-cb1ecdbc.us2.manus.computer

Abra esta URL em qualquer navegador (Chrome, Firefox, Edge, Safari).

---

## 🔄 Fluxo Completo de Teste

### **Etapa 1: Tela Inicial**

1. Você verá a tela com:
   - Logo "Amor por Fotos ❤️"
   - Texto: "Suas Fotos Reveladas com Amor"
   - Botão: "Toque para Começar"

2. **Ação:** Clique no botão "Toque para Começar"

**Resultado esperado:** Deve ir para a tela do QR Code

---

### **Etapa 2: Tela do QR Code**

Você verá:
- Um QR Code grande no centro
- Texto: "Escaneie o QR Code para enviar suas fotos"
- Status: "Aguardando envio..."
- Botão "Voltar" no canto inferior

#### **Opção A: Testar com QR Code Real**

1. Abra seu celular
2. Abra a câmera ou app de QR Code
3. Aponte para o QR Code na tela
4. Clique no link que aparecer
5. Você será levado a uma página de upload mobile

#### **Opção B: Testar Direto (Sem QR Code)**

Se preferir pular o QR Code:
1. Abra o console do navegador (F12)
2. Vá para a aba "Network"
3. Procure pela URL da sessão (algo como `/upload/abc123`)
4. Copie o ID da sessão
5. Acesse diretamente: `https://3000-i3rmlcelwu19kteefbl6a-cb1ecdbc.us2.manus.computer/upload/[ID]`

**Resultado esperado:** Página de upload mobile deve abrir

---

### **Etapa 3: Upload de Fotos (Mobile)**

Na página de upload, você verá:
- Área para arrastar fotos ou clicar para selecionar
- Suporta: JPG, PNG, HEIC
- Máximo: 10 fotos por sessão

#### **Como Testar:**

1. **Opção 1 - Arrastar Fotos:**
   - Pegue 2-3 fotos do seu computador
   - Arraste para a área de upload
   - Aguarde o processamento

2. **Opção 2 - Clicar e Selecionar:**
   - Clique na área de upload
   - Selecione fotos do seu computador
   - Aguarde o processamento

**Resultado esperado:** 
- Fotos aparecem como miniaturas
- Status muda para "X fotos recebidas"
- Botão "Voltar ao Totem" fica disponível

---

### **Etapa 4: Seleção de Fotos**

Após upload, volte ao totem (clique "Voltar ao Totem").

Você verá:
- Grade de miniaturas das fotos
- Checkboxes em cada foto
- Botões: "Selecionar Tudo", "Avançar", "Voltar"
- Contador: "X fotos selecionadas"

#### **Como Testar:**

1. Clique em 1-2 fotos para selecionar
2. Veja o contador atualizar
3. Clique "Selecionar Tudo" para marcar todas
4. Clique "Avançar"

**Resultado esperado:** Vai para a tela de escolha de formato

---

### **Etapa 5: Escolha do Formato**

Você verá dois botões:
- **10×15 cm** (R$ 5,90)
- **15×21 cm** (R$ 8,90)

Cada um mostra:
- Dimensões
- Prévia da foto
- Preço

#### **Como Testar:**

1. Clique em um formato (ex: 10×15)
2. Veja a prévia da foto ajustada
3. Clique "Confirmar Impressão"

**Resultado esperado:** Vai para a tela de processamento

---

### **Etapa 6: Processamento e Impressão**

Você verá:
- Barra de progresso
- Texto: "Imprimindo X de Y"
- Prévia da foto atual

#### **Importante - Configurar Impressora:**

Antes desta etapa, você precisa configurar uma impressora comum no Windows.

**Veja a seção "Configuração de Impressora" abaixo.**

**Resultado esperado:** 
- Fotos são enviadas para a impressora
- Barra de progresso avança
- Após conclusão, vai para tela final

---

### **Etapa 7: Tela Final**

Você verá:
- Mensagem: "As fotos estão prontas! Retire no balcão."
- Botão: "Voltar ao Início"

#### **Como Testar:**

1. Clique "Voltar ao Início"
2. Deve voltar para a tela inicial

**Resultado esperado:** Ciclo completo funcionando ✅

---

## 🖨️ Configuração de Impressora Comum

### **Pré-requisitos**

- Impressora conectada ao Windows (USB ou rede)
- Drivers instalados
- Impressora ativa e com papel

### **Passo 1: Verificar Impressora no Windows**

1. Vá para **Configurações > Dispositivos > Impressoras e scanners**
2. Procure sua impressora na lista
3. Se não aparecer, clique "Adicionar impressora"
4. Siga as instruções para instalar

### **Passo 2: Definir Impressora Padrão**

1. Em "Impressoras e scanners", clique na sua impressora
2. Clique "Gerenciar"
3. Clique "Definir como padrão"

### **Passo 3: Testar Impressão Direta**

1. Abra o painel administrativo: https://3000-i3rmlcelwu19kteefbl6a-cb1ecdbc.us2.manus.computer/admin
2. Vá para a aba "Configurações"
3. Procure por "Teste de Impressão"
4. Clique no botão de teste
5. Uma página deve ser enviada para a impressora

**Resultado esperado:** Página de teste sai na impressora

### **Passo 4: Configurar Tamanho do Papel**

No totem, o sistema espera papel nos tamanhos:
- **10×15 cm** (4×6 polegadas)
- **15×21 cm** (6×8 polegadas)

**Como configurar:**

1. Vá para **Configurações > Dispositivos > Impressoras e scanners**
2. Clique na sua impressora > **Gerenciar**
3. Clique **Preferências de impressão**
4. Vá para a aba **Papel**
5. Selecione o tamanho correto
6. Clique **OK**

---

## 🐛 Troubleshooting

### **Problema: QR Code não funciona**

**Solução:**
- Verifique se o celular tem câmera funcionando
- Teste com app de QR Code (ex: Google Lens)
- Se não funcionar, use a Opção B (acesso direto)

### **Problema: Upload não funciona**

**Solução:**
- Verifique se a foto tem menos de 10 MB
- Tente com um formato diferente (JPG em vez de PNG)
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Tente em outro navegador

### **Problema: Fotos não aparecem após upload**

**Solução:**
- Aguarde 5 segundos (processamento de imagem)
- Atualize a página (F5)
- Verifique o console (F12) para erros

### **Problema: Impressora não imprime**

**Solução:**
1. Verifique se a impressora está ligada
2. Verifique se tem papel
3. Verifique se está definida como padrão
4. Teste com outro programa (ex: Notepad)
5. Reinicie a impressora

### **Problema: Tela branca ou congelada**

**Solução:**
- Atualize a página (F5)
- Limpe cache (Ctrl+Shift+Delete)
- Tente em outro navegador
- Verifique a conexão com a internet

---

## 📊 Painel Administrativo

Acesse: https://3000-i3rmlcelwu19kteefbl6a-cb1ecdbc.us2.manus.computer/admin

### **Funcionalidades:**

1. **Dashboard** - Visualizar pedidos em tempo real
2. **Configurações** - Editar preços e timeout
3. **Histórico** - Ver todas as vendas
4. **Teste de Impressão** - Enviar página de teste

---

## ✅ Checklist de Teste Completo

- [ ] Tela inicial carrega corretamente
- [ ] QR Code é gerado e legível
- [ ] Upload de fotos funciona
- [ ] Fotos aparecem na seleção
- [ ] Seleção de fotos funciona
- [ ] Escolha de formato funciona
- [ ] Impressora recebe as fotos
- [ ] Tela final aparece
- [ ] Botão "Voltar" funciona
- [ ] Timeout retorna à tela inicial

---

## 📝 Relatório de Teste

Após completar o teste, anote:

**Data:** _______________

**Impressora:** _______________

**Fotos testadas:** _______________

**Problemas encontrados:**
- [ ] Nenhum
- [ ] QR Code
- [ ] Upload
- [ ] Seleção
- [ ] Formato
- [ ] Impressão
- [ ] Outro: _______________

**Observações:**

_______________________________________________

_______________________________________________

---

## 🚀 Próximos Passos

Após validar tudo no navegador:

1. **Compilar executável Windows**
   - Siga o `WINDOWS_BUILD_GUIDE.md`
   - Execute `pnpm electron:build` no Windows

2. **Testar no Electron**
   - Execute o arquivo `.exe` gerado
   - Repita o fluxo de teste
   - Verifique se a impressora funciona

3. **Deploy no Totem**
   - Copie o `.exe` para o totem
   - Execute o instalador
   - Configure auto-inicialização

---

**Versão:** 1.0.0  
**Data:** Janeiro 2026  
**Status:** Pronto para teste
