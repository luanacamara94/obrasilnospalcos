/* Alertas por e-mail — O Brasil nos palcos
   Roda no GitHub Actions (ver .github/workflows/alertas.yml).

   O que faz, todo dia:
   1. Lê a agenda publicada (events.js + festivais.js).
   2. Descobre as datas novas desde a última execução (estado salvo no Firestore em alertas/estado).
   3. Para cada pessoa com conta, avisos por e-mail ligados e e-mail confirmado, cruza as datas novas
      com os artistas favoritos dela: os escolhidos no perfil + os artistas dos eventos salvos no coração.
   4. Envia no máximo um e-mail por pessoa, pelo Brevo, e guarda o que já avisou para nunca repetir.

   Modos (variável MODO):
   - "simular": não envia nada nem grava estado; só mostra no log quem receberia o quê.
   - "teste":   envia só para TESTE_EMAIL, com tudo o que combina com essa conta (não só as novidades). Não grava estado.
   - "real":    o fluxo completo. Na primeira vez, só registra a agenda atual como "já vista" (não dispara nada antigo).

   Segredos (GitHub → Settings → Secrets → Actions): BREVO_API_KEY, FIREBASE_SA. */

import fs from "node:fs";
import vm from "node:vm";
import admin from "firebase-admin";

const SITE = "https://obrasilnospalcos.com/";
const REMETENTE = { name: "O Brasil nos palcos", email: process.env.REMETENTE_EMAIL || "alertas@obrasilnospalcos.com" };
const RESPONDER = { email: "ajuda@obrasilnospalcos.com", name: "O Brasil nos palcos" };
const MODO = (process.env.MODO || "simular").trim();
const TESTE_EMAIL = (process.env.TESTE_EMAIL || "").trim().toLowerCase();
const HOJE = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");

/* ---------- agenda ---------- */
function lerAgenda() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of ["events.js", "festivais.js"]) if (fs.existsSync(f)) vm.runInContext(fs.readFileSync(f, "utf8"), ctx);
  const todos = [...(ctx.window.NP_EVENTS || []), ...(ctx.window.NP_FESTIVAIS || [])];
  return todos.filter(e => !e.demo && new Date((e.fim || e.date) + "T00:00:00Z") >= HOJE);
}
const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = t => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* nomes de artista de um evento: o campo artist (pode ter vários, separados por vírgula ou " e ") + o line-up dos festivais */
function nomesDe(e) {
  const n = String(e.artist || "").split(/\s*,\s*|\s+e\s+|\s*&\s*/).map(norm).filter(x => x.length > 2);
  for (const g of e.lineup || []) for (const a of g.artistas || []) n.push(norm(a.nome));
  return [...new Set(n)];
}
/* um favorito combina se for o mesmo nome, ou se aparecer como palavras inteiras dentro do nome do evento */
const combina = (fav, nomes) => nomes.some(n => n === fav || (fav.length > 3 && (" " + n + " ").includes(" " + fav + " ")));

/* ---------- e-mail ---------- */
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function quando(e) {
  const [a, m1, d1] = e.date.split("-"), [, m2, d2] = (e.fim || e.date).split("-");
  if (e.date === (e.fim || e.date)) return `${+d1} ${MES[m1 - 1]} ${a}`;
  return m1 === m2 ? `${+d1} a ${+d2} ${MES[m1 - 1]}` : `${+d1} ${MES[m1 - 1]} a ${+d2} ${MES[m2 - 1]}`;
}
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const COR = { Show: "#1F3E9C", Teatro: "#B97A10", Concerto: "#1E5A44", "Exposição": "#00742C", Festival: "#B23C22" };

