// POST /api/pix — gera uma cobrança PIX na MasterFy no valor escolhido pelo doador.
import QRCode from "qrcode";
import { masterfy, MasterfyError, doacoes, cpfValido, json } from "../lib/masterfy.mjs";

const VALOR_MINIMO = 3; // em reais
const VALOR_MAXIMO = 50000;

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { erro: "Método não permitido." });

  let dados;
  try { dados = await req.json(); } catch { return json(400, { erro: "Dados inválidos." }); }

  const valor = Number(dados.valor);
  const cpf = String(dados.cpf || "").replace(/\D/g, "");

  if (!Number.isFinite(valor) || valor < VALOR_MINIMO || valor > VALOR_MAXIMO)
    return json(400, { erro: `Informe um valor entre R$ ${VALOR_MINIMO} e R$ ${VALOR_MAXIMO.toLocaleString("pt-BR")}.` });
  if (!cpfValido(cpf)) return json(400, { erro: "CPF inválido." });

  const centavos = Math.round(valor * 100);
  const ref = crypto.randomUUID();
  const site = process.env.URL || new URL(req.url).origin;

  let pagamento;
  try {
    pagamento = await masterfy("/payment", {
      method: "POST",
      body: {
        amount: centavos,
        currency: "BRL",
        method: "PIX",
        description: "Doação - Campanha Ajude o Kauê",
        externalRef: ref,
        notificationUrl: `${site}/api/pix/webhook`,
        ip: context.ip,
        // A MasterFy só exige CPF válido; o nome precisa existir mas pode ser genérico.
        payer: { name: "Doador", taxId: cpf },
        items: [{ quantity: 1, name: "Doação Ajude o Kauê", price: centavos, type: "DIGITAL" }]
      }
    });
  } catch (e) {
    if (!(e instanceof MasterfyError)) throw e;
    console.error("MasterFy:", e.status, e.code, e.message, e.details);
    if (e.code === "payment.businessLogic.ticketMin") return json(400, { erro: "Valor abaixo do mínimo aceito para PIX." });
    if (e.code === "payment.businessLogic.ticketMax") return json(400, { erro: "Valor acima do máximo aceito para PIX." });
    if (e.status === 429) return json(429, { erro: "Muitas tentativas. Aguarde um instante e tente de novo." });
    return json(502, { erro: "Não foi possível gerar o PIX agora. Tente novamente em alguns minutos." });
  }

  const copiaECola = pagamento.data?.copypaste;
  if (!copiaECola) {
    console.error("MasterFy: resposta sem copypaste", pagamento.id);
    return json(502, { erro: "Não foi possível gerar o PIX agora. Tente novamente em alguns minutos." });
  }

  // Guarda só o necessário para acompanhar o status (sem dados pessoais do doador).
  await doacoes().setJSON(pagamento.id, {
    ref,
    valor: centavos,
    status: pagamento.status,
    criadoEm: pagamento.createdAt
  });

  return json(200, {
    id: pagamento.id,
    valor: centavos / 100,
    copiaECola,
    qrCode: await QRCode.toDataURL(copiaECola, { margin: 1, width: 300 })
  });
};

export const config = { path: "/api/pix" };
