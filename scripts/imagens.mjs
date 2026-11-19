/* Imagens automáticas — O Brasil nos palcos
   Roda no GitHub Actions (ver .github/workflows/imagens.yml).

   Para cada evento publicado em events.js que tem "imagemFonte" mas ainda não tem imagem no site:
   1. Abre imagemFonte. Se já for uma imagem, usa-a. Se for a página de venda (HTML),
      procura a imagem oficial de divulgação (og:image / twitter:image / image_src).
   2. Confere que é mesmo uma imagem (JPEG, PNG ou WebP, até 5 MB).
   3. Salva em img/ev-<id>.<ext> e preenche "imagem" (e foco/ajuste padrão) no events.js.

   Nunca apaga nada e nunca substitui uma imagem que já existe.
   Se uma imagem não baixar, o evento continua com a ilustração padrão e entra no resumo. */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ARQ = "events.js";
const MAX = 5 * 1024 * 1024;
const UA = "Mozilla/5.0 (compatible; ObrasilnospalcosBot/1.0; +https://obrasilnospalcos.com/)";

function lerAgenda() {
  const src = fs.readFileSync(ARQ, "utf8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return { lista: ctx.window.NP_EVENTS || [], atualizado: ctx.window.NP_EVENTS_UPDATED || "" };
}

function escreverAgenda(lista, atualizado) {
  const out = "/* Agenda publicada — gerada a partir da curadoria. Não editar à mão. */\n"
    + `window.NP_EVENTS_UPDATED=${JSON.stringify(atualizado)};\n`
    + "window.NP_EVENTS=" + JSON.stringify(lista, null, 1) + ";\n";
  fs.writeFileSync(ARQ, out);
}

async function baixar(url, aceitar) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const r = await fetch(url, {
      redirect: "follow", signal: ctrl.signal,
      headers: { "User-Agent": UA, "Accept": aceitar, "Accept-Language": "pt-PT,pt;q=0.9" }
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const tipo = (r.headers.get("content-type") || "").toLowerCase();
    const buf = Buffer.from(await r.arrayBuffer());
    return { tipo, buf, final: r.url || url };
  } finally { clearTimeout(t); }
}

/* tipo real pelos primeiros bytes */
function formato(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "webp";
  return null;
}

function imagemDaPagina(html, base) {
  const padroes = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
    /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i
  ];
  for (const p of padroes) {
    const m = html.match(p);
    if (m) {
      const u = m[1].replace(/&amp;/g, "&").trim();
      try { return new URL(u, base).href; } catch { /* ignora */ }
    }
  }
  return null;
}

async function obterImagem(fonte) {
  const r = await baixar(fonte, "image/*,text/html;q=0.9,*/*;q=0.5");
  let buf = r.buf;
  if (!formato(buf)) {
    if (!r.tipo.includes("html")) throw new Error(`não é imagem nem página (${r.tipo || "sem tipo"})`);
    const alvo = imagemDaPagina(buf.toString("utf8"), r.final);
    if (!alvo) throw new Error("a página não indica imagem de divulgação");
    buf = (await baixar(alvo, "image/*")).buf;
  }
  const ext = formato(buf);
  if (!ext) throw new Error("o ficheiro baixado não é JPEG, PNG nem WebP");
  if (buf.length > MAX) throw new Error(`imagem grande demais (${Math.round(buf.length / 1024)} KB)`);
  return { buf, ext };
}

const { lista, atualizado } = lerAgenda();
const ok = [], falhas = [];

for (const e of lista) {
  if (e.demo || !e.imagemFonte) continue;
  if (e.imagem && fs.existsSync(e.imagem)) continue;
  try {
    const { buf, ext } = await obterImagem(e.imagemFonte);
    const destino = path.posix.join("img", `ev-${e.id}.${ext}`);
    fs.writeFileSync(destino, buf);
    e.imagem = destino;
    if (!e.foco) e.foco = "50% 50%";
    if (!e.ajuste) e.ajuste = "contain";
    ok.push(`${e.id} · ${e.artist} → ${destino}`);
  } catch (err) {
    falhas.push(`${e.id} · ${e.artist}: ${err.message} (${e.imagemFonte})`);
  }
}

if (ok.length) escreverAgenda(lista, atualizado);

const resumo = [
  `## Imagens`,
  `Baixadas: ${ok.length} · Falharam: ${falhas.length}`,
  ...ok.map(l => `- ✅ ${l}`),
  ...falhas.map(l => `- ⚠️ ${l}`)
].join("\n");
console.log(resumo);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumo + "\n");