function montarEmail(nome, itens) {
  const primeiro = (nome || "").trim().split(/\s+/)[0];
  const assunto = itens.length === 1
    ? `${itens[0].fav} tem data nova em ${itens[0].e.city}`
    : `${itens.length} novidades dos seus artistas em Portugal`;
  const cards = itens.map(({ e, fav }) => `
    <tr><td style="padding:0 0 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #DADDE3;border-radius:12px;background:#FFFFFF">
        <tr><td style="padding:20px 22px">
          <span style="display:inline-block;padding:3px 10px;border-radius:6px;background:${COR[e.type] || "#1F3E9C"};color:#FFFFFF;font:600 12px Arial,sans-serif">${esc(e.type)} · ${esc(e.city)}</span>
          <p style="margin:12px 0 4px;font:800 20px/1.25 Arial,sans-serif;color:#23262D">${esc(e.title)}</p>
          <p style="margin:0 0 4px;font:400 15px/1.5 Arial,sans-serif;color:#4A4F5A">${esc(e.venue)}${e.bairro ? ", " + esc(e.bairro) : ""} · ${esc(quando(e))}</p>
          <p style="margin:0 0 16px;font:400 13px/1.5 Arial,sans-serif;color:#6B7180">Porque você segue ${esc(fav)}</p>
          <a href="${SITE}#/evento/${slug(e.title)}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#1F3E9C;color:#FFFFFF;font:600 15px Arial,sans-serif;text-decoration:none">Ver no site</a>
        </td></tr>
      </table>
    </td></tr>`).join("");
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(assunto)}</title></head>
<body style="margin:0;background:#F4F5F7">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td style="background:#081849;border-radius:16px 16px 0 0;padding:26px 26px 22px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:34px;height:24px;background:#009C3B;border-radius:4px;text-align:center;vertical-align:middle"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#002776;border:3px solid #FFDF00"></span></td>
      <td style="padding-left:10px;font:600 15px Arial,sans-serif;color:#F5F3EE">O Brasil nos palcos</td>
    </tr></table>
    <p style="margin:18px 0 0;font:800 26px/1.2 Arial,sans-serif;color:#FFFFFF">${primeiro ? esc(primeiro) + ", tem" : "Tem"} novidade para você</p>
    <p style="margin:8px 0 0;font:400 15px/1.5 Arial,sans-serif;color:#B9C3E6">Novas datas de artistas que você segue, em cartaz em Portugal.</p>
  </td></tr>
  <tr><td style="background:#F4F5F7;padding:20px 0 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cards}</table></td></tr>
  <tr><td style="padding:8px 4px 0;font:400 12px/1.6 Arial,sans-serif;color:#6B7180">
    Você recebe este e-mail porque ligou os avisos por e-mail em obrasilnospalcos.com. Para parar de receber, desligue em
    <a href="${SITE}#/perfil" style="color:#1F3E9C">Perfil › Configurações</a> ou responda com a palavra “cancelar”.
    Confirme sempre datas e preços no site da bilheteria antes de comprar.
  </td></tr>
</table></td></tr></table></body></html>`;
  const texto = `${primeiro ? primeiro + ", tem" : "Tem"} novidade para você\n\n` +
    itens.map(({ e, fav }) => `${e.title}\n${e.venue}, ${e.city} · ${quando(e)}\nPorque você segue ${fav}\n${SITE}#/evento/${slug(e.title)}`).join("\n\n") +
    `\n\nPara parar de receber, desligue os avisos em Perfil › Configurações (${SITE}#/perfil) ou responda com "cancelar".`;
  return { assunto, html, texto };
}

