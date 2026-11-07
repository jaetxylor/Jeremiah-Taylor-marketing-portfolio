import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadTravel,renderTravelAlbum} from './travel.mjs';
import {geoContains} from '../assets/vendor/d3-geo.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('all 16 visited destinations have distinct map boundaries and album folders',()=>{
  const albums=loadTravel(root), world=JSON.parse(fs.readFileSync(path.join(root,'assets/travel/world.json')));
  assert.equal(albums.length,16);
  assert.deepEqual(albums.filter(d=>d.home).map(d=>d.name),['Singapore']);
  for(const album of albums){assert.ok(world.features.some(f=>f.id===album.id),album.name);assert.ok(fs.statSync(path.join(root,'assets/travel',album.slug)).isDirectory());}
  for(const [id,point] of [['840',[-100,40]],['156',[110,35]],['392',[139.7,35.7]],['250',[2.3,48.8]]]) assert.ok(geoContains(world.features.find(f=>f.id===id),point),id);
  assert.notEqual(albums.find(d=>d.name==='Hong Kong').id,albums.find(d=>d.name==='China').id);
});

test('folder uploads become public photos in natural order with safe URLs and captions',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'psr-travel-'));
  try{
    fs.mkdirSync(path.join(temp,'content'));fs.copyFileSync(path.join(root,'content/travel.json'),path.join(temp,'content/travel.json'));
    const folder=path.join(temp,'assets/travel/japan');fs.mkdirSync(folder,{recursive:true});
    for(const name of ['trip 10.JPG','trip 2.png','notes.txt'])fs.writeFileSync(path.join(folder,name),'test fixture');
    fs.writeFileSync(path.join(folder,'album.json'),JSON.stringify({'trip 2.png':{alt:'Tokyo & friends',caption:'<script>alert(1)</script>'}}));
    const album=loadTravel(temp).find(d=>d.slug==='japan');
    assert.equal(album.photos.length,2);assert.equal(album.photos[0].src,'/assets/travel/japan/trip%202.png');
    const html=renderTravelAlbum(album);assert.match(html,/Tokyo &amp; friends/);assert.match(html,/&lt;script&gt;alert/);assert.doesNotMatch(html,/<script>alert/);
    assert.match(html,/upload\/main\/assets\/travel\/japan/);assert.match(html,/data-travel-photo="1"/);
    fs.writeFileSync(path.join(folder,'phone.HEIC'),'test');assert.throws(()=>loadTravel(temp),/Convert HEIC/);
    fs.unlinkSync(path.join(folder,'phone.HEIC'));fs.unlinkSync(path.join(folder,'trip 2.png'));assert.throws(()=>loadTravel(temp),/missing image/);
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
