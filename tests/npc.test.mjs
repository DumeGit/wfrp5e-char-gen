import test from 'node:test';
import assert from 'node:assert/strict';
import * as PDFLib from 'pdf-lib';
import { R, soldier } from './fixture.mjs';
import * as M from '../dist/rules.mjs';
import { freshNPC, validateNPCState } from '../dist/npc-state.mjs';
import { npcResult, npcQuote, npcMagicChoices, npcCareerTalents } from '../dist/npc-result.mjs';
import { npcPDF, npcText } from '../dist/npc-export.mjs';
import { grantChoices, profileFeatures } from '../dist/npc-profile.mjs';
import { buildSearchIndex, searchBooks } from '../dist/book-search.mjs';
const npc=name=>freshNPC(R,R.creatures.find(x=>x.name===name).contentId);
const trait=(s,name,value='')=>s.traits.push({id:R.traits.find(x=>x.name===name).contentId,value});
function template(s,name){const t=R.templates.find(x=>x.name===name);s.template=t.contentId;t.skills.forEach((g,i)=>s.templateSkills[i]=grantChoices(R,g,'skill').slice(0,g.count));t.talents.forEach((g,i)=>s.templateTalents[i]=grantChoices(R,g,'talent')[0]);}
function buy(s,type,name,amount=5,extra={}){const q=npcQuote(R,s,type,name,amount,extra);assert.equal(q.error,undefined);s.ledger.push({type,name,amount,cost:q.cost,startingAdvances:q.advances,source:q.source,at:new Date().toISOString(),...extra});return q.cost;}

