function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatDate(iso) {
  try {
    return new Date(iso + "T00:00:00Z").toLocaleDateString("de-AT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch (e) {
    return iso;
  }
}

function renderNav() {
  return `<header class="nav">
  <a href="/#top" class="nav__logo">CS<span class="dot">.</span></a>
  <nav class="nav__links">
    <a href="/#about">Über mich</a>
    <a href="/#kompetenzen">Kompetenzen</a>
    <a href="/#skills">Skills</a>
    <a href="/#stationen">Stationen</a>
    <a href="/#ausschuss">Der Ausschuss</a>
    <a href="/blog">Blog</a>
    <a href="/#angebote">Zusammenarbeit</a>
    <a href="/#kontakt">Kontakt</a>
  </nav>
  <button class="nav__burger" id="burger" aria-label="Menü öffnen" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</header>`;
}

function renderFooter() {
  return `<footer class="kontakt" id="kontakt">
    <div class="section-label section-label--light">KONTAKT</div>
    <h2 class="big-heading big-heading--light">LASS UNS<br>REDEN.</h2>
    <div class="kontakt__grid">
      <a href="mailto:hi.christian.steiner@gmail.com" class="kontakt__link">✉️ hi.christian.steiner@gmail.com</a>
      <a href="https://www.linkedin.com/in/hi-christian-steiner" target="_blank" rel="noopener" class="kontakt__link">in LinkedIn</a>
      <a href="https://www.youtube.com/@spoeeins" target="_blank" rel="noopener" class="kontakt__link">▶ Der Ausschuss</a>
    </div>
    <p class="kontakt__copy">© <span id="year"></span> Christian Steiner — Wien</p>
    <div class="impressum" id="impressum">
      <h3>Impressum</h3>
      <p>
        Christian Steiner e.U. | wrkt GesBR<br>
        1220 Wien, Österreich<br>
        E-Mail: <a href="mailto:hi.christian.steiner@gmail.com">hi.christian.steiner@gmail.com</a><br>
        Telefon: +43 650 5800 578<br>
        Unternehmensgegenstand: Kommunikations- und Medienberatung
      </p>
    </div>
  </footer>`;
}

function pageShell({ title, description, canonical, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Christian Steiner">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="de_AT">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Archivo+Black&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<div class="cursor-blob" aria-hidden="true"></div>
${renderNav()}
${bodyHtml}
${renderFooter()}
<script src="/js/main.js"></script>
</body>
</html>
`;
}

function renderBlogList(posts) {
  const cards = posts.length
    ? posts
        .map(
          (p) => `      <a class="blog-card" href="/blog/${escapeHtml(p.slug)}">
        <span class="blog-card__date">${formatDate(p.date)}</span>
        <h2>${escapeHtml(p.title)}</h2>
        ${p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : ""}
      </a>`
        )
        .join("\n")
    : `      <p class="blog-empty">Bald gibt es hier die ersten Texte.</p>`;

  const body = `<main id="top">
  <section class="blog-hero" id="blog-hero">
    <div class="section-label">BLOG</div>
    <h1 class="big-heading">NOTIZEN<br>&amp; TEXTE</h1>
    <p class="lead">Gedanken zu digitaler Strategie, Kampagnen und Kommunikation.</p>
  </section>
  <section class="blog-list">
${cards}
  </section>
</main>`;

  return pageShell({
    title: "Blog — Christian Steiner",
    description: "Notizen und Texte von Christian Steiner zu digitaler Strategie, Kampagnen und Kommunikation.",
    canonical: "https://wrkt.at/blog",
    bodyHtml: body,
  });
}

function renderBlogPost(post) {
  const body = `<main id="top">
  <article class="blog-post">
    <a class="blog-post__back" href="/blog">← Zurück zum Blog</a>
    <span class="blog-post__date">${formatDate(post.date)}</span>
    <h1 class="big-heading">${escapeHtml(post.title)}</h1>
    <div class="blog-post__body">${post.bodyHtml}</div>
  </article>
</main>`;

  return pageShell({
    title: `${post.title} — Blog — Christian Steiner`,
    description: post.excerpt || post.title,
    canonical: `https://wrkt.at/blog/${post.slug}`,
    bodyHtml: body,
  });
}

async function renderSitemap(env) {
  const urls = [
    { loc: "https://wrkt.at/", priority: "1.0" },
    { loc: "https://wrkt.at/blog", priority: "0.8" },
  ];
  try {
    if (env.BLOG) {
      const raw = await env.BLOG.get("posts:index");
      const posts = raw ? JSON.parse(raw) : [];
      for (const p of posts) {
        urls.push({ loc: `https://wrkt.at/blog/${p.slug}`, priority: "0.6", lastmod: p.date });
      }
    }
  } catch (e) {
    // KV not reachable — fall back to the static two URLs above.
  }
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

    if (path === "/sitemap.xml") {
      const xml = await renderSitemap(env);
      return new Response(xml, {
        headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
      });
    }

    if (path === "/blog" && env.BLOG) {
      const raw = await env.BLOG.get("posts:index");
      const posts = raw ? JSON.parse(raw) : [];
      return new Response(renderBlogList(posts), { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    if (path.startsWith("/blog/") && env.BLOG) {
      const slug = path.slice("/blog/".length);
      if (slug) {
        const raw = await env.BLOG.get(`post:${slug}`);
        if (raw) {
          const post = JSON.parse(raw);
          post.slug = slug;
          return new Response(renderBlogPost(post), { headers: { "content-type": "text/html; charset=utf-8" } });
        }
      }
    }

    const asset = ASSETS[path];
    if (asset) {
      return new Response(asset.body, {
        headers: { "content-type": asset.type, "cache-control": "public, max-age=300" },
      });
    }

    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
