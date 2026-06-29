// ============================================================
// KIDO — Dashboard KPI IA (table ai_usage) — accès admin
// Protégé par ADMIN_KEY (?key=… ou header x-admin-key).
// SSR pur : zéro dépendance externe, barres CSS (compatible CSP).
// ============================================================
import { Router, type Request, type Response, type NextFunction } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';

const ADMIN_KEY = process.env.ADMIN_KEY || '';

function guard(req: Request, res: Response, next: NextFunction): void {
  const key = (req.query.key as string) || req.get('x-admin-key') || '';
  if (!ADMIN_KEY || key !== ADMIN_KEY) { res.status(401).json({ error: 'unauthorized' }); return; }
  next();
}

async function aggregate() {
  const q = (s: any) => db.execute(s) as unknown as Promise<any[]>;
  const [totals] = await q(sql`SELECT count(*)::int AS calls, COALESCE(sum(total_tokens),0)::int AS tokens, COALESCE(sum(est_cost_chf),0)::float AS cost FROM ai_usage`);
  const [month]  = await q(sql`SELECT count(*)::int AS calls, COALESCE(sum(est_cost_chf),0)::float AS cost FROM ai_usage WHERE created_at >= date_trunc('month', now())`);
  const daily    = await q(sql`SELECT to_char(date_trunc('day',created_at),'DD.MM') AS day, count(*)::int AS calls, COALESCE(sum(est_cost_chf),0)::float AS cost FROM ai_usage WHERE created_at >= now() - interval '30 days' GROUP BY date_trunc('day',created_at) ORDER BY date_trunc('day',created_at)`);
  const feats    = await q(sql`SELECT feature, count(*)::int AS calls, COALESCE(sum(est_cost_chf),0)::float AS cost FROM ai_usage GROUP BY feature ORDER BY cost DESC`);
  const models   = await q(sql`SELECT provider, model, count(*)::int AS calls, COALESCE(sum(total_tokens),0)::int AS tokens, COALESCE(sum(est_cost_chf),0)::float AS cost FROM ai_usage GROUP BY provider,model ORDER BY cost DESC`);
  const recent   = await q(sql`SELECT to_char(created_at,'DD.MM HH24:MI') AS at, feature, provider, model, total_tokens::int AS tokens, est_cost_chf::float AS cost FROM ai_usage ORDER BY id DESC LIMIT 20`);
  return { totals: totals || { calls: 0, tokens: 0, cost: 0 }, month: month || { calls: 0, cost: 0 }, daily, feats, models, recent };
}

const esc = (s: any) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const chf = (n: number) => (n < 0.01 ? n.toFixed(6) : n.toFixed(4)) + ' CHF';
const num = (n: number) => Number(n || 0).toLocaleString('fr-CH');

