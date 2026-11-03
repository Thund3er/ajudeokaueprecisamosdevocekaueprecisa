// Edite somente este arquivo para atualizar os dados confirmados da campanha.
// As doações via PIX são geradas pela MasterFy; a chave da API fica nas variáveis de ambiente do Netlify.
window.CAMPAIGN_CONFIG = {
  goal: 115000,
  // Valor recebido FORA do site (PIX direto, transferências...). Os PIX feitos pelo site
  // são somados automaticamente; não inclua eles aqui para não contar duas vezes.
  raised: 7345.32,
  // Lista "Quem já ajudou" (mais recentes primeiro). Use "Anônimo" para quem não quer aparecer.
  donors: [
    { name: "Denise Vaques", amount: 45 },
    { name: "José Cardoso", amount: 200 },
    { name: "Anônimo", amount: 35 },
    { name: "Lucas Santos", amount: 150 },
    { name: "Matheus Costa", amount: 10 },
    { name: "Anônimo", amount: 15 }
  ],
  video: "assets/video-kaue.mp4",
  pixVideo: "assets/video-kaue.mp4", // toca com som na janela do QR Code, logo depois de clicar em Gerar PIX
  heroImage: "assets/kaue-capa.jpg",
  storyImage: "assets/kaue-historia.jpg"
};
