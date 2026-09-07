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

## Edit on the website

Open **Edit** in the navigation bar, or visit **/edit/**.

For the first connection:

1. In GitHub, open **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. Use **JackHe496** as the resource owner. Set an expiration date.
3. Choose **Only select repositories**, then select **jackhe496.github.io**.
4. Under repository permissions, set **Contents** to **Read and write**.
   Metadata read access is supplied by GitHub. No workflow or account-wide
   permission is needed by the editor.
5. Generate the token and paste it into the website's **GitHub token** field.
   Do not paste it into ChatGPT, your biography, or a repository file.

The editor keeps the token only in memory for the open tab. It calls GitHub
directly over HTTPS; it has no third-party authentication server. Refreshing or
disconnecting clears the token. This is a token-based connection, not OAuth
single sign-on.

You can edit all current personal content, add or remove education entries,
research projects and laboratory reports, and upload pictures or PDFs (5 MB per
file, 20 MB of staged uploads per publish). Uploaded assets and the shared content
file are committed together. Clicking **Publish changes** saves to GitHub;
the public site updates after the GitHub Pages deployment completes.

Only the repository owner with write access can publish through the editor.
Other visitors can see the editor's connection page but cannot change the site.
No token is bundled with the website, stored in browser storage, or sent to an
image host. The editor refuses to overwrite a newer branch revision. If you
edit from two tabs, reload and reapply the draft after a conflict. Unsaved form
changes are held only in the current tab, with a warning before leaving.

Removing a picture or project removes its reference from the website. It does
not erase older uploads or Git history. Keep private and unpublished material
out of this public repository.

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

Open `http://localhost:8000`. The editor connects to the real GitHub repository,
so publishing from a local preview still changes the public site.

The focused editor tests run with:

```sh
node --test tests/editor-api.test.mjs
```

These tests use a fake GitHub API and never write to a live repository.

## References and licenses

- Minimal Home reference: https://jingzzeng.github.io/ (no personal text or photo copied).
- Academic layout: https://github.com/alshedivat/al-folio (MIT, retained in `licenses/`).
- Colors: https://github.com/kleokl7/Claude-Code-Obsidian-Theme (MIT, retained in `licenses/`).
- Lora Italic: https://github.com/google/fonts/tree/main/ofl/lora (SIL Open Font License,
  retained beside the self-hosted font in `assets/`).

No commercial Claude font, logo, or interface source is included.
