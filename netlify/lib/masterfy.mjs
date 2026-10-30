// Cliente mínimo da API MasterFy (https://app.masterfypagamentos.com/docs).
// A chave secreta fica só no servidor, na variável de ambiente MASTERFY_API_KEY.
import { getStore } from "@netlify/blobs";

const API_URL = (process.env.MASTERFY_API_URL || "https://api.masterfypagamentos.com").replace(/\/+$/, "");

export const doacoes = () => getStore({ name: "doacoes", consistency: "strong" });

export async function masterfy(path, { method = "GET", body } = {}) {
  const key = process.env.MASTERFY_API_KEY;
  if (!key) throw new MasterfyError(500, "MASTERFY_API_KEY não configurada.");
  const res = await fetch(`${API_URL}/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new MasterfyError(res.status, data.message || "Erro na MasterFy.", data.code, data.details);
  return data;
}

export class MasterfyError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function cpfValido(cpf) {
  const d = String(cpf || "").replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const n of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(d[n])) return false;
  }
  return true;
}

export const json = (status, data) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
