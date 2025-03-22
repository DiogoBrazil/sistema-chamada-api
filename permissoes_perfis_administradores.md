# Permissões de Perfis Administrativos no Sistema de Chamada - Fluxo de Profissionais

Este documento descreve as permissões e restrições para cada perfil administrativo no gerenciamento de profissionais no sistema.

## Perfis Administrativos

O sistema implementa três níveis hierárquicos de administradores:

1. **GENERAL_ADMINISTRATOR**: Administrador global com acesso a todo o sistema.
2. **GENERAL_LOCAL_ADMINISTRATOR**: Administrador municipal vinculado a uma cidade específica.
3. **LOCAL_ADMINISTRATOR**: Administrador local vinculado a uma unidade de saúde específica.

## Permissões por Perfil Administrativo

### GENERAL_ADMINISTRATOR

#### O que pode fazer:
- Criar profissionais de qualquer perfil, exceto outros GENERAL_ADMINISTRATOR
- Criar GENERAL_LOCAL_ADMINISTRATOR para qualquer cidade
- Criar LOCAL_ADMINISTRATOR para qualquer unidade de saúde
- Atualizar qualquer profissional, exceto outros GENERAL_ADMINISTRATOR (a menos que seja ele mesmo)
- Excluir qualquer profissional
- Visualizar todos os profissionais do sistema, independente da cidade ou unidade de saúde
- Acessar todas as unidades de saúde do sistema
- Acessar todas as cidades do sistema

#### O que não pode fazer:
- Criar outros GENERAL_ADMINISTRATOR
- Atualizar outros GENERAL_ADMINISTRATOR
- Alterar um profissional existente para o perfil GENERAL_ADMINISTRATOR
- Criar um segundo GENERAL_LOCAL_ADMINISTRATOR para a mesma cidade
- Criar um segundo LOCAL_ADMINISTRATOR para a mesma unidade de saúde

### GENERAL_LOCAL_ADMINISTRATOR

#### O que pode fazer:
- Criar profissionais de qualquer perfil não administrativo (DOCTOR, NURSE, etc.) para sua cidade
- Criar LOCAL_ADMINISTRATOR para unidades de saúde em sua cidade
- Atualizar profissionais não administrativos em sua cidade
- Atualizar a si mesmo (seus próprios dados)
- Excluir profissionais não administrativos em sua cidade
- Visualizar todos os profissionais de sua cidade
- Acessar todas as unidades de saúde de sua cidade

#### O que não pode fazer:
- Criar ou atualizar GENERAL_ADMINISTRATOR
- Criar ou atualizar outros GENERAL_LOCAL_ADMINISTRATOR
- Criar profissionais em cidades diferentes da sua
- Atualizar profissionais em cidades diferentes da sua
- Alterar um profissional para um perfil administrativo (GENERAL_ADMINISTRATOR, GENERAL_LOCAL_ADMINISTRATOR)
- Criar um segundo LOCAL_ADMINISTRATOR para a mesma unidade de saúde
- Acessar unidades de saúde de outras cidades
- Acessar profissionais de outras cidades

### LOCAL_ADMINISTRATOR

#### O que pode fazer:
- Criar profissionais de perfis não administrativos (DOCTOR, NURSE, etc.) em sua unidade de saúde
- Atualizar profissionais não administrativos em sua unidade de saúde
- Atualizar a si mesmo (seus próprios dados)
- Excluir profissionais não administrativos em sua unidade de saúde
- Visualizar profissionais de sua unidade de saúde
- Transferir profissionais entre unidades de saúde que administra (caso administre mais de uma)

#### O que não pode fazer:
- Criar ou atualizar qualquer tipo de administrador (GENERAL_ADMINISTRATOR, GENERAL_LOCAL_ADMINISTRATOR, LOCAL_ADMINISTRATOR)
- Alterar um profissional para um perfil administrativo
- Criar, atualizar ou excluir profissionais em unidades de saúde que não administra
- Acessar unidades de saúde que não administra
- Alterar informações de profissionais vinculados a outras unidades de saúde

## Hierarquia de Gerenciamento de Profissionais

1. **GENERAL_ADMINISTRATOR**
   - Gerencia todo o sistema
   - Pode gerenciar qualquer profissional (exceto outros GENERAL_ADMINISTRATOR)

2. **GENERAL_LOCAL_ADMINISTRATOR**
   - Gerenciamento limitado a sua cidade
   - Pode gerenciar LOCAL_ADMINISTRATOR e outros profissionais em sua cidade

3. **LOCAL_ADMINISTRATOR**
   - Gerenciamento limitado a sua(s) unidade(s) de saúde
   - Pode gerenciar apenas profissionais não administrativos em sua(s) unidade(s)

