/**
 * Catalistics AI - proxy Worker (Cloudflare Workers, free plan)
 *
 * What it does
 *   The assistant on workscreenftl.html talks to this Worker, and the Worker talks to
 *   Google's Gemini API. This keeps the Gemini key secret (it is never put in the web page).
 *
 * What it protects against
 *   - Strangers using your Gemini key: requests need the access code and must come from an allowed website.
 *   - Runaway usage: per-visitor rate limit and an optional daily cap.
 *
 * Settings (Cloudflare dashboard > Workers > your worker > Settings > Variables and Secrets)
 *   GEMINI_API_KEY   (secret)  key from https://aistudio.google.com/apikey
 *   ACCESS_CODE      (secret)  a code you give to management, e.g. a short phrase
 *   ALLOWED_ORIGINS  (text)    comma separated websites allowed to call this,
 *                              e.g. https://yourname.github.io,https://catalistics.co.uk
 *   GEMINI_MODEL     (text, optional) main model, default gemini-3.8-flash
 *   GEMINI_FALLBACK_MODELS (text, optional) comma separated backups used when the main model is busy,
 *                              default gemini-3.6-flash,gemini-3.5-flash-lite
 *   GEMINI_THINKING_LEVEL (text, optional) e.g. low - asks Gemini to think less, which makes it faster. Leave unset unless needed.
 *   FINANCE_PIN      (secret, optional) PIN that unlocks finance questions in the assistant. If not set, finance stays locked.
 *   PER_MINUTE       (text, optional) requests per visitor per minute, default 20
 *   DAILY_LIMIT      (text, optional) total requests per day, default 400 (needs the KV binding below)
 *   KV               (optional KV namespace binding named KV) - used only for the daily cap
 */

const DEFAULT_MODEL = 'gemini-3.8-flash';
const DEFAULT_FALLBACKS = 'gemini-3.6-flash,gemini-3.5-flash-lite';
const MAX_BODY_BYTES = 600 * 1024;
const pinTries = new Map(); // visitor -> [timestamps] of PIN attempts
const recent = new Map(); // visitor -> [timestamps]; resets when the Worker restarts, which is fine for a soft limit

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Access-Code',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function originAllowed(origin, env) {
  const list = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!list.length) return false;              // not configured: refuse rather than allow everyone
  if (list.includes('*')) return true;
  return list.includes(origin || '');
}

function underMinuteLimit(key, perMinute) {
  const now = Date.now();
  const arr = (recent.get(key) || []).filter(t => now - t < 60000);
  if (arr.length >= perMinute) { recent.set(key, arr); return false; }
  arr.push(now); recent.set(key, arr);
  if (recent.size > 2000) { for (const k of recent.keys()) { recent.delete(k); if (recent.size < 1000) break; } }
  return true;
}