function render(d: any, key: string): string {
  const maxDay = Math.max(0.000001, ...d.daily.map((r: any) => r.cost));
  const bars = d.daily.map((r: any) => {
    const h = Math.max(4, Math.round((r.cost / maxDay) * 100));
    return `<div class="bar" title="${esc(r.day)} · ${chf(r.cost)} · ${r.calls} appels"><div class="fill" style="height:${h}%"></div><span>${esc(r.day)}</span></div>`;
  }).join('');
  const maxFeat = Math.max(0.000001, ...d.feats.map((r: any) => r.cost));
  const feats = d.feats.map((r: any) => {
    const w = Math.max(3, Math.round((r.cost / maxFeat) * 100));
    return `<div class="row"><div class="lbl">${esc(r.feature)}</div><div class="track"><div class="bar2" style="width:${w}%"></div></div><div class="val">${chf(r.cost)} · ${r.calls}×</div></div>`;
  }).join('') || '<p class="empty">Aucun appel encore.</p>';
  const models = d.models.map((r: any) => `<tr><td><span class="tag ${r.provider === 'infomaniak' ? 'ik' : 'an'}">${esc(r.provider)}</span></td><td>${esc(r.model)}</td><td>${num(r.calls)}</td><td>${num(r.tokens)}</td><td class="mono">${chf(r.cost)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">—</td></tr>';
  const recent = d.recent.map((r: any) => `<tr><td class="mono">${esc(r.at)}</td><td>${esc(r.feature)}</td><td><span class="tag ${r.provider === 'infomaniak' ? 'ik' : 'an'}">${esc(r.provider)}</span></td><td>${esc(r.model)}</td><td>${num(r.tokens)}</td><td class="mono">${chf(r.cost)}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Aucun appel encore. Les résumés de Luna apparaîtront ici.</td></tr>';
  const projMonth = d.month.calls > 0 ? d.month.cost : 0;

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VIVOkid · KPI IA Luna</title><style>
:root{--turq:#16C7B5;--turq2:#0CA294;--sun:#FFC233;--coral:#FF7A66;--cream:#FFF7E8;--ink:#0B3B36}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--cream);color:var(--ink);padding:18px;max-width:1000px;margin:0 auto}
header{display:flex;align-items:center;gap:12px;margin-bottom:6px}
.logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--turq),var(--turq2));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:20px}
h1{font-size:20px;font-weight:800}.sub{color:#5b726e;font-size:13px;margin:2px 0 18px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
@media(max-width:640px){.cards{grid-template-columns:repeat(2,1fr)}}
.card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 2px 10px rgba(11,59,54,.06)}
.card .k{font-size:12px;color:#5b726e;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.card .v{font-size:24px;font-weight:800;margin-top:6px}.card .v small{font-size:13px;font-weight:600;color:#5b726e}
.card.accent{background:linear-gradient(135deg,var(--turq),var(--turq2));color:#fff}.card.accent .k,.card.accent .v small{color:rgba(255,255,255,.85)}
.panel{background:#fff;border-radius:16px;padding:18px;margin-bottom:18px;box-shadow:0 2px 10px rgba(11,59,54,.06)}
.panel h2{font-size:15px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.chart{display:flex;align-items:flex-end;gap:4px;height:140px;padding-top:8px;overflow-x:auto}
.bar{flex:1;min-width:18px;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end}
.bar .fill{width:60%;background:linear-gradient(180deg,var(--turq),var(--turq2));border-radius:5px 5px 0 0;min-height:4px;transition:height .3s}
.bar span{font-size:9px;color:#5b726e;margin-top:4px;white-space:nowrap}
.row{display:flex;align-items:center;gap:10px;margin-bottom:9px}.row .lbl{width:150px;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.track{flex:1;background:#eef3f1;border-radius:8px;height:14px;overflow:hidden}.bar2{height:100%;background:linear-gradient(90deg,var(--sun),var(--coral));border-radius:8px}
.row .val{font-size:12px;color:#5b726e;width:140px;text-align:right;font-variant-numeric:tabular-nums}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #eef3f1}th{font-size:11px;text-transform:uppercase;color:#5b726e;letter-spacing:.04em}
.mono{font-variant-numeric:tabular-nums}.tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px}.tag.ik{background:#e3f7f3;color:var(--turq2)}.tag.an{background:#fff0ec;color:var(--coral)}
.empty{color:#9aaca8;text-align:center;padding:14px;font-size:13px}
footer{color:#5b726e;font-size:12px;text-align:center;margin-top:8px;line-height:1.6}
</style></head><body>
<header><div class="logo">V</div><div><h1>KPI IA — Luna</h1></div></header>
<p class="sub">IA souveraine Infomaniak 🇨🇭 · suivi des coûts en temps réel</p>
<div class="cards">
  <div class="card"><div class="k">Appels IA</div><div class="v">${num(d.totals.calls)}</div></div>
  <div class="card"><div class="k">Tokens</div><div class="v">${num(d.totals.tokens)}</div></div>
  <div class="card accent"><div class="k">Coût total</div><div class="v">${chf(d.totals.cost)}</div></div>
  <div class="card"><div class="k">Ce mois-ci</div><div class="v">${chf(projMonth)} <small>${num(d.month.calls)} appels</small></div></div>
</div>
<div class="panel"><h2>📈 Coût par jour (30 derniers jours)</h2><div class="chart">${bars || '<p class="empty">Aucune donnée.</p>'}</div></div>
<div class="panel"><h2>🧩 Par fonction</h2>${feats}</div>
<div class="panel"><h2>🤖 Par modèle</h2><table><thead><tr><th>Provider</th><th>Modèle</th><th>Appels</th><th>Tokens</th><th>Coût</th></tr></thead><tbody>${models}</tbody></table></div>
<div class="panel"><h2>🕑 Derniers appels</h2><table><thead><tr><th>Quand</th><th>Fonction</th><th>Provider</th><th>Modèle</th><th>Tokens</th><th>Coût</th></tr></thead><tbody>${recent}</tbody></table></div>
<footer>Tarifs Infomaniak : mistral3 0.30 / 0.40 CHF · 1M tokens (in/out) — hébergé en Suisse 🇨🇭<br>VIVOkid · données live depuis la table <b>ai_usage</b></footer>
</body></html>`;
}

export function createAdminRouter(): Router {
  const r = Router();
  r.use(guard);
  r.get('/ai-usage', async (_req, res) => {
    try { res.json(await aggregate()); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });
  r.get('/ai-kpi', async (req, res) => {
    try {
      const d = await aggregate();
      res.removeHeader('Content-Security-Policy');
      res.type('html').send(render(d, (req.query.key as string) || ''));
    } catch (e) { res.status(500).send('Erreur: ' + esc(String(e))); }
  });
  return r;
}
