# Jiekai He — academic homepage

An English academic website for **JackHe496**, ready for GitHub Pages at
**https://jackhe496.github.io**. This version has no ChatGPT Sites dependency.

The design uses Claude Code Orange's warm cream background, self-hosted Lora
Italic, a framed Chiikawa avatar, and the existing Home / About / Projects / CV
layout. It is a custom static adaptation inspired by al-folio, not a Jekyll
installation of al-folio.

## First deployment

1. Create the public repository **JackHe496/jackhe496.github.io**. Initialize it
   with a README so it has a default branch.
2. Copy this package's contents to the repository root, preserving the folders
   and `.nojekyll` file. Do not upload the containing folder as an extra layer.
3. In the repository, open **Settings → Pages**. Select **Deploy from a branch**,
   the default branch (usually **main**), and **/ (root)**. Save.
4. Wait for the Pages deployment to finish. Visit **https://jackhe496.github.io**.

GitHub's account-site domain follows the account's username. A repository named
`JackHe.github.io` under `JackHe496` does not give that account the domain
`JackHe.github.io`.

## Maintain the website

Website changes are maintained through this GitHub repository. Ask Codex to update
the content or design and publish the changes through GitHub Pages.

## Edit files directly

All personal content is in `content.json`:

- `name`, `identity`: navigation name and one-line Home introduction.
- `homeAvatar`, `aboutPhoto`: independent image paths. Leave the portrait empty
  until you choose a photograph.
- `aboutSubtitle`, `about`, `interests`: About text and research interests.
- `email`, `github`, `cvPdf`: optional links, hidden when empty.
- `education`: CV entries.
- `researchProjects`, `laboratoryProjects`: project collections.

Project fields: `title`, `date`, `status`, `summary`, `contribution`, `image`,
`imageAlt`, `report`, `reportLanguage`, `code`, `poster`, `page`.
Use an HTTPS URL or a site-root path such as `/assets/report.pdf` for links.

## Local development

No build or package installation is needed:

```sh
python -m http.server 8000
```

Open `http://localhost:8000` to preview the website.

## References and licenses

- Minimal Home reference: https://jingzzeng.github.io/ (no personal text or photo copied).
- Academic layout: https://github.com/alshedivat/al-folio (MIT, retained in `licenses/`).
- Colors: https://github.com/kleokl7/Claude-Code-Obsidian-Theme (MIT, retained in `licenses/`).
- Lora Italic: https://github.com/google/fonts/tree/main/ofl/lora (SIL Open Font License,
  retained beside the self-hosted font in `assets/`).

No commercial Claude font, logo, or interface source is included.
