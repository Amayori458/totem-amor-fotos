# Project TODO

## Fase 1: UI e Assets
- [x] Integrar assets HTML fornecidos no frontend React
- [x] Criar componente da Tela Inicial (Welcome)
- [x] Criar componente da Tela do QR Code
- [x] Criar componente da Tela de Seleção de Fotos
- [x] Criar componente da Tela de Escolha de Formato
- [x] Criar componente da Tela de Impressão/Processamento
- [x] Criar componente da Tela Final

## Fase 2: Backend e Banco de Dados
- [x] Definir schema de sessões de upload (sessions table)
- [x] Definir schema de pedidos (orders table)
- [x] Definir schema de fotos (photos table)
- [x] Criar rotas tRPC para criar sessão de upload
- [x] Criar rotas tRPC para listar fotos de uma sessão
- [x] Criar rotas tRPC para criar pedido

## Fase 3: Upload de Fotos via QR Code
- [x] Implementar geração de QR Code dinâmico por sessão
- [x] Criar endpoint de upload de fotos (multipart/form-data)
- [x] Implementar validação de formatos (JPG, PNG, HEIC)
- [x] Implementar upload para S3
- [x] Implementar polling para atualização de fotos recebidas

## Fase 4: Seleção e Formato
- [x] Implementar lógica de seleção de fotos (checkboxes)
- [x] Implementar botão "Selecionar Tudo"
- [x] Implementar botão "Remover Foto"
- [x] Implementar escolha de formato (10x15 ou 15x21)
- [ ] Implementar prévia de crop para cada formato (simplificado)

## Fase 5: Finalização do Pedido
- [x] Implementar lógica de criação de pedido
- [x] Gerar arquivo JSON com metadados do pedido (no banco)
- [x] Implementar timeout de inatividade para retornar à tela inicial
- [ ] Implementar lógica de redimensionamento de fotos (backend)
- [ ] Gerar estrutura de pastas organizada por data e pedido (backend)

## Fase 6: Testes e Entrega
- [ ] Criar testes unitários para rotas tRPC
- [ ] Testar fluxo completo de upload e seleção
- [ ] Criar checkpoint do projeto
- [ ] Documentar instruções de instalação e configuração

## Tradução para Português
- [x] Traduzir tela inicial (Welcome)
- [x] Traduzir tela do QR Code
- [x] Traduzir tela de upload mobile
- [x] Traduzir tela de seleção de fotos
- [x] Traduzir tela de escolha de formato
- [x] Traduzir tela de processamento
- [x] Traduzir tela final
- [x] Corrigir erro de digitação "histora" → "história"
- [x] Traduzir botão "Touch to Begin" → "Toque para Começar"

## Correções de Bugs
- [x] Corrigir erro "Cannot update a component while rendering" no Processing.tsx
