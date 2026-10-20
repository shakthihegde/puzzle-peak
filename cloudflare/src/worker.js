// Puzzle Peak sync: stores one progress record per family code, and nothing else.
// The family code is never stored; rows are keyed by its SHA-256 hash.
const KEY_RE = /^peak(-[a-z0-9]{4}){4}$/;
const MAX_DATA = 200000;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    if (req.method === 'GET' && url.pathname === '/') return reply({ ok: true, service: 'puzzle-peak-sync' });
    if (req.method !== 'POST') return reply({ ok: false, error: 'method not allowed' }, 405);
    if (allowed.length && !allowed.includes(origin)) return reply({ ok: false, error: 'origin not allowed' }, 403);

    let body;
    try {
      const text = await req.text();
      if (text.length > MAX_DATA + 1000) return reply({ ok: false, error: 'too big' }, 413);
      body = JSON.parse(text);
    } catch {
      return reply({ ok: false, error: 'bad request' }, 400);
    }
    if (!KEY_RE.test(body.key || '')) return reply({ ok: false, error: 'bad family code' }, 400);
    const id = await sha256('puzzle-peak:' + body.key);

    if (url.pathname === '/v1/load') {
      const row = await env.DB.prepare('SELECT data, updated FROM progress WHERE id = ?1').bind(id).first();
      return reply({ ok: true, data: row ? row.data : null, updated: row ? row.updated : 0 });
    }
    if (url.pathname === '/v1/save') {
      const data = body.data;
      if (typeof data !== 'string' || data.length > MAX_DATA || !/^PP[01][A-Za-z0-9+/=]+$/.test(data)) return reply({ ok: false, error: 'bad data' }, 400);
      const now = Date.now();
      // Only replace the copy this device last loaded (base); otherwise it must load and merge again.
      const res = await env.DB.prepare('INSERT INTO progress (id, data, updated) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET data = ?2, updated = ?3 WHERE progress.updated = ?4')
        .bind(id, data, now, Number(body.base) || 0).run();
      if (!res.meta.changes) return reply({ ok: false, conflict: true }, 409);
      return reply({ ok: true, updated: now });
    }
    if (url.pathname === '/v1/delete') {
      await env.DB.prepare('DELETE FROM progress WHERE id = ?1').bind(id).run();
      return reply({ ok: true });
    }
    return reply({ ok: false, error: 'not found' }, 404);
  },
};

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