test('all 49 base profiles and four examples retain every printed Characteristic, Wound, Skill and attack',()=>{
 assert.equal(R.creatures.length,53);assert.equal(R.creatures.filter(p=>!p.example).length,49);assert.equal(R.traits.length,67);assert.equal(R.templates.length,7);assert.equal(R.mutations.length,40);
 for(const p of R.creatures){const s=freshNPC(R,p.contentId),d=npcResult(R,s);validateNPCState(R,s);assert.deepEqual(d.stats,p.stats,p.name);assert.equal(d.issues.filter(x=>x.severity==='error').length,0,p.name);for(const x of p.skills)assert.equal(d.skills.find(y=>y.name===x.name)?.total,x.total,`${p.name}: ${x.name}`);for(const [i,a]of p.attacks.entries())if(!a.optional){const b=d.attacks.find(x=>x.id===`printed-attack-${i}`);assert.equal(b.damage,a.damage,`${p.name}: ${a.name}`);assert.equal(b.skill,a.skill,`${p.name}: ${a.name}`);}}
});
test('Orc conflict is explicit, recalculation is chosen, and templates use the higher Skill bonus',()=>{
 const s=npc('Orc');assert.equal(npcResult(R,s).tb,4);assert.ok(npcResult(R,s).issues.some(x=>x.code==='printed.toughness-conflict'));s.tbMode='calculate';assert.equal(npcResult(R,s).tb,3);assert.equal(npcResult(R,s).stats.W,11);
 const h=npc('Human');h.skills.push({name:'Cool',bonus:20});template(h,'Soldier');const d=npcResult(R,h);assert.equal(d.stats.WS,40);assert.equal(d.skills.find(x=>x.name==='Cool').advance,20);assert.equal(d.skills.find(x=>x.name==='Dodge').advance,10);assert.equal(d.stats.W,16);assert.equal(d.attacks[0].damage,8);
});
test('Size adjusts Characteristics, Wounds and primary Damage without doubling ranged/extra attacks',()=>{
 const s=npc('Giant Spider');s.size='Large';const d=npcResult(R,s);assert.equal(d.stats.S,35);assert.equal(d.stats.T,45);assert.equal(d.stats.Ag,25);assert.equal(d.stats.W,26);assert.equal(d.attacks.find(x=>/Fangs/.test(x.name)).damage,8);assert.equal(d.attacks.find(x=>/Bite/.test(x.name)).damage,6);
 s.size='Tiny';assert.equal(npcResult(R,s).stats.W,null);assert.ok(npcResult(R,s).issues.some(x=>x.code==='size.tiny'));s.overrides.W=1;assert.equal(npcResult(R,s).stats.W,1);
});
test('Broken uses real recorded dice when Fellowship is absent; War and Guard apply once',()=>{
 const s=npc('Wolf');trait(s,'Trained','Broken');trait(s,'Trained','War');trait(s,'Trained','Guard');assert.ok(npcResult(R,s).issues.some(x=>x.code==='training.fellowship-roll'));s.trainingRoll={faces:[3,8]};const d=npcResult(R,s);assert.equal(d.stats.Fel,11);assert.equal(d.stats.WS,R.creatures.find(x=>x.name==='Wolf').stats.WS+10);assert.ok(d.traits.some(x=>x.name==='Territorial'));const h=npc('Human');trait(h,'Trained','Broken');h.trainingRoll={faces:[3,8]};assert.equal(npcResult(R,h).stats.Fel,41);
});
test('new Construct uses absent mental scores and SB for Wounds; Swarm preserves normal-example Wounds',()=>{
 const s=npc('Human');trait(s,'Construct');let d=npcResult(R,s);assert.equal(d.stats.Int,null);assert.equal(d.stats.WP,null);assert.equal(d.stats.Fel,null);assert.equal(d.stats.W,12);assert.ok(d.attacks.every(a=>a.text.includes('Magical')));
 const rat=npc('Giant Rat'),base=npcResult(R,rat);trait(rat,'Swarm');d=npcResult(R,rat);assert.equal(d.stats.W,base.stats.W*5);assert.equal(d.stats.WS,base.stats.WS+10);rat.size='Monstrous';assert.equal(npcResult(R,rat).stats.S,base.stats.S);assert.equal(npcResult(R,rat).stats.W,base.stats.W*5);
});
test('XP requires an explicit pricing history, increments respect bands, repeat Talent price remains 100',()=>{
 const s=npc('Human');s.career='soldier';assert.match(npcQuote(R,s,'char','WS').error,/existing/);s.advanceCounts.char.WS=10;assert.equal(npcQuote(R,s,'char','WS').cost,M.CHAR_COST[2]);assert.equal(buy(s,'char','WS'),M.CHAR_COST[2]);assert.equal(npcResult(R,s).stats.WS,35);s.advanceCounts.skill.Cool=0;buy(s,'skill','Cool',1);assert.match(npcQuote(R,s,'skill','Cool',5).error,/partial/);assert.equal(npcQuote(R,s,'skill','Cool',1).cost,M.IND_SKILL_COST[0]);assert.equal(buy(s,'talent','Strong Back',1),100);assert.equal(buy(s,'talent','Strong Back',1),100);assert.match(npcQuote(R,s,'talent','Strong Back',1).error,/limit/);const spent=npcResult(R,s).spent;s.ledger.pop();assert.equal(npcResult(R,s).spent,spent-100);assert.deepEqual(M.validation(R,soldier()),[]);
});
test('template magic limits do not disappear after one paid spell and Petty Magic uses five-spell price bands',()=>{
 const s=npc('Human');template(s,'Spellcaster');const spells=R.spells.filter(x=>x.category==='Petty');s.spells=spells.slice(0,4).map(x=>({id:x.contentId,lore:'Petty'}));assert.ok(npcResult(R,s).issues.some(x=>x.code==='template.spell-limit'));s.career='wizard';buy(s,'spell',spells[4].name,1,{contentId:spells[4].contentId,lore:'Petty'});assert.ok(npcResult(R,s).issues.some(x=>x.code==='template.spell-limit'));s.spells=s.spells.slice(0,3);assert.ok(!npcResult(R,s).issues.some(x=>x.code==='template.spell-limit'));assert.equal(npcQuote(R,s,'spell',spells[5].name,1,{contentId:spells[5].contentId,lore:'Petty'}).cost,50);s.spells.push({id:spells[5].contentId,lore:'Petty'});assert.equal(npcQuote(R,s,'spell',spells[6].name,1,{contentId:spells[6].contentId,lore:'Petty'}).cost,100);
});
test('Mark and Mutation permanent effects are explicit; references are indexed without internal decisions',()=>{
 const s=npc('Human');trait(s,'Mark of Chaos','Nurgle');assert.equal(npcResult(R,s).stats.T,40);s.mutations.push({id:R.mutations.find(x=>x.name==='Corpulent').contentId,origin:'GM',location:''});assert.equal(npcResult(R,s).stats.T,45);assert.equal(npcResult(R,s).stats.M,3);const index=buildSearchIndex(R);assert.ok(searchBooks(index,'Orc',100).rows.some(x=>x.kind==='creature'));assert.ok(searchBooks(index,'Construct',100).rows.some(x=>x.kind==='trait'));assert.ok(searchBooks(index,'Skill bonuses use the higher',100).rows.every(x=>x.kind!=='creature'));assert.ok(!searchBooks(index,'heading decision',100).rows.some(x=>x.kind==='creature'));
});
test('save validation rejects PC files, wrong book versions, unknown mechanics and broken dice',()=>{
 const s=npc('Human');assert.deepEqual(validateNPCState(R,JSON.parse(JSON.stringify(s))),s);assert.throws(()=>validateNPCState(R,soldier()),/NPC/);const bad=structuredClone(s);bad.books.packs[0].version='0.0.0';assert.throws(()=>validateNPCState(R,bad),/book version/);bad.books=s.books;bad.overrides.Invented=30;assert.throws(()=>validateNPCState(R,bad),/score/);delete bad.overrides.Invented;bad.trainingRoll={faces:[20]};assert.throws(()=>validateNPCState(R,bad),/roll/);
});
test('text and multipage PDF exports consume the same complete result, including records and overflow',async()=>{
 const s=npc('Orc');s.notes='Long GM note. '.repeat(800);const d=npcResult(R,s),text=npcText(R,s,{result:d,record:true});assert.match(text,/T 30/);assert.match(text,/TB 4/);assert.match(text,/CREATION RECORD/);assert.match(text,/Toughness Bonus 4 disagree/);const bytes=await npcPDF(R,s,{result:d,record:true,pdfLib:PDFLib}),pdf=await PDFLib.PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>2);assert.match(pdf.getTitle(),/Orc/);
});


