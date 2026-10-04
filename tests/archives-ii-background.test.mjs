import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R,soldier} from './fixture.mjs';
import {suggestion,traditionalName,selectedTraditionalName} from '../dist/background.mjs';
import {validateBackgroundTable} from '../dist/books.mjs';

// Printed pp. 21–22 source fixtures; not installed runtime character options.
const data=JSON.parse(fs.readFileSync(new URL('./fixtures/archives-ii-background.json',import.meta.url),'utf8'));
function setup(){const catalog=structuredClone(R);catalog.background.Human.rollTables=data.appearance;catalog.background.Human.nameElements=data.names;catalog.background.Human.source={book:'archives-ii',page:21};return {catalog,s:soldier()};}

test('Ogre appearance uses the printed 2d10 distribution rather than uniform unique colours',()=>{
 const {catalog,s}=setup(),counts={};let calls=0;
 for(let first=1;first<=10;first++)for(let second=1;second<=10;second++){
  const value=suggestion(catalog,s,'eyes',(sides,page,kind,source,count)=>{calls++;assert.equal(sides,10);assert.equal(count,2);assert.equal(page,21);assert.equal(source.book,'archives-ii');return first+second;});
  counts[value]=(counts[value]||0)+1;
 }
 assert.equal(calls,100);assert.equal(counts.Grey,1);assert.equal(counts.Brown,34);assert.equal(counts['Blue Black'],1);
 assert.equal(suggestion(catalog,s,'hair',()=>10),'Burgundy');
 assert.equal(suggestion(catalog,s,'hair',()=>18),'Charcoal');
 assert.throws(()=>suggestion(catalog,s,'eyes',()=>1),/outside/);
});
test('traditional names combine two independent d100 elements into one given name',()=>{
 const {catalog,s}=setup(),calls=[];
 const name=traditionalName(catalog,s,(sides,page,kind,source,count)=>{calls.push({sides,page,kind,source,count});return calls.length===1?1:100;});
 assert.equal(name,'Aryogg');assert.equal(calls.length,2);assert.ok(calls.every(x=>x.sides===100&&x.count===1&&x.page===22&&x.source.book==='archives-ii'));
 assert.equal(traditionalName(catalog,s,()=>100),'Zoryogg');
 assert.equal(s.name,'Walther Schmidt'); // Sampling is separate from editing identity.
 s.nameElements=[];s.nameElements[1]=100;assert.equal(selectedTraditionalName(catalog,s),'');
 s.nameElements[0]=1;assert.equal(selectedTraditionalName(catalog,s),'Aryogg');
 s.nameElements[0]=0;assert.equal(selectedTraditionalName(catalog,s),'');
});
test('repeated printed name elements retain their separate d100 probabilities',()=>{
 const table=data.names[1];assert.equal(table.rows[23].result,'elg');assert.equal(table.rows[26].result,'elg');
 assert.equal(table.rows.filter(x=>x.result==='elg').length,2);
 assert.equal(table.rows.length,100);assert.ok(data.names[0].rows.every(x=>!x.result.includes(' ')));
});
test('background table validation checks every possible total and rejects undocumented dice',()=>{
 for(const table of [...Object.values(data.appearance),...data.names])assert.doesNotThrow(()=>validateBackgroundTable(table,'source fixture'));
 const gap=structuredClone(data.appearance.eyes);gap.rows.splice(0,1);assert.throws(()=>validateBackgroundTable(gap,'gap'),/missing/);
 const overlap=structuredClone(data.appearance.eyes);overlap.rows[1].min=2;assert.throws(()=>validateBackgroundTable(overlap,'overlap'),/overlapping/);
 const unsupported=structuredClone(data.names[0]);unsupported.dice=[1,20];assert.throws(()=>validateBackgroundTable(unsupported,'dice'),/unsupported/);
});
