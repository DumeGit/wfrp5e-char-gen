import test from 'node:test';
import assert from 'node:assert/strict';
import * as PDFLib from 'pdf-lib';
import {library,R} from './fixture.mjs';
import {assembleBooks,bookSelection,randomTable} from '../dist/books.mjs';
import {assembleNPCBooks,catalogForNPC} from '../dist/npc-books.mjs';
import * as M from '../dist/rules.mjs';
import {miracleChoices} from '../dist/cults.mjs';
import {freshNPC,validateNPCState} from '../dist/npc-state.mjs';
import {npcResult,npcQuote,npcMagicChoices} from '../dist/npc-result.mjs';
import {npcText,npcPDF} from '../dist/npc-export.mjs';
import {trainingChoices} from '../dist/npc-training.mjs';
import {careerVariantPanel,switchCareerVariant} from '../dist/career-variants.mjs';
import {regionalCareer} from '../dist/regional-careers.mjs';
import {marketCatalog} from '../dist/market.mjs';
import {legacyTitle} from '../dist/legacy.mjs';
import {deftMiracleAdaptation} from '../dist/deft-steps.mjs';
import {buildSearchIndex,searchBooks} from '../dist/book-search.mjs';
import {CAUSE_KEY,CAUSE_PLACEHOLDER,namedCause} from '../dist/talent-targets.mjs';

const B=assembleBooks(library,['deft-steps']);
const source=(x)=>x.source.book==='deft-steps';
const profile=(name)=>B.creatures.find(x=>source(x)&&x.name===name);
const npc=(name)=>freshNPC(B,profile(name).contentId);
function madeCareer(c){
 const s=M.fresh();s.books=bookSelection(B);s.career=c.id;s.name='Reviewed creation';
 s.randomTalents=['Read/Write','Attractive','Super Numerate','Cardsharp'];
 s.freeTalent=M.careerTalentOptions(B,s).find(t=>!M.freeTalents(B,s).includes(t)&&!M.invalidTalent(B,s,t));
 const used=new Set();for(const slot of M.speciesSkillSlots(B,s)){if(!used.has(slot.name)&&slot.name!=='Language (Reikspiel)'){s.speciesSkills.push(slot.key);used.add(slot.name);}if(used.size===5)break;}
 let remaining=8;for(const slot of M.careerSkillSlots(B,s,1)){const n=Math.min(remaining,Math.max(0,3-(M.freeSkills(B,s)[slot.name]||0)));s.careerSkills[slot.key]=n;remaining-=n;if(!remaining)break;}
 s.wealth={amount:1000,currency:'silver shillings'};return s;
}
function buyNPC(s,type,name,extra={}){
 const q=npcQuote(B,s,type,name,1,extra);assert.equal(q.error,undefined);
 s.ledger.push({type,name,amount:1,cost:q.cost,startingAdvances:q.advances,source:q.source,at:new Date().toISOString(),...extra});
 return q;
}

