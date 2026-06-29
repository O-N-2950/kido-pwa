// ============================================================
// KIDO — Service IA souverain (Infomaniak AI Tools)
// Priorité : Infomaniak (hébergé 🇨🇭) ; fallback Anthropic.
// Logge chaque appel dans ai_usage (KPI coûts).
// ============================================================
import { db, schema } from '../db/index.js';

const IK_BASE  = 'https://api.infomaniak.com';
const PRODUCT  = process.env.INFOMANIAK_AI_PRODUCT_ID || '109625';
const IK_TOKEN = process.env.INFOMANIAK_AI_TOKEN || '';
const MODEL    = process.env.INFOMANIAK_AI_MODEL || 'mistral3';

// Tarifs publics Infomaniak — CHF / 1M tokens (in / out)
const RATES: Record<string, { in: number; out: number }> = {
  mistral3:   { in: 0.30, out: 0.40 },
  mistral24b: { in: 0.25, out: 0.50 },
  qwen3:      { in: 0.40, out: 3.20 },
};
function estCostChf(model: string, pIn: number, pOut: number): string {
  const r = RATES[model] || { in: 0.30, out: 0.40 };
  return (pIn / 1e6 * r.in + pOut / 1e6 * r.out).toFixed(6);
}

interface AIResult { text: string; provider: string; model: string; promptTokens: number; completionTokens: number; }

async function callInfomaniak(system: string, user: string, maxTokens: number): Promise<AIResult> {
  const res = await fetch(`${IK_BASE}/1/ai/${PRODUCT}/openai/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${IK_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: maxTokens, temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`IK ${res.status} ${(await res.text()).slice(0, 140)}`);
  const d = await res.json() as any;
  const u = d.usage || {};
  return {
    text: d.choices?.[0]?.message?.content ?? '',
    provider: 'infomaniak', model: MODEL,
    promptTokens: u.prompt_tokens ?? 0, completionTokens: u.completion_tokens ?? 0,
  };
}

async function callAnthropic(system: string, user: string, maxTokens: number): Promise<AIResult> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const m = await client.messages.create({
    model: 'claude-haiku-4-5', max_tokens: maxTokens, system,
    messages: [{ role: 'user', content: user }],
  });
  return {
    text: m.content[0]?.type === 'text' ? m.content[0].text : '',
    provider: 'anthropic', model: 'claude-haiku-4-5',
    promptTokens: m.usage?.input_tokens ?? 0, completionTokens: m.usage?.output_tokens ?? 0,
  };
}

async function logUsage(r: AIResult, feature: string, familyId?: string): Promise<void> {
  await db.insert(schema.aiUsage).values({
    familyId: familyId ?? null,
    feature, provider: r.provider, model: r.model,
    promptTokens: r.promptTokens, completionTokens: r.completionTokens,
    totalTokens: r.promptTokens + r.completionTokens,
    estCostChf: estCostChf(r.model, r.promptTokens, r.completionTokens),
  });
}

export async function aiComplete(opts: {
  system: string; user: string; feature: string; maxTokens?: number; familyId?: string;
}): Promise<string> {
  const { system, user, feature, maxTokens = 300, familyId } = opts;
  let r: AIResult | null = null;

  if (IK_TOKEN) {
    try { r = await callInfomaniak(system, user, maxTokens); }
    catch (e) { console.warn('[ai] Infomaniak KO → fallback:', String(e).slice(0, 120)); }
  }
  if (!r && process.env.ANTHROPIC_API_KEY) {
    try { r = await callAnthropic(system, user, maxTokens); }
    catch (e) { console.warn('[ai] Anthropic KO:', String(e).slice(0, 120)); }
  }
  if (!r) return '';

  try { await logUsage(r, feature, familyId); }
  catch (e) { console.warn('[ai] log KPI KO:', String(e).slice(0, 120)); }
  return r.text;
}
