import test from 'node:test';
import assert from 'node:assert/strict';
import {library,R} from './fixture.mjs';
import {assembleBooks,bookSelection,randomTable} from '../dist/books.mjs';
import * as M from '../dist/rules.mjs';
import {miracleChoices,cultIssues} from '../dist/cults.mjs';
import {careerVariantPanel,switchCareerVariant} from '../dist/career-variants.mjs';
import {regionalCareer} from '../dist/regional-careers.mjs';
import {marketCatalog} from '../dist/market.mjs';
import {legacyTitle} from '../dist/legacy.mjs';
import {deftMiracleAdaptation} from '../dist/deft-steps.mjs';
import {buildSearchIndex,searchBooks} from '../dist/book-search.mjs';
import {CAUSE_KEY,CAUSE_PLACEHOLDER,namedCause} from '../dist/talent-targets.mjs';

const B=assembleBooks(library,['deft-steps']);
const source=(x)=>x.source.book==='deft-steps';
function madeCareer(c){
 const s=M.fresh();s.books=bookSelection(B);s.career=c.id;s.name='Reviewed creation';
 s.randomTalents=['Read/Write','Attractive','Super Numerate','Cardsharp'];
 s.freeTalent=M.careerTalentOptions(B,s).find(t=>!M.freeTalents(B,s).includes(t)&&!M.invalidTalent(B,s,t));
 const used=new Set();for(const slot of M.speciesSkillSlots(B,s)){if(!used.has(slot.name)&&slot.name!=='Language (Reikspiel)'){s.speciesSkills.push(slot.key);used.add(slot.name);}if(used.size===5)break;}
 let remaining=8;for(const slot of M.careerSkillSlots(B,s,1)){const n=Math.min(remaining,Math.max(0,3-(M.freeSkills(B,s)[slot.name]||0)));s.careerSkills[slot.key]=n;remaining-=n;if(!remaining)break;}
 s.wealth={amount:1000,currency:'silver shillings'};return s;
}