test('Deft Steps is opt-in, reviewed for both creators and preserves core probabilities',()=>{
 assert.equal(B.careers.filter(source).length,9);assert.equal(B.spells.filter(source).length,32);
 assert.equal(B.gear.filter(source).length,15);assert.equal(B.creatures.filter(source).length,22);
 assert.deepEqual(assembleNPCBooks(library,['deft-steps']).selection,B.selection);
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
test('Ranald aspect lists agree for PC free grants and NPC paid choices',()=>{
 const cult=B.cults.find(c=>c.name==='Ranald');
 for(const c of B.careers.filter(c=>c.randomAlternativeFor==='priest')){
  const allowed=cult.careerMiracles[c.id];assert.ok(allowed.includes('Cheat the Odds'));
  const pc=madeCareer(c);pc.freeTalent='Invoke (Ranald)';
  assert.deepEqual(M.spellGrants(B,pc).find(g=>g.category==='Ranald').choices.map(x=>x.name),allowed);
  const gm=freshNPC(B);gm.career=c.id;gm.talents=[{name:'Invoke (Ranald)',ranks:1}];
  assert.deepEqual(npcMagicChoices(B,npcResult(B,gm)).filter(x=>x.lore==='Ranald').map(x=>x.entry.name).sort(),[...allowed].sort());
  const outside=B.spells.find(x=>x.category==='Ranald'&&!allowed.includes(x.name));
  assert.match(npcQuote(B,gm,'spell',outside.name,1,{contentId:outside.contentId,lore:'Ranald'}).error,/cannot learn/);
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
test('Impassioned Zeal requires an explicit Cause in both purchase paths and uses one shared limit',()=>{
 const c=B.careers.find(c=>c.name==='Liberator-Priest'),pc=madeCareer(c);
 assert.match(M.invalidTalent(B,pc,CAUSE_PLACEHOLDER),/Cause/);
 pc.ledger=[{type:'promotion',cost:100},{type:'promotion',cost:100}];pc.xp=10000;pc.talentChoices[CAUSE_KEY]='Protect the innocent';
 const name=namedCause(pc.talentChoices[CAUSE_KEY]);assert.ok(M.careerTalentOptions(B,pc,3).includes(name));
 assert.equal(M.quote(B,pc,'talent',name).error,'');M.purchase(B,pc,'talent',name);
 assert.equal(pc.ledger.at(-1).cost,100);
 assert.match(M.invalidTalent(B,pc,namedCause('Another cause')),/not repeatable/i);
 const gm=freshNPC(B);gm.career=c.id;gm.careerLevel=3;
 assert.match(npcQuote(B,gm,'talent',CAUSE_PLACEHOLDER,1).error,/Cause/);
 buyNPC(gm,'talent',name);assert.equal(npcResult(B,gm).spent,100);validateNPCState(B,JSON.parse(JSON.stringify(gm)));
 assert.match(legacyTitle(B,npcResult(B,gm).talents.find(t=>t.name===name)),/Cause/);
 assert.match(npcText(B,gm),/\[Legacy\] Impassioned Zeal/);
 assert.match(npcText(B,gm,{record:true}),/RULE REFERENCES FOR SELECTED OPTIONS[\s\S]*\[Legacy\] Impassioned Zeal/);
 assert.match(npcQuote(B,gm,'talent',namedCause('Another cause'),1).error,/limit/);
});
test('all printed NPC baselines, Skill totals and repeated ranks survive assembly and save/load',()=>{
 for(const p of B.creatures.filter(source)){
  const s=freshNPC(B,p.contentId),d=npcResult(B,s);
  assert.deepEqual(d.stats,p.stats,p.name);assert.deepEqual(d.issues.filter(i=>i.severity==='error'),[],p.name);
  for(const skill of p.skills)assert.equal(d.skills.find(x=>x.name===M.canon(skill.name))?.total,skill.total,`${p.name}: ${skill.name}`);
  for(const t of p.talentGrants)assert.equal(d.talents.find(x=>x.name===M.canon(t.name))?.ranks,t.ranks||1,`${p.name}: ${t.name}`);
  validateNPCState(catalogForNPC(library,JSON.parse(JSON.stringify(s))),s);
 }
 assert.equal(npcResult(B,npc('Albrecht “The Fish”')).stats.W,196);
 const forger=npcResult(B,npc('Forger'));for(const [n,v]of [['Art (Calligraphy)',55],['Art (Painting)',40],['Melee (Basic)',33],['Perception',50]])assert.equal(forger.skills.find(x=>x.name===n).total,v);
 const brunner=npcResult(B,npc('Brunner'));assert.equal(brunner.skills.find(x=>x.name==='Lore (Tilea)').total,50);
 assert.deepEqual(brunner.protection,{Head:2,Arms:3,Body:4,Legs:2,Shield:0});
});
test('abstract NPC Armour does not stack equipment, while source unknowns remain visible',()=>{
 const s=npc('Black Guard of Morr (Knight)');s.gear.push({id:B.armour.find(x=>x.name==='Leather Jerkin').contentId,quantity:1});
 assert.deepEqual(npcResult(B,s).protection,{Head:5,Arms:5,Body:5,Legs:5,Shield:0});
 const father=npc('Father Pedragar');assert.ok(npcResult(B,father).issues.some(x=>x.code==='talent.cause'));
 father.removedTalents.push('Impassioned Zeal');father.talents.push({name:namedCause('Protect the forest'),ranks:1});
 assert.ok(!npcResult(B,father).issues.some(x=>x.code==='talent.cause'));
 assert.equal(npcResult(B,father).magic.length,5);
});
test('hounds use contextual Sprinter without changing M/Walk or globally marking core Sprinter',()=>{
 for(const [name,run]of [['Hochland Lockhund',24],['Nordlander Bamse',30],['Grootscher Marsh Hound',24]]){
  const s=npc(name),d=npcResult(B,s),t=d.traits.find(x=>x.name==='Sprinter');
  assert.equal(d.run,run);assert.equal(d.walk,profile(name).stats.M*2);assert.match(legacyTitle(B,t),/Stride/);
  assert.match(npcText(B,s,{record:true}),/\[Legacy\] Sprinter/);
  assert.match(npcText(B,s,{record:true}),/user-approved core Sprinter/);
  s.removedTraits.push(t.id);assert.equal(npcResult(B,s).run,profile(name).stats.M*4);
 }
 assert.equal(legacyTitle(B,B.traits.find(x=>x.name==='Sprinter')),'');
});
test('hound and hawk training retain different sourced Hunt rules and reject invented choices',()=>{
 const dog=npc('Hochland Lockhund'),hawk=npc('Dove Hawk');
 assert.ok(trainingChoices(profile('Hochland Lockhund')).includes('Dig'));assert.ok(!trainingChoices(profile('Dove Hawk')).includes('Dig'));
 const trained=B.traits.find(x=>x.name==='Trained');
 dog.traits.push({id:trained.contentId,value:'Hunt'});hawk.traits.push({id:trained.contentId,value:'Hunt'});
 const a=npcResult(B,dog).trainingReferences[0],b=npcResult(B,hawk).trainingReferences[0];
 assert.equal(a.source.page,133);assert.equal(b.source.page,134);assert.notEqual(a.text,b.text);
 assert.match(npcText(B,hawk,{record:true}),/Deft Steps p\. 134/);
 hawk.traits.push({id:trained.contentId,value:'Invented'});assert.ok(npcResult(B,hawk).issues.some(i=>i.code==='training.option'));
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
 for(const term of ['Steel Mummit','Telescopic Stick','Stay Lucky','Stride'])assert.ok(searchBooks(index,term,100).rows.length,term);
 assert.equal(searchBooks(buildSearchIndex(R),'Steel Mummit',100).rows.length,0);
 assert.ok(!searchBooks(index,'user-approved',100).rows.some(x=>x.kind==='creature'||x.kind==='magic'));
});
test('Deft NPC PDF paginates selected rules and the complete source/creation record',async()=>{
 const s=npc('Father Pedragar'),d=npcResult(B,s);
 const text=npcText(B,s,{record:true,result:d});assert.match(text,/Rending Paw/);assert.match(text,/Deft Steps, Light Fingers/);
 const bytes=await npcPDF(B,s,{record:true,result:d,pdfLib:PDFLib});
 const pdf=await PDFLib.PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>1);assert.match(pdf.getTitle(),/Father Pedragar/);
});
