export default {
  async fetch(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    // /:genre — return list of categories for that genre
    if (parts.length === 1) {
      const [genre] = parts;
      const entriesUrl = `https://raw.githubusercontent.com/NotPiny/Giffy/main/${genre}/entries.json`;

      let res;
      try {
        const cache = caches.default;
        const cacheKey = new Request(entriesUrl);

        res = await cache.match(cacheKey);
        if (!res) {
          res = await fetch(entriesUrl);
          if (res.ok) {
            const toCache = res.clone();
            const headers = new Headers(toCache.headers);
            headers.set('Cache-Control', 'public, max-age=300');
            await cache.put(cacheKey, new Response(toCache.body, {
              status: toCache.status,
              headers
            }));
          }
        }
      } catch {
        res = await fetch(entriesUrl);
      }

      if (!res || !res.ok) {
        return new Response(JSON.stringify({ error: 'Genre not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const entries = await res.json();
      const categories = [...new Set(entries.map(e => e.category))];

      return new Response(JSON.stringify(categories), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Expect /:genre/:category/random
    if (parts.length < 3 || parts[2] !== 'random') {
      return new Response('Not Found', { status: 404 });
    }

    const [genre, category] = parts;
    const params = url.searchParams;
    const redirect = params.get('redirect') === 'true';
    const typeParam = params.get('type');
    const formatsParam = params.get('formats');
    const acceptedFormats = formatsParam ? formatsParam.split(',') : null;

    const parseTagGroups = (str) =>
      str ? str.split(',').map(g => g.split('&')) : null;

    const tagGroups = parseTagGroups(params.get('tags'));
    const negTagGroups = parseTagGroups(params.get('negative_tags'));

    const entriesUrl = `https://raw.githubusercontent.com/NotPiny/Giffy/main/${genre}/entries.json`;

    let res;
    try {
      const cache = caches.default;
      const cacheKey = new Request(entriesUrl);

      res = await cache.match(cacheKey);
      if (!res) {
        res = await fetch(entriesUrl);
        if (res.ok) {
          const toCache = res.clone();
          // Build headers manually to avoid spread issues
          const headers = new Headers(toCache.headers);
          headers.set('Cache-Control', 'public, max-age=300');
          await cache.put(cacheKey, new Response(toCache.body, {
            status: toCache.status,
            headers
          }));
        }
      }
    } catch {
      // Cache failed, fall back to a direct fetch
      res = await fetch(entriesUrl);
    }

    if (!res || !res.ok) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let entries = await res.json();
    entries = entries.filter(e => e.category === category);

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

    const imageUrl = `https://cdn.jsdelivr.net/gh/NotPiny/Giffy/${genre}/assets/${entry.file}.${chosenFormat}`;

    if (redirect) return Response.redirect(imageUrl, 302);

    return new Response(JSON.stringify({ ...entry, url: imageUrl }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
