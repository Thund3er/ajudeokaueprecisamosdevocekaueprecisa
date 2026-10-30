// POST /api/pix/webhook — notificação da MasterFy quando o status de um pagamento muda.
// Webhooks cadastrados no painel vêm assinados (X-Signature = HMAC-SHA256 do corpo em Base64,
// com MASTERFY_WEBHOOK_SECRET). Os enviados para notificationUrl não têm assinatura: nesse caso
// o corpo não é confiável e conferimos o pagamento direto na API antes de atualizar o status.
import { createHmac, timingSafeEqual } from "node:crypto";
import { masterfy, doacoes, json } from "../lib/masterfy.mjs";

function assinaturaValida(corpo, assinatura) {
  const segredo = process.env.MASTERFY_WEBHOOK_SECRET;
  if (!segredo || !assinatura) return false;
  const esperada = Buffer.from(createHmac("sha256", segredo).update(corpo).digest("base64"));
  const recebida = Buffer.from(assinatura);
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida);
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { erro: "Método não permitido." });

  const corpo = await req.text();
  let evento;
  try { evento = JSON.parse(corpo); } catch { return json(400, { erro: "Corpo inválido." }); }

  const id = String(evento.id || "");
  const store = doacoes();
  const doacao = id && await store.get(id, { type: "json" });
  if (!doacao) return json(404, { erro: "Pagamento desconhecido." });

  const assinado = assinaturaValida(corpo, req.headers.get("x-signature"));
  const pagamento = assinado ? evento : await masterfy(`/payment/${encodeURIComponent(id)}`);
  await store.setJSON(id, { ...doacao, status: pagamento.status, pagoEm: pagamento.paidAt });
  console.log("Doação", id, "→", pagamento.status, assinado ? "(assinado)" : "(conferido na API)");

  return json(200, { ok: true });
};

export const config = { path: "/api/pix/webhook" };
