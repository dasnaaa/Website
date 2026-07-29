# Blog publizieren

Der Blog unter `/blog` wird zur Laufzeit vom Worker (`worker/worker.tpl.js`) aus einem
Cloudflare KV-Namespace gerendert. Es gibt **keine öffentliche Schreib-Route** — neue
Beiträge landen ausschließlich über direkte KV-Writes via Cloudflare API (durch Claude,
z. B. in einem Chat oder Cowork-Sitzung mit Zugriff auf das Cloudflare-Konto).

## Setup (bereits erledigt)

- KV-Namespace: **`wrkt-blog`**, id `a706afa293554081b0813e0e2db12f72`
- An den Worker `christian-steiner-website` gebunden als `env.BLOG`
- Account-ID: `da5d897550fb4da9c72b0ed9087f4f88`

## Datenmodell

Zwei Arten von Keys im Namespace:

- `posts:index` — JSON-Array aller Beiträge, **absteigend nach Datum sortiert**, für die
  Listenseite `/blog`:
  ```json
  [
    { "slug": "mein-erster-post", "title": "Titel", "date": "2026-08-01", "excerpt": "Kurzer Teaser." }
  ]
  ```
- `post:<slug>` — vollständiger Beitrag, für `/blog/<slug>`:
  ```json
  {
    "title": "Titel",
    "date": "2026-08-01",
    "excerpt": "Kurzer Teaser.",
    "bodyHtml": "<p>Fließtext als einfaches HTML (p, h2, h3, strong, a, ul/ol, blockquote).</p>"
  }
  ```

`slug` nur Kleinbuchstaben, Zahlen, Bindestriche (URL-sicher). `bodyHtml` ist vertrauenswürdiger
Inhalt (kein User-Input) und wird ungefiltert eingebettet — hier also nur Inhalte einfügen,
die auch wirklich veröffentlicht werden sollen.

## Neuen Beitrag veröffentlichen

Mit Zugriff auf die `cloudflare-api` MCP-Tools (`execute`) in einem Claude-Chat:

1. `post:<slug>` per `PUT` auf
   `/accounts/{accountId}/storage/kv/namespaces/a706afa293554081b0813e0e2db12f72/values/post:<slug>`
   mit dem JSON-Body oben schreiben (kein `rawBody`, kein `contentType` nötig — ein JS-Objekt
   als `body` wird automatisch korrekt als JSON gespeichert).
2. `posts:index` neu lesen (`GET` auf denselben Namespace, Key `posts:index`), den neuen
   Eintrag voranstellen (neueste zuerst) und mit `PUT` zurückschreiben.
3. Fertig — keine Neubereitstellung des Workers nötig, die Seite liest live aus KV.

Beispiel-Snippet für den `execute`-Call:

```js
async () => {
  const ns = "a706afa293554081b0813e0e2db12f72";
  const slug = "mein-erster-post";
  const post = {
    title: "Mein erster Post",
    date: "2026-08-01",
    excerpt: "Kurzer Teaser für die Liste.",
    bodyHtml: "<p>Text des Beitrags.</p>",
  };
  await cloudflare.request({
    method: "PUT",
    path: `/accounts/${accountId}/storage/kv/namespaces/${ns}/values/post:${slug}`,
    body: post,
  });

  const idxRes = await cloudflare.request({
    method: "GET",
    path: `/accounts/${accountId}/storage/kv/namespaces/${ns}/values/posts:index`,
  });
  const index = idxRes.result ? JSON.parse(idxRes.result) : [];
  index.unshift({ slug, title: post.title, date: post.date, excerpt: post.excerpt });

  await cloudflare.request({
    method: "PUT",
    path: `/accounts/${accountId}/storage/kv/namespaces/${ns}/values/posts:index`,
    body: index,
  });

  return { done: true };
}
```

## Beitrag löschen / bearbeiten

- Bearbeiten: `post:<slug>` überschreiben (gleicher Weg wie oben) und ggf. den Eintrag in
  `posts:index` anpassen.
- Löschen: `DELETE` auf `.../values/post:<slug>`, dann den Eintrag aus `posts:index` entfernen.

## Sitemap

`/sitemap.xml` wird ebenfalls dynamisch generiert und listet automatisch alle Beiträge aus
`posts:index` — nach dem Veröffentlichen ist nichts weiter zu tun.

## Worker-Quellcode ändern (Layout, Styles, Routing)

Der komplette Worker wird aus den statischen Site-Dateien plus `worker/worker.tpl.js` gebaut:

```
node worker/build.js   # erzeugt dist/worker.js
```

`dist/worker.js` wird anschließend über die Cloudflare API (`workers/scripts/christian-steiner-website`)
deployt — dabei den Bundle-Text base64-kodiert per KV-Staging in die Ausführungsumgebung
übertragen (nicht direkt als Text einfügen — das Bundle enthält Backticks/`${}` aus den
Blog-Templates) und im Sandbox mit `atob()` + `TextDecoder("utf-8")` dekodieren, **nicht**
mit `atob()` allein (das zerstört Umlaute).
