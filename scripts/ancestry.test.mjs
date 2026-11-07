import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sealArchive} from './seal-ancestry.mjs';
import {unlockArchive} from '../assets/ancestry-crypto.mjs';
const fixture={people:[{id:'fixture',name:'Fixture private person'}],media:[{data:'data:image/png;base64,AQID'}]};
test('archive encrypts all records and images; rejects wrong password and tampering',async()=>{
  const password='fixture-only-key';
  const sealed=await sealArchive(password,fixture);
  assert.ok(!JSON.stringify(sealed).includes('Fixture private person'));
  assert.ok(!JSON.stringify(sealed).includes('data:image'));
  assert.deepEqual(await unlockArchive(password,sealed),fixture);
  await assert.rejects(unlockArchive('incorrect-fixture-key',sealed));
  const bytes=Buffer.from(sealed.ciphertext,'base64');bytes[20]^=1;
  await assert.rejects(unlockArchive(password,{...sealed,ciphertext:bytes.toString('base64')}));
  const other=await sealArchive(password,fixture);
  assert.notEqual(sealed.salt,other.salt);assert.notEqual(sealed.iv,other.iv);assert.notEqual(sealed.ciphertext,other.ciphertext);
});
test('build contains only an encrypted vault and excludes ancestry from indexing',()=>{
  const vault=JSON.parse(fs.readFileSync('dist/assets/ancestry.vault.json','utf8'));
  assert.deepEqual(Object.keys(vault).sort(),['v','kdf','iterations','salt','iv','ciphertext'].sort());
  const html=fs.readFileSync('dist/hobby/ancestry/index.html','utf8');
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.match(html,/type="password"/);
  assert.doesNotMatch(html,/data:image|"people"\s*:|"relations"\s*:/);
  assert.doesNotMatch(fs.readFileSync('dist/sitemap.xml','utf8'),/ancestry/);
  for(const route of ['hobby/index.html','hobby/comics/index.html','hobby/running/index.html','hobby/travelling/index.html'])assert.match(fs.readFileSync('dist/'+route,'utf8'),/href="\/hobby\/ancestry\/"/);
});
