// Optional shared pledge API. Deploy in YOUR Cloudflare account; Pages stays static.
const visitorPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
    const headers = { 'Cache-Control': 'no-store', 'Vary': 'Origin', 'Content-Type': 'application/json' };
    if (origin && !allowed.includes(origin)) return new Response(JSON.stringify({error:'Origin not allowed'}), {status:403,headers});
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    if (new URL(request.url).pathname !== '/api/pledge') return new Response(JSON.stringify({error:'Not found'}),{status:404,headers});
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'X-Dab-Visitor','Access-Control-Max-Age':'600'}});
    if (!['GET','POST'].includes(request.method)) return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{...headers,Allow:'GET, POST, OPTIONS'}});
    const visitor = request.headers.get('X-Dab-Visitor');
    if (!visitor || !visitorPattern.test(visitor)) return new Response(JSON.stringify({error:'Invalid visitor identifier'}),{status:400,headers});
    try {
      if (request.method === 'POST') await env.DB.prepare('INSERT OR IGNORE INTO pledges (visitor) VALUES (?)').bind(visitor).run();
      const [count,own] = await env.DB.batch([
        env.DB.prepare('SELECT count(*) AS count FROM pledges'),
        env.DB.prepare('SELECT visitor FROM pledges WHERE visitor = ?').bind(visitor)
      ]);
      return new Response(JSON.stringify({count:count.results[0].count,pledged:own.results.length>0}),{headers});
    } catch (error) {
      console.error('Pledge storage unavailable',error);
      return new Response(JSON.stringify({error:'Counter temporarily unavailable'}),{status:503,headers});
    }
  }
};
