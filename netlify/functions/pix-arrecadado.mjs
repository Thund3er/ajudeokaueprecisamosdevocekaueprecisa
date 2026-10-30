// GET /api/arrecadado — soma das doações PIX confirmadas pelo site (em reais).
// O resultado fica 60s em cache na CDN da Netlify, para não reler todas as doações a cada visita.
import { doacoes, json } from "../lib/masterfy.mjs";

export default async () => {
  const store = doacoes();
  const { blobs } = await store.list();
  const registros = await Promise.all(blobs.map(({ key }) => store.get(key, { type: "json" })));
  const pagas = registros.filter((d) => d?.status === "PAID");
  const centavos = pagas.reduce((soma, d) => soma + d.valor, 0);

  const res = json(200, { total: centavos / 100, doacoes: pagas.length });
  res.headers.set("Netlify-CDN-Cache-Control", "public, s-maxage=60, stale-while-revalidate=60");
  return res;
};

export const config = { path: "/api/arrecadado" };