test('individualisation replaces its previous active roll and validated XP costs cannot be edited',()=>{
 const s=npc('Human');s.characteristicRolls.WS=[10,10];assert.equal(npcResult(R,s).stats.WS,40);s.characteristicRolls.WS=[1,2];assert.equal(npcResult(R,s).stats.WS,23);s.career='soldier';s.advanceCounts.char.WS=0;buy(s,'char','WS',1);validateNPCState(R,s);s.ledger[0].cost+=1;assert.throws(()=>validateNPCState(R,s),/price/);
});
test('Marks expose exactly their printed Career Talents and preserve printed Daemon profiles',()=>{
 const s=npc('Human');s.career='soldier';trait(s,'Mark of Chaos','Tzeentch');assert.ok(npcCareerTalents(R,s).includes('Petty Magic'));assert.equal(npcQuote(R,s,'talent','Petty Magic',1).cost,100);assert.equal(npcQuote(R,s,'talent','Chaos Magic (Tzeentch)',1).cost,100);s.markRoll={faces:[10],start:'Mental'};assert.ok(npcResult(R,s).issues.some(x=>x.code==='mark.mutation-sequence'));const daemon=npc('Bloodletter of Khorne'),d=npcResult(R,daemon);assert.ok(d.talents.some(t=>t.name==='Frenzy'));assert.deepEqual(d.stats,R.creatures.find(p=>p.name==='Bloodletter of Khorne').stats);
});
test('unspecified Amphibious bonus and newly added Mutation require explicit values',()=>{
 const s=npc('Human');trait(s,'Amphibious');let d=npcResult(R,s);assert.equal(d.skills.find(x=>x.name==='Swim').total,null);assert.ok(d.issues.some(x=>x.code==='amphibious.swim-bonus'));s.skills.push({name:'Swim',bonus:0});assert.equal(npcResult(R,s).skills.find(x=>x.name==='Swim').total,30);trait(s,'Mutation');assert.ok(npcResult(R,s).issues.some(x=>x.code==='trait.mutation-required'));s.mutations.push({id:R.mutations.find(m=>m.category==='Physical').contentId,origin:'GM',location:'Body'});assert.ok(!npcResult(R,s).issues.some(x=>x.code==='trait.mutation-required'));
});
test('ranged equipment keeps its printed formula at Large Size and manual attacks have stable validated references',()=>{
 const s=npc('Human'),w=R.weapons.find(x=>x.name==='Bow (2H)');s.size='Large';s.gear.push({id:w.contentId,quantity:1});const d=npcResult(R,s),a=d.attacks.find(x=>x.id===w.contentId);assert.equal(a.damage,Number(w.damage.replace(/^SB\s*\+\s*/,'').trim())+d.sb);s.attackOverrides[w.contentId]={damage:12};validateNPCState(R,s);assert.equal(npcResult(R,s).attacks.find(x=>x.id===w.contentId).damage,12);s.attackOverrides.invented={damage:12};assert.throws(()=>validateNPCState(R,s),/override/);
});

test('quick profile armour does not stack with assigned detailed armour and final GM scores explain blocked XP',()=>{
 const s=npc('Human');s.optionalArmour.push('printed-armour-0','printed-armour-1');const a=R.armour.find(x=>x.name==='Leather Jerkin');s.gear.push({id:a.contentId,quantity:1});assert.equal(npcResult(R,s).protection.Body,3);s.career='soldier';s.advanceCounts.char.WS=0;s.overrides.WS=45;assert.match(npcQuote(R,s,'char','WS',1).error,/override/);
});
