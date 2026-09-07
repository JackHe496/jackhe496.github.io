import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createClient,encodeText,decodeText,validateContent} from '../assets/editor-api.mjs';
const sample = JSON.parse(await readFile(new URL('../content.json',import.meta.url),'utf8'));

function mock({login='JackHe496', push=true, advanced=false, race=false, lostReply=false}={}) {
  const writes=[];
  let head='original', refReads=0;
  return {writes, async fetch(url,options) {
    assert.equal(options.credentials,'omit');
    assert.equal(options.redirect,'error');
    assert.equal(options.headers.Authorization,'Bearer TEST_ONLY');
    const path=new URL(url).pathname.replace('/repos/JackHe496/jackhe496.github.io','');
    const body=options.body&&JSON.parse(options.body);
    const ok=data=>({ok:true,json:async()=>data});
    if(options.method==='GET') {
      if(path==='/user')return ok({login});
      if(path==='')return ok({default_branch:'main',permissions:{push}});
      if(path==='/git/ref/heads/main') {refReads++;return ok({object:{sha:advanced&&refReads>1?'newer':head}});}
      if(path==='/git/commits/original')return ok({tree:{sha:'original-tree'}});
      if(path==='/contents/content.json') {assert.equal(new URL(url).searchParams.get('ref'),'original');return ok({content:encodeText(JSON.stringify(sample))});}
    }
    writes.push({path,body});
    if(path==='/git/blobs')return ok({sha:'blob-'+writes.length});
    if(path==='/git/trees')return ok({sha:'next-tree'});
    if(path==='/git/commits')return ok({sha:'next-commit'});
    if(path==='/git/refs/heads/main'){
      assert.equal(body.force,false);
      if(race){head='other-commit';return {ok:false,status:422};}
      head=body.sha;if(lostReply)throw new TypeError('Failed to fetch');
      return ok({object:{sha:head}});
    }
    throw Error('Unexpected request '+path);
  }};
}
test('Unicode content round-trips without corrupting names or punctuation',()=>{
  const content='Jiekai He · 何杰凯\nLora — physics 🧪';assert.equal(decodeText(encodeText(content)),content);
});
test('Rejects unsafe links and malformed content',()=>{
  validateContent(sample);
  assert.throws(()=>validateContent({...sample,aboutPhoto:'javascript:alert(1)'}));
  assert.throws(()=>validateContent({...sample,researchProjects:[{title:''}]}));
  assert.throws(()=>validateContent({...sample,interests:'wrong'}));
});
test('Loads an exact revision and commits assets with content atomically',async()=>{
  const api=mock();const client=createClient('TEST_ONLY',api.fetch);const data=await client.load();
  data.aboutPhoto='/assets/uploads/photo.png';
  const result=await client.publish(data,[{path:'assets/uploads/photo.png',content:'aGVsbG8='}]);
  assert.match(result,/next-commit$/);
  const tree=api.writes.find(w=>w.path==='/git/trees').body;
  assert.equal(tree.base_tree,'original-tree');assert.deepEqual(tree.tree.map(e=>e.path),['assets/uploads/photo.png','content.json']);
  assert.deepEqual(api.writes.find(w=>w.path==='/git/commits').body.parents,['original']);
  assert.equal(api.writes.filter(w=>w.path==='/git/refs/heads/main').length,1);
});
test('Denies another account or an account without repository write access',async()=>{
  for(const options of [{login:'someone-else'},{push:false}]){const api=mock(options);await assert.rejects(createClient('TEST_ONLY',api.fetch).load());assert.equal(api.writes.length,0);}
});
test('A newer revision blocks saving before any blobs are written',async()=>{
  const api=mock({advanced:true});const client=createClient('TEST_ONLY',api.fetch);const data=await client.load();
  await assert.rejects(client.publish(data),/another session/);assert.equal(api.writes.length,0);
});
test('A race at the final update never force-overwrites the competing revision',async()=>{
  const api=mock({race:true});const client=createClient('TEST_ONLY',api.fetch);const data=await client.load();
  await assert.rejects(client.publish(data),/branch may have changed/);
  assert.equal(api.writes.at(-1).body.force,false);
});
test('A lost successful write response is reconciled without a duplicate commit',async()=>{
  const api=mock({lostReply:true});const client=createClient('TEST_ONLY',api.fetch);const data=await client.load();
  await client.publish(data);assert.equal(api.writes.filter(w=>w.path==='/git/commits').length,1);
});
