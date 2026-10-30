# Ajude o Kauê — site estático para Netlify
## Campanha Histórias Únicas

## O que está incluído
- Página responsiva (celular e computador).
- Seções de história, vídeo, galeria, meta, PIX e transparência.
- Botões de valores e doação via PIX gerada na hora pela MasterFy (QR Code + copia e cola), com confirmação automática do pagamento.
- Ampliação das fotos.
- Configuração centralizada em `config.js`.
- Imagens otimizadas da campanha incluídas na pasta assets/.

## Imagens incluídas
- assets/kaue-capa.jpg (foto principal do Kauê)
- assets/kaue-historia.jpg (foto da seção história)
- assets/kaue1.jpeg, kaue2.jpeg, kaue4.jpeg, kaue5.jpeg (galeria)
- assets/bannerfinal.jpg (banner promocional Histórias Únicas)

## Antes de publicar
1. Atualize `raised` em `config.js` somente com o valor real confirmado.
2. Revise os textos da história com a família antes de publicar.

## Pagamentos (MasterFy)
Documentação da API: https://app.masterfypagamentos.com/docs
- No painel da MasterFy, em Financeiro → Integrações → "Credenciais de API", copie a chave de pagamento.
- No Netlify, em Site configuration → Environment variables → Add a variable → Import from a .env file, cole:
  - `MASTERFY_API_KEY` = chave de pagamento da MasterFy
  - `MASTERFY_WEBHOOK_SECRET` = segredo do webhook cadastrado no painel da MasterFy
  Nunca coloque essas chaves em `config.js` nem em outro arquivo do site. Modelo em `.env.example`.
- Webhook a cadastrar no painel da MasterFy (tipo Pagamentos): https://ajudeokaueprecisamosdevocekaueprecisa.netlify.app/api/pix/webhook
- As funções ficam em `netlify/functions/`:
  - `POST /api/pix` gera a cobrança no valor escolhido.
  - `POST /api/pix/webhook` recebe o aviso da MasterFy e confere o pagamento na API.
  - `GET /api/pix/:id` informa o status para a página.
- O webhook só funciona com o site publicado (a MasterFy precisa alcançar a URL).

## Rodar localmente
1. `npm install`
2. Copie `.env.example` para `.env` e preencha as chaves
3. `npx netlify-cli dev` e abra http://localhost:8888

## Publicar no Netlify
Publique pelo repositório Git conectado ao Netlify. O deploy manual por arrastar a pasta não publica as funções de pagamento. O `netlify.toml` já configura tudo: Node 22, o build (`npm run build` copia só os arquivos públicos para `dist/`) e as funções em `netlify/functions/`.
