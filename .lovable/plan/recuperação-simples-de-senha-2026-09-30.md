# Recuperação simples de senha

## Objetivo
Permitir que clientes e membros da equipe recuperem o acesso por e-mail, mantendo os perfis e dados atuais.

## Alterações
- Adicionar “Esqueci minha senha” nas telas de acesso do cliente e da equipe.
- Criar uma tela pública para informar o e-mail e solicitar o link de recuperação.
- Criar a tela pública `/reset-password`, que valida o link recebido e permite definir e confirmar uma nova senha.
- Exibir mensagens claras para envio concluído, link inválido/expirado e falhas, sem revelar se um e-mail está cadastrado.
- Manter o usuário na tela correta após concluir a troca da senha.

## Detalhes técnicos
- Usar a autenticação existente e o envio padrão de e-mails do Lovable Cloud.
- Enviar links para `/reset-password` e tratar a sessão segura de recuperação antes de atualizar a senha.
- Manter a recuperação separada das páginas protegidas e preservar a tabela de perfis sem alterações.
- Validar e-mail, senha mínima e confirmação; bloquear envios repetidos enquanto a solicitação estiver em andamento.
- Verificar compilação e o fluxo público no navegador em tamanhos desktop e mobile.
