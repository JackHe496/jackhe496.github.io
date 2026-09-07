import {createClient} from './editor-api.mjs';

const $ = id => document.getElementById(id);
let client, data, dirty = false, busy = false;
const uploads = new Map();
const objectURLs = new Map();
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function status(message) { $('status').textContent = message; }
function markDirty() { dirty = true; $('draft-state').textContent = 'Unpublished changes'; }
function valueAt(path) { return path.split('.').reduce((value,key) => value[key], data); }
function setAt(path, value) { const keys=path.split('.'); const last=keys.pop(); keys.reduce((object,key)=>object[key],data)[last]=value; markDirty(); }
function field(path, label, options = {}) {
  const value = valueAt(path) ?? '';
  const display = options.list ? value.join(options.paragraphs ? '\n\n' : '\n') : value;
  return `<div class="field"><label for="${path}">${label}</label>${options.area
    ? `<textarea id="${path}" data-path="${path}" ${options.list ? `data-list="${options.paragraphs ? 'paragraphs' : 'lines'}"` : ''} rows="${options.paragraphs ? 6 : 3}">${esc(display)}</textarea>`
    : `<input id="${path}" data-path="${path}" value="${esc(display)}" ${options.required?'required':''} ${path==='email'?'type="email"':''}>`}
    ${options.hint ? `<p class="hint">${options.hint}</p>` : ''}
    ${options.upload ? `<div class="upload-row"><input type="file" aria-label="Upload ${label}" data-upload="${path}" data-kind="${options.upload}" accept="${options.upload === 'image' ? 'image/png,image/jpeg,image/webp,image/gif' : 'application/pdf'}"><button type="button" data-clear="${path}">Clear</button></div><p class="hint">${options.upload==='image'?'PNG, JPEG, WebP, or GIF':'PDF'} · up to 5 MB. Files are published with your website.</p><div data-preview="${path}"></div>` : ''}</div>`;
}
function panel(title, body) { return `<section class="editor-panel"><h2>${title}</h2>${body}</section>`; }
function projectList(key, title) {
  return panel(title, data[key].map((p,i) => {
    const path=`${key}.${i}`;
    return `<div class="entry"><div class="entry-head"><h3>Project ${i+1}</h3><button type="button" data-remove="${path}">Remove project</button></div>
    ${field(path+'.title','Title',{required:true})}<div class="field-row">${field(path+'.date','Date')}${field(path+'.status','Status')}</div>
    ${field(path+'.summary','Summary',{area:true})}${field(path+'.contribution','My contribution',{area:true})}
    <details><summary>Images, reports, and links</summary>${field(path+'.image','Project image',{upload:'image'})}${field(path+'.imageAlt','Image description')}${field(path+'.report','Report PDF',{upload:'pdf'})}${field(path+'.reportLanguage','Report language')}${field(path+'.code','Code link')}${field(path+'.poster','Poster PDF',{upload:'pdf'})}${field(path+'.page','Project details link')}</details></div>`;
  }).join('') + `<button type="button" data-add="${key}">+ Add project</button>`);
}
function showPreviews() {
  document.querySelectorAll('[data-preview]').forEach(slot => {
    slot.replaceChildren();
    const control=document.querySelector(`[data-upload="${slot.dataset.preview}"]`);
    if (control.dataset.kind !== 'image') return;
    const value=valueAt(slot.dataset.preview);
    if (!value) return;
    let src=objectURLs.get(value);
    if (!src) {
      try { const url=new URL(value,location.origin); if (!['http:','https:'].includes(url.protocol)) return; src=url.href; } catch { return; }
    }
    const img=document.createElement('img');img.className='image-preview';img.alt='Selected image preview';img.src=src;
    img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.remove()});slot.append(img);
  });
}
function render() {
  $('fields').innerHTML = panel('Home', field('name','Name',{required:true})+field('identity','One-line introduction',{required:true})+field('homeAvatar','Home avatar',{upload:'image'}))
    + panel('About',field('aboutSubtitle','Subtitle')+field('about','Biography',{area:true,list:true,paragraphs:true,hint:'Separate paragraphs with a blank line.'})+field('interests','Research interests',{area:true,list:true,hint:'One interest per line.'})+field('aboutPhoto','Portrait',{upload:'image'}))
    + panel('Contact & CV',field('email','Email')+field('github','GitHub profile')+field('cvPdf','CV PDF',{upload:'pdf'}))
    + panel('Education',data.education.map((e,i)=>`<div class="entry"><div class="entry-head"><h3>Education ${i+1}</h3><button type="button" data-remove="education.${i}">Remove entry</button></div>${field(`education.${i}.institution`,'Institution',{required:true})}${field(`education.${i}.degree`,'Degree / programme')}<div class="field-row">${field(`education.${i}.dates`,'Dates')}${field(`education.${i}.location`,'Location')}</div></div>`).join('')+'<button type="button" data-add="education">+ Add education</button>')
    + projectList('researchProjects','Research projects')+projectList('laboratoryProjects','Undergraduate physics laboratories');
  showPreviews();
}
$('connect-form').addEventListener('submit', async event => {
  event.preventDefault();if(busy)return;busy=true;$('connect').disabled=true;
  const token=$('token').value.trim();$('token').value='';status('Connecting to your repository…');
  try {
    const next=createClient(token);const loaded=await next.load();client=next;data=loaded;
    $('connect-panel').hidden=true;$('editor-form').hidden=false;render();status('Connected. You can now edit your website.');
  } catch(error) { client=undefined;status(error.message); }
  finally {busy=false;$('connect').disabled=false;}
});
$('fields').addEventListener('input',event=>{
  const el=event.target;if (!el.dataset.path)return;
  const value=el.dataset.list ? el.value.split(el.dataset.list==='paragraphs'?/\n\s*\n/:/\n/).map(s=>s.trim()).filter(Boolean) : el.value;
  setAt(el.dataset.path,value);
});
$('fields').addEventListener('change',async event=>{
  const input=event.target;
  if (!input.dataset.upload) {if (input.dataset.path) showPreviews();return;}
  const file=input.files[0];if(!file)return;
  const imageTypes={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
  const extension=input.dataset.kind==='image'?imageTypes[file.type]:file.type==='application/pdf'?'pdf':null;
  if(!extension || file.size>5*1024*1024){status('Please choose a supported file of 5 MB or less.');input.value='';return;}
  if([...uploads.values()].reduce((sum,item)=>sum+item.size,0)+file.size>20*1024*1024){status('Please publish the current uploads before adding more than 20 MB.');input.value='';return;}
  busy=true;$('publish').disabled=true;input.disabled=true;
  try {
    const bytes=new Uint8Array(await file.arrayBuffer());
    const signature=String.fromCharCode(...bytes.slice(0,12));
    const valid=extension==='pdf'?signature.startsWith('%PDF-'):extension==='png'?bytes[0]===137&&signature.slice(1,4)==='PNG':extension==='jpg'?bytes[0]===255&&bytes[1]===216:extension==='gif'?signature.startsWith('GIF8'):signature.startsWith('RIFF')&&signature.slice(8)==='WEBP';
    if(!valid)throw new Error('The file contents do not match its image or PDF type.');
    let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
    const path=`assets/uploads/${crypto.randomUUID()}.${extension}`;
    uploads.set('/'+path,{path,content:btoa(binary),size:file.size});objectURLs.set('/'+path,URL.createObjectURL(file));
    setAt(input.dataset.upload,'/'+path);document.getElementById(input.dataset.upload).value='/'+path;showPreviews();status(`${file.name} is ready. Publish changes to upload it.`);
  } catch(error) {status(error.message);}
  finally {busy=false;$('publish').disabled=false;input.disabled=false;}
});
$('fields').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||busy)return;
  if(button.dataset.clear){setAt(button.dataset.clear,'');render();}
  if(button.dataset.remove){const [key,index]=button.dataset.remove.split('.');data[key].splice(Number(index),1);markDirty();render();}
  if(button.dataset.add){const key=button.dataset.add;data[key].push(key==='education'?{institution:'',degree:'',dates:'',location:''}:{title:'',date:'',status:'',summary:'',contribution:'',image:'',imageAlt:'',report:'',reportLanguage:'',code:'',poster:'',page:''});markDirty();render();}
});
$('editor-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!client)return;
  if(!dirty){status('There are no unpublished changes.');return;}
  busy=true;$('editor-fields').disabled=true;$('publish').disabled=true;$('disconnect').disabled=true;
  status('Preparing your changes…');
  try {
    const references=new Set([data.homeAvatar,data.aboutPhoto,data.cvPdf,...data.researchProjects.flatMap(p=>[p.image,p.report,p.poster]),...data.laboratoryProjects.flatMap(p=>[p.image,p.report,p.poster])]);
    const selected=[...uploads.entries()].filter(([path])=>references.has(path)).map(([,file])=>file);
    const commit=await client.publish(data,selected,status);
    dirty=false;uploads.clear();$('draft-state').textContent='All changes saved';
    status('Saved to GitHub. Your public website will update when GitHub Pages finishes deploying. ');
    const link=document.createElement('a');link.href=commit;link.target='_blank';link.rel='noopener noreferrer';link.textContent='View saved change ↗';$('status').append(link);
  } catch(error) {status(error.message);}
  finally {busy=false;$('editor-fields').disabled=false;$('publish').disabled=false;$('disconnect').disabled=false;$('status').scrollIntoView({block:'nearest'});}
});
$('disconnect').addEventListener('click',()=>{
  if(busy)return;
  if(dirty&&!confirm('Disconnect and discard unpublished changes?'))return;
  client=undefined;data=undefined;dirty=false;uploads.clear();for(const src of objectURLs.values())URL.revokeObjectURL(src);objectURLs.clear();
  $('fields').replaceChildren();$('editor-form').hidden=true;$('connect-panel').hidden=false;$('draft-state').textContent='All changes saved';status('Disconnected.');
});
window.addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
