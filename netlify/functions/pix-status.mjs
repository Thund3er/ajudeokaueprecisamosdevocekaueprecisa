// GET /api/pix/:id — status de uma doação, lido do que o webhook gravou.
// A MasterFy proíbe polling na API dela; a página consulta só este endpoint.
import { doacoes, json } from "../lib/masterfy.mjs";

export default async (req, context) => {
  const doacao = await doacoes().get(context.params.id, { type: "json" });
  if (!doacao) return json(404, { erro: "Doação não encontrada." });
  return json(200, { status: doacao.status });
};

export const config = { path: "/api/pix/:id", method: "GET" };
