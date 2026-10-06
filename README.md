# Jiekai He — academic homepage

Source of **https://jackhe496.github.io**, served by GitHub Pages from the root of the
default branch. Plain static HTML and CSS; no build step, no framework. JavaScript is
used only for the light/dark toggle, and every page reads fine without it.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home: name, bio, contact links, portrait slot, News |
| `cv/index.html` | HTML version of the CV, mirroring the PDF |
| `assets/Jiekai_He_CV.pdf` | Downloadable one-page CV |
| `assets/site.css` | All styles (colour tokens at the top; dark theme under `html[data-theme="dark"]`) |
| `assets/site.js` | Light/dark toggle |
| `assets/fonts/` | Self-hosted WOFF2 subsets: Lora (upright, italic) and LXGW WenKai |
| `assets/og-image.png` | 1200×630 preview image used when the link is shared |
| `404.html` | Not-found page |
| `about/`, `projects/` | Redirects to `/` (old URLs from the previous version) |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Site icons ("JH" in Lora Italic) |
| `robots.txt`, `sitemap.xml` | Search-engine hints |

## Editing content

Edit the HTML directly; the text sits in plain, commented markup.

- **Bio, contact links**: `index.html`, inside `<section class="intro">`.
- **News**: add an `<li class="entry">` at the top of the list in `index.html`.
  Keep 3–6 items; drop the oldest when the list grows.
- **CV**: update `cv/index.html` **and** `assets/Jiekai_He_CV.pdf` together, so the two
  never disagree. The PDF header (email · city · homepage · GitHub) should stay in the
  Writer source as well.
- **Portrait**: put a 4:5 photo (about 480×600, WebP or JPEG) at `assets/portrait.webp`,
  then follow the comment above `<figure class="portrait">` in `index.html` — replace the
  placeholder `<div>` with the `<img>` line given there.
- **Projects** (when there is a first real item): add a `<section class="section">` to
  `index.html` below News, reusing the `entries` list markup — date on the left, title,
  one-line summary and links (report PDF, code) on the right. Add a nav link only if the
  list grows long enough to deserve its own page.

### Things to update once a year

- "second-year" in the bio (`index.html`) every September.
- `© 2026` in the footer of `index.html`, `cv/index.html`, `404.html`.
- `<lastmod>` dates in `sitemap.xml` when pages change substantially.

## Fonts

- **Lora** (English text): upright for body text, italic for headings and the site name.
- **LXGW WenKai / 霞鹜文楷** (Chinese text): applied only to CJK code points via
  `unicode-range`. The subset holds 何杰凯 plus common Chinese punctuation. Other Chinese
  characters render in the visitor's system Chinese font.

To add more Chinese characters to the WenKai subset (needs `pip install fonttools brotli`
and `LXGWWenKai-Regular.ttf` from https://github.com/lxgw/LxgwWenKai/releases):

```sh
pyftsubset LXGWWenKai-Regular.ttf \
  --text="何杰凯" \
  --unicodes="U+3000-3003,U+300A-300B,U+FF08-FF09,U+FF0C,U+FF1A-FF1B" \
  --flavor=woff2 --no-hinting --name-IDs='*' \
  --output-file=assets/fonts/lxgw-wenkai-cjk.woff2
```

Put every Chinese character the site uses into `--text`.

## Local preview

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. Pages use root-relative paths (`/assets/...`), so open them
through the server, not as `file://`.

## References and licenses

- Academic layout inspired by al-folio: https://github.com/alshedivat/al-folio
  (MIT, `licenses/al-folio-LICENSE`). This is a custom static site, not a Jekyll install.
- Colour palette from the Claude Code Obsidian theme:
  https://github.com/kleokl7/Claude-Code-Obsidian-Theme (MIT, `licenses/claude-code-orange-LICENSE`).
- Lora: https://github.com/cyrealtype/Lora-Cyrillic (SIL OFL 1.1, `licenses/Lora-OFL.txt`).
- LXGW WenKai: https://github.com/lxgw/LxgwWenKai (SIL OFL 1.1, `licenses/LXGW-WenKai-OFL.txt`).
  The subset is used solely for web delivery, as the licence's additional permission allows.
