# Serviço de Histórico de Conversas do WhatsApp

Este serviço permite armazenar e recuperar o histórico de conversas do WhatsApp usando a Evolution API e armazenando os dados no Supabase. Agora inclui suporte para transcrição de mensagens de áudio.

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   EVOLUTION_API_URL=http://seu_ip_ou_dominio:porta
   EVOLUTION_API_KEY=sua_chave_da_evolution_api
   API_SECRET_KEY=sua_chave_secreta_para_autenticacao
   OPENAI_API_KEY=sua_chave_da_api_openai
   ```

## Executando o Serviço

Para iniciar o serviço localmente:

```
npm start
```

## Implantação no Portainer

Use o arquivo `docker-compose.yml` fornecido para criar uma stack no Portainer. Certifique-se de configurar as variáveis de ambiente corretamente.

## Documentação da API

Todas as rotas requerem autenticação via API Key. Inclua o cabeçalho `X-API-Key` com o valor definido em `API_SECRET_KEY` em todas as requisições.

### Sincronizar Mensagens

- **URL**: `/sync`
- **Método**: `POST`
- **Descrição**: Busca novas mensagens da Evolution API, transcreve mensagens de áudio e as salva no Supabase.
- **Resposta de Sucesso**:
  - **Código**: 200
  - **Conteúdo**: `{ "success": true, "message": "Mensagens sincronizadas com sucesso" }`

### Listar Conversas

- **URL**: `/conversations`
- **Método**: `GET`
- **Descrição**: Retorna uma lista de todas as conversas únicas.
- **Resposta de Sucesso**:
  - **Código**: 200
  - **Conteúdo**: Array de objetos de conversa
    ```json
    [
      {
        "participants": "participante1, participante2"
      },
      ...
    ]
    ```

### Obter Histórico de Conversa

- **URL**: `/conversations/:participants/messages`
- **Método**: `GET`
- **Parâmetros de URL**:
  - `participants`: Lista de participantes separados por vírgula
- **Parâmetros de Query**:
  - `page` (opcional): Número da página (padrão: 1)
  - `limit` (opcional): Número de mensagens por página (padrão: 50)
- **Descrição**: Retorna o histórico de mensagens para uma conversa específica, incluindo transcrições de áudio.
- **Resposta de Sucesso**:
  - **Código**: 200
  - **Conteúdo**:
    ```json
    {
      "messages": "[22/10/24 13:02] Participante1: \"mensagem1\"\n[22/10/24 13:07] Participante2: [Audio Transcription]: Conteúdo transcrito do áudio\n...",
      "totalCount": 100,
      "currentPage": 1,
      "totalPages": 2
    }
    ```

## Estrutura do Projeto

- `src/index.js`: Ponto de entrada principal e configuração do servidor Express
- `src/whatsapp.js`: Funções para interagir com a Evolution API, Supabase e OpenAI para transcrição de áudio
- `src/auth.js`: Middleware de autenticação

## Dependências Principais

- Express.js: Framework web
- @supabase/supabase-js: Cliente Supabase
- axios: Cliente HTTP para requisições à Evolution API
- date-fns: Formatação de datas
- openai: Cliente para a API OpenAI (usado para transcrição de áudio)

## Contribuindo

Por favor, leia CONTRIBUTING.md para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE.md para detalhes.
