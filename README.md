# Christian Steiner — Website

Persönliche One-Page-Website: bold, poppig, große Typografie. Reines HTML/CSS/JS, kein Build-Schritt nötig.

## Struktur

- `index.html` — Seiteninhalt (Hero, Über mich, Werdegang, Podcast "Der Ausschuss", Kontakt)
- `css/style.css` — Design (Farben, Typografie, Layout, Animationen)
- `js/main.js` — Mobile-Menü, Cursor-Effekt, Footer-Jahr
- `assets/` — Favicon & Bilder

## Lokal ansehen

Einfach `index.html` im Browser öffnen, oder z. B.:

```bash
python3 -m http.server 8080
```

und dann `http://localhost:8080` aufrufen.

## Live schalten (GitHub Pages)

1. Repo-Einstellungen → **Pages**
2. Branch `main`, Ordner `/ (root)` auswählen
3. Speichern — die Seite ist danach unter `https://dasnaaa.github.io/website/` erreichbar

## To-do / Anpassungen

- **Echtes Foto**: `assets/` → Bild ablegen (z. B. `assets/portrait.jpg`) und in `index.html` den
  `.photo-card`-Platzhalter (aktuell ein "CS"-Monogramm) durch ein `<img>`-Tag ersetzen.
- **Podcast-Folgen**: Die drei Karten im Abschnitt "Der Ausschuss" verlinken aktuell direkt auf den
  YouTube-Kanal [`@spoeeins`](https://www.youtube.com/@spoeeins). Sobald einzelne Video-IDs feststehen,
  können sie z. B. per `<iframe src="https://www.youtube.com/embed/VIDEO_ID">` eingebettet werden.
- Farben/Fonts lassen sich zentral über die CSS-Variablen in `css/style.css` (`:root`) anpassen.
