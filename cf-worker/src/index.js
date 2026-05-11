export default {
  async fetch(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts.length < 2 || parts[1] !== 'random') {
      return new Response('Not Found', { status: 404 });
    }

    const category = parts[0];
    const params = url.searchParams;
    const redirect = params.get('redirect') === 'true';
    const typeParam = params.get('type');
    const formatsParam = params.get('formats');
    const acceptedFormats = formatsParam ? formatsParam.split(',') : null;

    const parseTagGroups = (str) =>
      str ? str.split(',').map(g => g.split('&')) : null;

    const tagGroups = parseTagGroups(params.get('tags'));
    const negTagGroups = parseTagGroups(params.get('negative_tags'));

    const entriesUrl = `https://cdn.jsdelivr.net/gh/NotPiny/Giffy/${category}/entries.json`;

    const cache = caches.default;
    const cacheKey = new Request(entriesUrl);

    let res = await cache.match(cacheKey);
    if (!res) {
      res = await fetch(entriesUrl);

      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'Category not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const toCache = res.clone();
      await cache.put(cacheKey, new Response(toCache.body, {
        status: toCache.status,
        headers: {
          ...Object.fromEntries(toCache.headers),
          'Cache-Control': 'public, max-age=300'
        }
      }));
    }

    let entries = await res.json();

    if (typeParam) entries = entries.filter(e => e.type === typeParam);

    if (tagGroups) {
      entries = entries.filter(e =>
        tagGroups.some(group => group.every(tag => e.tags.includes(tag)))
      );
    }

    if (negTagGroups) {
      entries = entries.filter(e =>
        !negTagGroups.some(group => group.every(tag => e.tags.includes(tag)))
      );
    }

    if (acceptedFormats) {
      entries = entries.filter(e => e.formats.some(f => acceptedFormats.includes(f)));
    }

    if (entries.length === 0) {
      return new Response(JSON.stringify({ error: 'No matching entries' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const entry = entries[Math.floor(Math.random() * entries.length)];

    const chosenFormat = acceptedFormats
      ? (acceptedFormats.find(f => entry.formats.includes(f)) ?? entry.formats[0])
      : entry.formats[0];

    const imageUrl = `https://cdn.jsdelivr.net/gh/NotPiny/Giffy/${category}/assets/${entry.file}.${chosenFormat}`;

    if (redirect) return Response.redirect(imageUrl, 302);

    return new Response(JSON.stringify({ ...entry, url: imageUrl }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
