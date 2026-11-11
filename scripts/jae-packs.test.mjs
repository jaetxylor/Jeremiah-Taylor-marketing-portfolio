import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CARDS,rollPack,parseSave,addPack,emptySave} from '../assets/jae-packs-core.mjs';
function fixedChase(x,pick=.25){let n=0;return ()=>n++===4?x:pick;}
test('50 unique cards, two secrets, both Prime forms and all art files',()=>{
 assert.equal(CARDS.length,50);assert.equal(new Set(CARDS.map(c=>c.id)).size,50);
 assert.deepEqual(Object.fromEntries(['common','uncommon','rare','super','secret'].map(r=>[r,CARDS.filter(c=>c.rarity===r).length])),{common:24,uncommon:14,rare:8,super:2,secret:2});
 for(const c of CARDS)assert.ok(fs.existsSync(new URL(`../assets/jae-cards/${String(c.id).padStart(2,'0')}.svg`,import.meta.url)));
 assert.equal(CARDS[46].art,'robot');assert.equal(CARDS[47].art,'truck');
});
test('20,000 equal chase intervals verify exact odds and five distinct cards per pack',()=>{
 const totals={common:0,uncommon:0,rare:0,super:0,secret:0};
 for(let i=0;i<20000;i++){
  const p=rollPack(fixedChase((i+.5)/20000));assert.equal(p.length,5);assert.equal(new Set(p).size,5);
  assert.deepEqual(p.slice(0,4).map(id=>CARDS[id-1].rarity),['common','common','common','uncommon']);totals[CARDS[p[4]-1].rarity]++;
 }
 assert.deepEqual(totals,{common:0,uncommon:3890,rare:16000,super:100,secret:10});
 for(const [x,r] of [[0,'secret'],[.0005,'super'],[.0055,'rare'],[.8055,'uncommon'],[.999999,'uncommon']])assert.equal(CARDS[rollPack(fixedChase(x))[4]-1].rarity,r);
});
test('all 50 cards are reachable',()=>{
 const seen=new Set();for(const chase of [0,.001,.1,.9])for(let i=0;i<200;i++)rollPack(fixedChase(chase,(i+.5)/200)).forEach(id=>seen.add(id));assert.equal(seen.size,50);
});
test('packs survive unrevealed reloads, duplicates accumulate and damaged saves recover',()=>{
 let s=addPack(emptySave(),[1,2,3,25,49]);s=parseSave(JSON.stringify(s));assert.equal(s.counts[49],1);assert.equal(s.revealed,0);assert.equal(s.packs,1);assert.equal(s.last.length,5);
 s=addPack(s,[1,2,3,25,50]);assert.equal(s.counts[1],2);assert.equal(s.packs,2);assert.deepEqual(parseSave('not json'),emptySave());
 const repaired=parseSave(JSON.stringify({version:1,counts:{1:-1,2:1.5,3:2,99:100},packs:-3,last:[99],revealed:50}));assert.deepEqual(repaired.counts,{3:2});assert.equal(repaired.packs,0);assert.deepEqual(repaired.last,[]);
});
