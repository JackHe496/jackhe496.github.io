(() => {
 'use strict';
 const root=document.documentElement;
 let savedTheme;try{savedTheme=localStorage.getItem('jiekai-theme')}catch{}
 root.dataset.theme=savedTheme==='dark'?'dark':'light';
 document.querySelector('.theme-toggle').addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;try{localStorage.setItem('jiekai-theme',next)}catch{};themeLabel()});
 function themeLabel(){document.querySelector('.theme-toggle').setAttribute('aria-label',root.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode')};themeLabel();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function url(s){if(typeof s!=='string'||!s.trim())return '';try{const u=new URL(s,location.href);return ['http:','https:','mailto:'].includes(u.protocol)?u.href:''}catch{return ''}}
 function image(src,alt){return url(src)?`<img src="${esc(url(src))}" alt="${esc(alt)}">`:''}
 function link(src,label,cls=''){return url(src)?`<a class="${cls}" href="${esc(url(src))}">${esc(label)}</a>`:''}
 function contacts(d){return `<div class="contact">${d.email?link('mailto:'+d.email,'Email'):''}${link(d.github,'GitHub')}${link(d.cvPdf,'CV · PDF')}</div>`}
 function cards(items){return `<div class="projects-grid">${items.map(p=>`<article class="project-card">${image(p.image,p.imageAlt||p.title)}<div class="card-body"><div class="meta">${esc(p.date)}${p.status?' · '+esc(p.status):''}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${p.contribution?`<p><strong>My contribution.</strong> ${esc(p.contribution)}</p>`:''}<div class="project-links">${link(p.report,'Report'+(p.reportLanguage?' · '+p.reportLanguage:''))}${link(p.code,'Code')}${link(p.poster,'Poster')}${link(p.page,'Project details')}</div></div></article>`).join('')}</div>`}
 fetch('/content.json', {cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('content');return r.json()}).then(d=>{
  document.querySelector('.brand').textContent=d.name;
  const page=document.body.dataset.page;document.title=(page==='home'?'':page.charAt(0).toUpperCase()+page.slice(1)+' · ')+d.name;
  const main=document.getElementById('main');
  if(page==='home')main.innerHTML=`<figure class="home-avatar ${d.homeAvatar?'':'is-empty'}" aria-label="${d.homeAvatar?'Chiikawa avatar':'Avatar space reserved'}">${image(d.homeAvatar,'Chiikawa avatar')}</figure><p class="identity">${esc(d.identity)}</p>`;
  if(page==='about')main.innerHTML=`<h1 class="page-heading">${esc(d.name)}</h1><p class="subtitle">${esc(d.aboutSubtitle || 'Undergraduate in Physics · USTC')}</p><div class="about-grid"><div class="prose">${d.about.map(p=>`<p>${esc(p)}</p>`).join('')}<h2>Research interests</h2><ul class="interest-list">${d.interests.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>${contacts(d)}</div><figure class="portrait ${d.aboutPhoto?'':'is-empty'}" aria-label="${d.aboutPhoto?'Portrait of '+esc(d.name):'Portrait space reserved'}">${image(d.aboutPhoto,'Portrait of '+d.name)}</figure></div>`;
  if(page==='projects')main.innerHTML=`<h1 class="page-heading">Projects</h1><section aria-labelledby="research-title"><div class="section-title"><h2 id="research-title">Research projects</h2></div><p class="section-description">Research contributions and progress.</p>${d.researchProjects.length?cards(d.researchProjects):'<p class="empty">Research projects will be added as they develop.</p>'}</section><section aria-labelledby="labs-title"><div class="section-title"><h2 id="labs-title">Undergraduate physics laboratories</h2></div><p class="section-description">Selected laboratory reports, measurements, and data analysis.</p>${d.laboratoryProjects.length?cards(d.laboratoryProjects):'<p class="empty">Selected laboratory reports will appear here.</p>'}</section>`;
  if(page==='cv')main.innerHTML=`<div class="cv-heading"><h1 class="page-heading">Curriculum vitae</h1>${link(d.cvPdf,'Download PDF','download')}</div><p class="subtitle">${esc(d.name)}</p><section class="cv-section"><h2>Education</h2>${d.education.map(e=>`<div class="cv-entry"><div class="date">${esc(e.dates)}</div><div><h3>${esc(e.institution)}</h3><p>${esc(e.degree)}</p><p class="place">${esc(e.location)}</p></div></div>`).join('')}</section><section class="cv-section"><h2>Research interests</h2><p>${d.interests.map(esc).join(' · ')}</p></section>${contacts(d)}`;
  document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.parentElement.classList.add('is-empty')}));
  document.querySelector('[data-copyright]').textContent='© '+new Date().getFullYear()+' '+d.name;
 }).catch(()=>{document.getElementById('main').innerHTML='<p class="error">This page could not be loaded. Please refresh to try again.</p>'});
})();
