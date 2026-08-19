# Central Devoluções

Atue como um Engenheiro de Software Sênior e UI/UX Designer. 

Objetivo: Criar a versão 1.0 de uma plataforma SaaS de logística reversa e gestão de trocas/devoluções para e-commerces (similar ao Troquecommerce).

Stack Tecnológico Obrigatório: React (Vite), Tailwind CSS, shadcn/ui, ícones Lucide, e React Router para navegação. Use mock data estruturado de forma que depois eu possa conectar ao Supabase.

A aplicação deve ser dividida em duas áreas principais com rotas distintas:

=== 1. PORTAL DO CLIENTE FINAL (WHITE-LABEL) - Rota: /portal ===

Esta é a tela que o comprador do e-commerce acessa para solicitar uma troca. O design deve ser minimalista, responsivo (mobile-first) e focar na experiência do usuário.

* Passo 1 (Autenticação): Formulário limpo pedindo "Número do Pedido" e "E-mail ou CPF" do cliente.

* Passo 2 (Seleção): Listagem dos produtos daquele pedido (com foto miniatura, nome e preço). O usuário marca com um checkbox quais deseja devolver/trocar.

* Passo 3 (Motivo): Para os itens selecionados, abrir um formulário pedindo o Motivo (dropdown: Defeito, Tamanho errado, Arrependimento, Outro), uma caixa de texto para observações e um botão de upload de fotos (evidências).

* Passo 4 (Resolução): Cards interativos para escolher a solução:

  - Reembolso (Destacar que pode demorar mais).

  - Vale-compras (Destacar com uma badge "Recomendado/Bônus", incentivando a retenção do dinheiro na loja).

  - Troca de Tamanho/Cor.

* Passo 5 (Conclusão): Checkbox de aceite da Política de Trocas e uma tela de Sucesso gerando um código fictício de Postagem Reversa dos Correios.

=== 2. PAINEL DO LOJISTA (BACKOFFICE) - Rota: /admin ===

Este é o painel SaaS onde o dono da loja gerencia as devoluções. Layout com Sidebar lateral de navegação e Header superior. Design corporativo, estilo Vercel/Shopify.

* Dashboard: Cards de métricas (Total de Solicitações no mês, % de retenção com Vale-Compras vs Reembolso, NPS médio). Gráfico de barras simples mostrando os principais motivos de devolução.

* Solicitações (Kanban ou Tabela de Dados): Lista de solicitações recebidas. Colunas: ID, Cliente, Data, Status (Pendente, Aguardando Postagem, Recebido no CD, Concluído), Tipo (Troca/Devolução).

* Detalhes da Solicitação (Modal ou Drawer): Ao clicar em uma linha, exibir os detalhes do cliente, produtos devolvidos, fotos enviadas e botões de ação: "Aprovar e Gerar Etiqueta", "Rejeitar Solicitação", "Emitir Vale-compras".

* Configurações: Formulário para o lojista configurar sua política: Prazo de devolução (dias), Prazo de troca (dias), e personalização da Central do Cliente (upload de logo e escolha da cor primária).

=== REQUISITOS DE DESIGN E ESTADO ===

* O design deve ser extremamente polido, com animações suaves de transição entre os passos do Portal do Cliente (framer-motion, se possível).

* Use esqueletos de carregamento (skeletons)

use como base o site www.avancemodas.com.br pois é um site que vai servir de base de troca para esse

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://troqueavancemodas.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/14e11623-f7c0-452d-a8ef-55e548a9c662).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