test('Deft Steps is opt-in, reviewed for player creation and preserves core probabilities',()=>{
 assert.equal(B.careers.filter(source).length,9);assert.equal(B.spells.filter(source).length,32);
 assert.equal(B.gear.filter(source).length,15);
 assert.equal(B.books.find(b=>b.id==='deft-steps').source.sha256,'2581d969680a019b7db3d083578e0759b9b96e2a0612e5e99088821690537eec');
 for(const kind of ['career','species','talent'])assert.deepEqual(randomTable(B,M.fresh(),kind),randomTable(R,M.fresh(),kind));
 for(const c of B.careers.filter(source))assert.deepEqual(M.validation(B,madeCareer(c)),[],c.name);
});
test('source counts and unusual Career listings survive approved corrections',()=>{
 const c=B.careers.find(c=>c.name==='Liberator-Priest');
 assert.ok(!c.levels[1].skills.includes('Public Speaking'));assert.ok(c.levels[1].talents.includes('Public Speaker'));assert.ok(c.levels[2].talents.includes('Public Speaker'));
 assert.equal(B.careers.find(c=>c.name==='Gambler-Priest').levels[3].talents.length,5);
 const ranger=B.careers.find(c=>c.name==='Ranger-Priest of Taal');assert.equal(ranger.levels[1].talents.length,3);assert.equal(ranger.levels[2].skills.length,2);
 const trick=B.careers.find(c=>c.name==='Trickster-Priest');
 assert.ok(trick.levels[2].skills.includes('Entertain (Acting)'));assert.ok(!trick.levels[2].skills.includes('Perform (Acting)'));
 assert.ok(M.options(B,'Art (Any)').includes('Art (Calligraphy)'));assert.ok(M.options(B,'Stealth (Any)').includes('Stealth (Urban)'));
});
test('four printed Ranald alternatives retain the rolled Priest bonus without inventing probability',()=>{
 for(const c of B.careers.filter(c=>c.randomAlternativeFor==='priest')){
  const s=M.fresh();s.career='priest';s.careerMode='first';s.careerAttempts=1;
  assert.equal(regionalCareer(B,s,c.id).base,'priest');
 }
 assert.equal(B.careers.filter(c=>c.randomAlternativeFor==='priest').length,4);
});
test('Ranald aspect lists restrict player free Miracle grants',()=>{
 const cult=B.cults.find(c=>c.name==='Ranald');
 for(const c of B.careers.filter(c=>c.randomAlternativeFor==='priest')){
  const allowed=cult.careerMiracles[c.id];assert.ok(allowed.includes('Cheat the Odds'));
  const pc=madeCareer(c);pc.freeTalent='Invoke (Ranald)';
  assert.deepEqual(M.spellGrants(B,pc).find(g=>g.category==='Ranald').choices.map(x=>x.name),allowed);
  const outside=B.spells.find(x=>x.category==='Ranald'&&!allowed.includes(x.name));
  pc.ledger.push({type:'spell',name:outside.name,talent:'Invoke (Ranald)'});
  assert.equal(cultIssues(B,pc,true)[0].code,'cult.miracle');
 }
});
test('Career-specific Miracle lists reject nonexistent, empty and duplicate references',()=>{
 const next=structuredClone(library),cult=next.packs.find(p=>p.manifest.id==='deft-steps').data.cults[0];
 const c=B.careers.find(c=>c.randomAlternativeFor==='priest'),name=cult.careerMiracles[c.id][0];
 for(const invalid of [{unknown:[name]},{[c.id]:[]},{[c.id]:[name,name]},{[c.id]:['Invented Miracle']}]){
  cult.careerMiracles=invalid;
  assert.throws(()=>assembleBooks(next,['deft-steps']),/Career-specific/);
 }
});
test('Career variant switching removes siblings, preserves identity and grants no extra Advances',()=>{
 const s=M.fresh();s.career='priest';s.name='Preserved';s.boost.WP=2;
 let V=switchCareerVariant(library,B,s,'deft-steps-dealer');
 assert.equal(miracleChoices(V,'Ranald','priest').length,11);assert.equal(M.career(V,s).levels[0].skills.length,12);
 V=switchCareerVariant(library,V,s,'deft-steps-ranald-priest');
 assert.ok(!V.selection.some(x=>x.id==='deft-steps-dealer'));assert.equal(miracleChoices(V,'Ranald','priest').length,10);
 assert.equal(s.name,'Preserved');assert.equal(s.boost.WP,2);assert.deepEqual(s.careerSkills,{});
 assert.match(careerVariantPanel(V,s),/Ranald the Dealer/);
 s.career='thief';const T=switchCareerVariant(library,B,s,'deft-steps-pickpocket');
 assert.deepEqual(M.career(T,s).levels[0].talents,M.career(R,{...s,career:'thief'}).levels[0].talents);
 s.ledger=[{cost:100}];assert.throws(()=>switchCareerVariant(library,T,s,''),/advancement/);
});
test('Impassioned Zeal requires an explicit Cause for player purchases and remains nonrepeatable',()=>{
 const c=B.careers.find(c=>c.name==='Liberator-Priest'),pc=madeCareer(c);
 assert.match(M.invalidTalent(B,pc,CAUSE_PLACEHOLDER),/Cause/);
 pc.ledger=[{type:'promotion',cost:100},{type:'promotion',cost:100}];pc.xp=10000;pc.talentChoices[CAUSE_KEY]='Protect the innocent';
 const name=namedCause(pc.talentChoices[CAUSE_KEY]);assert.ok(M.careerTalentOptions(B,pc,3).includes(name));
 assert.equal(M.quote(B,pc,'talent',name).error,'');M.purchase(B,pc,'talent',name);
 assert.equal(pc.ledger.at(-1).cost,100);
 assert.match(M.invalidTalent(B,pc,namedCause('Another cause')),/not repeatable/i);
});
test('shop profiles preserve paired names, tables, qualifications and unknown hound weights',()=>{
 const byName=n=>B.gear.find(x=>source(x)&&x.name===n);
 assert.equal(byName('Thin Jimmy').price,'2GC');assert.match(byName('Thin Jimmy').text,/Steel Mummit Success Table/);
 assert.match(byName('Thin Jimmy').conversion,/Steel Mummit/);assert.match(byName('Glass Cutter').text,/Glass Cutting Success Table/);
 assert.equal(byName('Telescopic Pole').enc,1);assert.equal(legacyTitle(B,byName('Telescopic Pole')),'');
 assert.equal(byName('Hochland Lockhund').enc,null);assert.equal(byName('Dove Hawk').enc,1);
 assert.match(byName('Smoke Bomb').text,/Fourth Edition/);
 assert.equal(marketCatalog(B).length-marketCatalog(R).length,15);
 assert.match(B.spells.find(x=>x.name==='Ranald’s Mischief').text,/Roll twice, rerolling duplicates/);
});
test('Legacy remains contextual for mapped Miracles and search matches book names, not decisions',()=>{
 const c=B.careers.find(x=>x.name==='Thief-Priest');assert.ok(deftMiracleAdaptation(B,c.id,'Cheat the Odds'));
 assert.equal(deftMiracleAdaptation(B,'priest','Cheat the Odds'),null);
 assert.equal(legacyTitle(B,B.spells.find(x=>x.name==='Cheat the Odds')),'');
 const index=buildSearchIndex(B);
 for(const term of ['Steel Mummit','Telescopic Stick','Stay Lucky'])assert.ok(searchBooks(index,term,100).rows.length,term);
 assert.equal(searchBooks(buildSearchIndex(R),'Steel Mummit',100).rows.length,0);
 assert.ok(!searchBooks(index,'user-approved',100).rows.some(x=>x.kind==='magic'));
});
