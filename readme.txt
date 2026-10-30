# Ajude o Kauê — site estático para Netlify
## Campanha Histórias Únicas

## O que está incluído
- Página responsiva (celular e computador).
- Seções de história, vídeo, galeria, meta, PIX e transparência.
- Botões de valores, modal de doação, copiar chave PIX e ampliação das fotos.
- Configuração centralizada em `config.js`.
- Imagens otimizadas da campanha incluídas na pasta assets/.

## Imagens incluídas
- assets/kaue-capa.jpg (foto principal do Kauê)
- assets/kaue-historia.jpg (foto da seção história)
- assets/kaue1.jpeg, kaue2.jpeg, kaue4.jpeg, kaue5.jpeg (galeria)
- assets/bannerfinal.jpg (banner promocional Histórias Únicas)

## Antes de publicar
1. Abra `config.js` e informe a chave PIX (`pixKey`) e o favorecido (`pixHolder`) quando forem confirmados.
2. Atualize `raised` somente com o valor real confirmado.
3. Adicione o vídeo em `assets/video-kaue.mp4` se disponível.
4. Revise os textos da história com a família antes de publicar.

## Publicar no Netlify
Arraste a pasta `ajude-o-kaue` para o deploy manual do Netlify, ou conecte-a a um repositório Git. Não é necessário build: o site é HTML/CSS/JS puro.
