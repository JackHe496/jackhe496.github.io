export const OWNER = 'JackHe496';
export const REPO = 'jackhe496.github.io';
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

export function encodeText(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeText(text) {
  return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g, '')), c => c.charCodeAt(0)));
}

export function validateContent(data) {
  const textFields = ['name','identity','aboutSubtitle','email','github','homeAvatar','aboutPhoto','cvPdf'];
  for (const field of textFields) {
    if (typeof data[field] !== 'string') throw new Error(`Please check ${field}.`);
  }
  if (!data.name.trim() || !data.identity.trim()) throw new Error('Name and identity are required.');
  for (const field of ['about','interests']) {
    if (!Array.isArray(data[field]) || data[field].some(v => typeof v !== 'string')) throw new Error(`Please check ${field}.`);
  }
  const safeLink = value => {
    if (!value) return;
    if (typeof value !== 'string') throw new Error('A link must be text.');
    let link;
    try { link = new URL(value, 'https://jackhe496.github.io'); } catch { throw new Error('Please check the link addresses.'); }
    if (!['https:', 'http:'].includes(link.protocol)) throw new Error('Use an https:// link or a local /assets/ path.');
  };
  for (const field of ['github','homeAvatar','aboutPhoto','cvPdf']) safeLink(data[field]);
  for (const field of ['education','researchProjects','laboratoryProjects']) {
    if (!Array.isArray(data[field])) throw new Error(`Please check ${field}.`);
    for (const item of data[field]) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Please check ${field}.`);
      if (Object.values(item).some(v => typeof v !== 'string')) throw new Error('Entry fields must be text.');
      if (field !== 'education' && !item.title?.trim()) throw new Error('Every project needs a title.');
      if (field === 'education' && !item.institution?.trim()) throw new Error('Every education entry needs an institution.');
      for (const key of ['image','report','code','poster','page']) safeLink(item[key]);
    }
  }
}

export function createClient(token, fetcher = fetch) {
  let branch, snapshot;
  async function request(path, method = 'GET', body) {
    const endpoint = path === '/user' ? 'https://api.github.com/user' : BASE + path;
    const response = await fetcher(endpoint, {
      method, cache: 'no-store', credentials: 'omit', redirect: 'error',
      headers: {Accept:'application/vnd.github+json', Authorization:`Bearer ${token}`, 'X-GitHub-Api-Version':'2022-11-28', ...(body ? {'Content-Type':'application/json'} : {})},
      ...(body ? {body:JSON.stringify(body)} : {})
    });
    if (!response.ok) {
      const messages = {
        401:'Your token is invalid or expired. Reconnect with a new token.',
        403:'GitHub denied this request. Check repository access, Contents permission, token expiry, and rate limits.',
        404:'The repository or file is unavailable. Check that this token can access jackhe496.github.io.',
        409:'The repository changed. Reload the editor before publishing again.',
        422:'GitHub could not apply this change. The branch may have changed or have protection rules. Reload before retrying.'
      };
      throw new Error(messages[response.status] || `GitHub returned error ${response.status}. Please try again later.`);
    }
    return response.json();
  }
  const getHead = () => request(`/git/ref/heads/${encodeURIComponent(branch)}`);
  return {
    async load() {
      const user = await request('/user');
      if (user.login.toLowerCase() !== OWNER.toLowerCase()) throw new Error('Please use a token belonging to JackHe496.');
      const repo = await request('');
      if (!repo.permissions?.push) throw new Error('This account does not have write access to the website repository.');
      branch = repo.default_branch;
      const head = await getHead();
      const sha = head.object.sha;
      const commit = await request(`/git/commits/${sha}`);
      const file = await request(`/contents/content.json?ref=${sha}`);
      const data = JSON.parse(decodeText(file.content));
      data.aboutSubtitle ??= 'Undergraduate in Physics · USTC';
      validateContent(data);
      snapshot = {sha, tree:commit.tree.sha};
      return data;
    },
    async publish(data, uploads = [], progress = () => {}) {
      validateContent(data);
      if (!snapshot) throw new Error('Connect to GitHub first.');
      if ((await getHead()).object.sha !== snapshot.sha) throw new Error('The website changed in another session. Reload before publishing; your draft has not been overwritten.');
      const tree = [];
      for (const [index, upload] of uploads.entries()) {
        if (!/^assets\/uploads\/[a-zA-Z0-9._-]+$/.test(upload.path)) throw new Error('Invalid upload path.');
        progress(`Uploading file ${index + 1} of ${uploads.length}…`);
        const blob = await request('/git/blobs', 'POST', {content:upload.content, encoding:'base64'});
        tree.push({path:upload.path, mode:'100644', type:'blob', sha:blob.sha});
      }
      progress('Saving website content…');
      const contentBlob = await request('/git/blobs', 'POST', {content:encodeText(JSON.stringify(data,null,2)+'\n'), encoding:'base64'});
      tree.push({path:'content.json',mode:'100644',type:'blob',sha:contentBlob.sha});
      const nextTree = await request('/git/trees', 'POST', {base_tree:snapshot.tree, tree});
      const commit = await request('/git/commits', 'POST', {message:'Update website content from web editor',tree:nextTree.sha,parents:[snapshot.sha]});
      try {
        await request(`/git/refs/heads/${encodeURIComponent(branch)}`, 'PATCH', {sha:commit.sha,force:false});
      } catch (error) {
        // A lost response may follow a successful write. Reconcile without a duplicate write.
        let current;
        try { current = await getHead(); } catch { throw new Error('Could not confirm whether GitHub saved the change. Check the repository and reload before retrying.'); }
        if (current.object.sha !== commit.sha) throw error;
      }
      snapshot = {sha:commit.sha,tree:nextTree.sha};
      return commit.html_url || `https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`;
    }
  };
}