## Observações Importantes

- Cada cidade pode ter apenas um GENERAL_LOCAL_ADMINISTRATOR
- Cada unidade de saúde pode ter apenas um LOCAL_ADMINISTRATOR
- Um administrador só pode gerenciar profissionais dentro de sua jurisdição (sistema, cidade ou unidade)
- Os perfis de administradores podem acessar todos os estágios de atendimento em suas respectivas jurisdições
- Um profissional pode editar seus próprios dados independentemente do perfil

## Regras de Vinculação

- GENERAL_ADMINISTRATOR: não vinculado a nenhuma unidade de saúde específica
- GENERAL_LOCAL_ADMINISTRATOR: vinculado a uma cidade específica, sem unidade de saúde
- LOCAL_ADMINISTRATOR: vinculado a uma unidade de saúde específica
- Outros perfis profissionais: sempre vinculados a uma unidade de saúde

## Status HTTP e Mensagens de Resposta

Esta seção documenta os possíveis códigos de status HTTP e mensagens que podem ocorrer no fluxo de gerenciamento de profissionais.

### Códigos de Status de Sucesso

| Status | Descrição | Situações de Uso |
|--------|-----------|-----------------|
| 200 | OK | Sucesso em operações de busca e atualização de profissionais |
| 201 | Created | Sucesso na criação de um novo profissional |

### Códigos de Status de Erro

| Status | Descrição | Situações de Uso |
|--------|-----------|-----------------|
| 400 | Bad Request | Validação de dados falhou: email inválido, senha não fornecida, dados de endereço incompletos, tentativa de excluir a si mesmo |
| 401 | Unauthorized | Usuário não autenticado tentando acessar recursos protegidos |
| 403 | Forbidden | Permissão negada: tentativa de acessar/modificar recursos fora da jurisdição do administrador |
| 404 | Not Found | Profissional, unidade de saúde ou cidade não encontrada |
| 409 | Conflict | Recursos duplicados: email ou CPF já em uso, tentativa de criar um segundo administrador para a mesma cidade/unidade |
| 500 | Internal Server Error | Erros não mapeados ou problemas inesperados no servidor |

### Mensagens de Sucesso

- "Created successfully"
- "Updated successfully"
- "Deleted successfully"
- "Data retrieved successfully"
- "Professional created and linked to health unit successfully"

### Mensagens de Erro

#### Erros de Autenticação e Autorização (401, 403)
- "Unauthorized access"
- "Only administrators can create professionals"
- "Only administrators can update professionals"
- "Only administrators can delete professionals"
- "Professional does not have permission to access this professional data"

#### Erros de Administrador Local (403, 400)
- "Local administrators cannot create administrator profiles"
- "Local administrators cannot update administrator profiles" 
- "Local administrators cannot update to administrator profiles"
- "Local administrator is not linked to any health unit"
- "Local administrator does not have access to the specified health unit"
- "You can only update professionals from your health unit"
- "You can only delete professionals from your health unit"

#### Erros de Administrador Geral Local (403, 400)
- "General local administrators cannot create general administrators"
- "General local administrators cannot create other general local administrators"
- "General local administrators cannot update general administrators"
- "General local administrators cannot update other general local administrators"
- "General local administrators cannot update to general administrator profiles"
- "You can only update professionals from your city"
- "You can only update professionals to your city"
- "You can only delete professionals from your city"
- "Admin not linked to any city"

#### Erros de Administrador Geral (403)
- "General administrators cannot create other general administrators"
- "General administrators cannot update other general administrators"
- "Cannot update a professional to general administrator profile"

#### Erros de Recursos (404, 409)
- "Professional not found"
- "Admin not found"
- "Health unit not found"
- "City not found"
- "Health unit is required for non-general administrator profiles"
- "City is required for general local administrator profiles"
- "There is already a general local administrator for this city"
- "There is already a local administrator for this health unit"
- "Email already in use."
- "CPF already in use"
- "Cannot delete a professional with active attendances"

#### Erros de Validação (400)
- "Invalid email."
- "Password is required."
- "Street, city, state and number are required for address"
- "You cannot delete yourself"
- "Invalid ID"

## Padrão de Resposta da API

Todas as respostas seguem o formato:

```json
{
  "message": "Mensagem explicativa",
  "data": <objeto ou array de dados ou null>,
  "status_code": <código HTTP de status>
}
```

Para respostas de paginação, o formato inclui metadados de paginação:

```json
{
  "message": "Data retrieved successfully",
  "data": <array de profissionais>,
  "pagination": {
    "currentPage": <número da página atual>,
    "totalPages": <total de páginas>,
    "totalItems": <total de itens>
  },
  "status_code": 200
}
```