async function underDailyLimit(env, limit) {
  if (!env.KV) return true;
  const day = new Date().toISOString().slice(0, 10);
  const key = 'count:' + day;
  const used = parseInt((await env.KV.get(key)) || '0', 10);
  if (used >= limit) return false;
  await env.KV.put(key, String(used + 1), { expirationTtl: 172800 });
  return true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(originAllowed(origin, env) ? origin : '') });
    }
    if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405, origin);

    if (!originAllowed(origin, env)) return json({ error: 'This website is not allowed to use the assistant.' }, 403, '');
    if (!env.GEMINI_API_KEY || !env.ACCESS_CODE) return json({ error: 'The assistant is not fully set up yet (missing key or access code).' }, 500, origin);

    if (!safeEqual(request.headers.get('X-Access-Code'), env.ACCESS_CODE)) {
      return json({ error: 'bad_code', message: 'Access code not recognised.' }, 401, origin);
    }

    const visitor = (request.headers.get('CF-Connecting-IP') || 'unknown');
    if (!underMinuteLimit(visitor, parseInt(env.PER_MINUTE || '20', 10))) {
      return json({ error: 'rate_limited', message: 'Too many questions in a short time. Please wait a minute.' }, 429, origin);
    }
    if (!(await underDailyLimit(env, parseInt(env.DAILY_LIMIT || '400', 10)))) {
      return json({ error: 'daily_limit', message: 'The daily question limit has been reached. It resets tomorrow.' }, 429, origin);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'too_large', message: 'That conversation is too long. Start a new chat.' }, 413, origin);

    let body;
    try { body = JSON.parse(raw); } catch (e) { return json({ error: 'Bad request.' }, 400, origin); }

    // Finance PIN check: the PIN lives only here, never in the web page.
    if (body && body.action === 'unlock_finance') {
      if (!env.FINANCE_PIN) return json({ error: 'pin_not_set', message: 'The finance PIN has not been set up yet.' }, 501, origin);
      const now = Date.now();
      const tries = (pinTries.get(visitor) || []).filter(t => now - t < 10 * 60000);
      if (tries.length >= 5) { pinTries.set(visitor, tries); return json({ error: 'pin_locked', message: 'Too many PIN attempts. Try again in 10 minutes.' }, 429, origin); }
      tries.push(now); pinTries.set(visitor, tries);
      if (pinTries.size > 500) { for (const k of pinTries.keys()) { pinTries.delete(k); if (pinTries.size < 250) break; } }
      if (!safeEqual(String(body.pin || '').trim(), String(env.FINANCE_PIN).trim())) return json({ error: 'bad_pin', message: 'PIN not recognised.' }, 403, origin);
      pinTries.delete(visitor);
      return json({ ok: true }, 200, origin);
    }
    if (!Array.isArray(body.contents) || !body.contents.length) return json({ error: 'Bad request.' }, 400, origin);

    // Only pass on the fields we expect, and clamp the settings.
    const gen = body.generationConfig || {};
    const payload = {
      contents: body.contents,
      generationConfig: {
        temperature: Math.min(Math.max(Number(gen.temperature ?? 0.2), 0), 1),
        maxOutputTokens: Math.min(Math.max(parseInt(gen.maxOutputTokens || 2048, 10), 256), 4096),
      },
    };
    if (body.systemInstruction) payload.systemInstruction = body.systemInstruction;
    if (Array.isArray(body.tools)) payload.tools = body.tools;
    if (body.toolConfig) payload.toolConfig = body.toolConfig;

    // Try the main model first; if Google says it is busy, out of free quota or the name is not found,
    // retry once and then fall back to the next model in the list.
    if (env.GEMINI_THINKING_LEVEL) payload.generationConfig.thinkingConfig = { thinkingLevel: String(env.GEMINI_THINKING_LEVEL).trim() };

    const clean = m => String(m || '').trim().replace(/[^a-zA-Z0-9._-]/g, '');
    const models = [env.GEMINI_MODEL || DEFAULT_MODEL, ...String(env.GEMINI_FALLBACK_MODELS || DEFAULT_FALLBACKS).split(',')]
      .map(clean).filter((m, i, arr) => m && arr.indexOf(m) === i);

    let text = '', status = 0, lastModel = '';
    outer:
    for (const model of models) {
      lastModel = model;
      for (let attempt = 0; attempt < 2; attempt++) {
        let upstream;
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 30000); // give up on a model that does not answer in 30 seconds
        try {
          upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
            body: JSON.stringify(payload),
            signal: ctl.signal,
          });
          clearTimeout(timer);
        } catch (e) { clearTimeout(timer); status = 524; text = 'No answer from ' + model + ' within 30 seconds'; continue outer; }
        status = upstream.status; text = await upstream.text();
        if (upstream.ok) break outer;
        if (status === 500 || status === 503) { await new Promise(r => setTimeout(r, 800)); continue; } // busy: retry this model once
        if (status === 429 || status === 404 || status === 502 || status === 504 || status === 524) continue outer; // quota, unknown model or timeout: next model
        break outer;                                                                                   // anything else (e.g. 400, 403): stop
      }
    }

    if (!status) return json({ error: 'upstream_unreachable', message: 'Could not reach the AI service. Try again shortly.' }, 502, origin);
    if (status !== 200) {
      let detail = '';
      try { const j = JSON.parse(text); detail = (j.error && (j.error.message || j.error.status)) || (Array.isArray(j) && j[0] && j[0].error && j[0].error.message) || ''; } catch (e) { /* ignore */ }
      if (!detail) detail = String(text || '(empty reply)').replace(/\s+/g, ' ');
      if ([429, 500, 502, 503, 504, 524].includes(status)) {
        return json({ error: 'busy', message: 'The AI service is busy or out of free capacity right now. Please try again in a minute.', detail: detail.slice(0, 300) }, 503, origin);
      }
      return json({ error: 'upstream_error', message: 'The AI service returned an error.', detail: `${lastModel} (HTTP ${status}): ${detail}`.slice(0, 500) }, 502, origin);
    }
    return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
  },
};
