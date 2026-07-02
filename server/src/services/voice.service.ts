// ============================================================
// KIDO — Voice Check-in Service
// Pattern: winwin-voice-agent → Deepgram STT + Anthropic parse
// "Je rentre, j'arrive dans 20 minutes" → ETA extrait par IA
// ============================================================
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface VoiceCheckinResult {
  transcript: string;
  type: 'ok' | 'arriving' | 'late' | 'callback' | 'custom';
  etaMinutes?: number;
  message: string;
  confidence: number;
}

export async function parseVoiceCheckin(transcript: string): Promise<VoiceCheckinResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { transcript, type: 'custom', message: transcript, confidence: 0 };
  }

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    system: `Tu extrais des informations structurées d'un message vocal d'enfant à ses parents.
Réponds UNIQUEMENT en JSON valide, sans markdown.
Format: {"type":"arriving|ok|late|callback|custom","etaMinutes":null_ou_nombre,"message":"résumé","confidence":0_à_1}

Types:
- "arriving": l'enfant dit qu'il rentre (extraire les minutes si mentionnées)
- "ok": l'enfant confirme qu'il va bien
- "late": l'enfant dit qu'il sera en retard
- "callback": l'enfant demande à être rappelé
- "custom": autre message`,
    messages: [{ role: 'user', content: `Message vocal: "${transcript}"` }],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text);
    return { transcript, ...parsed };
  } catch {
    return { transcript, type: 'custom', message: transcript, confidence: 0.5 };
  }
}

// Transcribe audio using Deepgram REST API (simpler than WebSocket for short clips)
export async function transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/webm'): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error('DEEPGRAM_API_KEY not configured');

  const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=fr', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': mimeType,
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!response.ok) throw new Error(`Deepgram error: ${response.status}`);
  const data = await response.json() as { results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> } };
  return data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
}