async function brevo(path, opts = {}) {
  const r = await fetch("https://api.brevo.com/v3" + path, {
    ...opts, headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json", ...(opts.headers || {}) }
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`Brevo ${path} → ${r.status} ${body}`);
  return body ? JSON.parse(body) : {};
}
async function bloqueados() {
  const s = new Set();
  try {
    for (let off = 0; ; off += 100) {
      const r = await brevo(`/smtp/blockedContacts?limit=100&offset=${off}`);
      (r.contacts || []).forEach(c => s.add(String(c.email).toLowerCase()));
      if (!r.contacts || r.contacts.length < 100) break;
    }
  } catch (e) { console.warn("Não consegui ler a lista de bloqueados do Brevo:", e.message); }
  return s;
}
async function enviar(para, nome, { assunto, html, texto }) {
  return brevo("/smtp/email", {
    method: "POST",
    body: JSON.stringify({
      sender: REMETENTE, replyTo: RESPONDER, to: [{ email: para, name: nome || undefined }],
      subject: assunto, htmlContent: html, textContent: texto, tags: ["alerta-artista"],
      headers: { "List-Unsubscribe": `<mailto:${RESPONDER.email}?subject=cancelar>` }
    })
  });
}

/* ---------- principal ---------- */
async function main() {
  console.log(`Modo: ${MODO}`);
  if (!["simular", "teste", "real"].includes(MODO)) throw new Error(`MODO inválido: ${MODO}`);
  if (MODO === "teste" && !TESTE_EMAIL) throw new Error("No modo teste, informe o e-mail de teste.");
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SA)) });
  const db = admin.firestore();

  const agenda = lerAgenda();
  const porId = new Map(agenda.map(e => [String(e.id), e]));
  console.log(`Agenda em cartaz: ${agenda.length} eventos`);

  const estadoRef = db.doc("alertas/estado");
  const estado = (await estadoRef.get()).data();
  const primeiraVez = !estado;
  const vistos = new Set(estado?.vistos || []);
  const novos = agenda.filter(e => !vistos.has(String(e.id)));
  console.log(primeiraVez ? "Primeira execução: nenhuma data é tratada como nova." : `Datas novas desde a última execução: ${novos.length}`);

  // e-mails e confirmação vêm do Firebase Authentication
  const contas = new Map();
  let tok;
  do {
    const r = await admin.auth().listUsers(1000, tok);
    r.users.forEach(u => contas.set(u.uid, u));
    tok = r.pageToken;
  } while (tok);

  const bloq = MODO === "simular" ? new Set() : await bloqueados();
  const perfis = await db.collection("usuarios").get();
  let enviados = 0, pulados = 0;

  for (const doc of perfis.docs) {
    const u = contas.get(doc.id); if (!u || !u.email) continue;
    const email = u.email.toLowerCase();
    if (MODO === "teste" && email !== TESTE_EMAIL) continue;
    const p = doc.data(), c = p.conta || {};
    if (MODO !== "teste") {
      if (!c.avisos) continue;
      if (!u.emailVerified) { pulados++; continue; }
      if (bloq.has(email)) { pulados++; continue; }
    }
    const salvos = new Set((p.agenda || []).map(String));
    const favs = new Map(); // nome normalizado -> nome para mostrar
    (c.artistas || []).forEach(a => favs.set(norm(a), a));
    salvos.forEach(id => { const e = porId.get(id); if (e) String(e.artist || "").split(/\s*,\s*|\s+e\s+/).forEach(a => { if (norm(a).length > 2) favs.set(norm(a), a.trim()) }) });
    if (!favs.size) continue;

    const base = MODO === "teste" ? agenda : (primeiraVez ? [] : novos);
    const avisados = new Set(p.alertas?.avisados || []);
    const itens = [];
    for (const e of base) {
      const id = String(e.id);
      if (salvos.has(id) || (MODO !== "teste" && avisados.has(id))) continue;
      const nomes = nomesDe(e);
      const hit = [...favs.keys()].find(f => combina(f, nomes));
      if (hit) itens.push({ e, fav: favs.get(hit) });
    }
    if (!itens.length) continue;
    itens.sort((a, b) => a.e.date.localeCompare(b.e.date));

    const msg = montarEmail(c.nome || u.displayName, itens.slice(0, 8));
    console.log(`→ ${email.replace(/(^.).*(@.*$)/, "$1***$2")}: ${itens.map(i => i.e.title).join(" | ")}`);
    if (MODO === "simular") continue;
    await enviar(u.email, c.nome || u.displayName, msg);
    enviados++;
    if (MODO === "real") await doc.ref.set({ alertas: { avisados: [...avisados, ...itens.map(i => String(i.e.id))].slice(-500), ultimoEnvio: admin.firestore.FieldValue.serverTimestamp() } }, { merge: true });
  }

  if (MODO === "real") await estadoRef.set({ vistos: [...new Set([...vistos, ...agenda.map(e => String(e.id))])].slice(-2000), atualizadoEm: admin.firestore.FieldValue.serverTimestamp() });
  console.log(`Concluído. E-mails enviados: ${enviados}. Pulados (e-mail não confirmado ou bloqueado): ${pulados}.`);
}
main().catch(e => { console.error(e); process.exit(1); });
