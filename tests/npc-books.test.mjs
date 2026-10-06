import test from 'node:test';
import assert from 'node:assert/strict';
import { library, R, soldier } from './fixture.mjs';
import { assembleBooks, bookSelection, validateManifest } from '../dist/books.mjs';
import { assembleNPCBooks, catalogForNPC, npcBooks, npcSourceLabel } from '../dist/npc-books.mjs';
import { freshNPC, validateNPCState } from '../dist/npc-state.mjs';
import { npcResult, npcMagicChoices } from '../dist/npc-result.mjs';
import { validateBestiary } from '../dist/bestiary-content.mjs';
import { npcText } from '../dist/npc-export.mjs';
import { miracleChoices, cultIssues } from '../dist/cults.mjs';
import * as M from '../dist/rules.mjs';

// Synthetic registry fixtures exercise extension contracts, not shipped rules.
function extended() {
 const next=structuredClone(library), core=next.packs.find(p=>p.manifest.id==='core');
 const creature=structuredClone(core.data.creatures.find(p=>p.name==='Human'));
 creature.id='npc-fixture:creatures:sample'; creature.name='Synthetic reviewed profile'; creature.page=7;
 creature.talentGrants=[{name:'Strong Back',ranks:2},{name:'Invoke (Ranald)',ranks:1}];
 creature.traitGrants=[{name:'Night Vision'}];
 creature.armourProfiles=[{name:'Printed armour',ap:2,text:'Body only.'}];
 const spell=R.spells.find(p=>p.category==='Ranald');
 creature.magicGrants=[{name:spell.name,lore:'Ranald'}];
 creature.attacks[0].skillName='Melee (Basic)';
 creature.notes=['Synthetic source warning.'];
 next.packs.push({manifest:{schemaVersion:1,id:'npc-fixture',title:'Synthetic book',shortTitle:'Fixture',edition:5,version:'1.0.0',kind:'supplement',creators:['npc'],dependsOn:['core'],source:{file:'not-a-real-book.pdf',sha256:'a'.repeat(64)},files:{creatures:'creatures.json',coverage:'coverage.json'}},data:{creatures:[creature],coverage:{schemaVersion:1,records:[],features:[]}}});
 return next;
}
test('NPC selection requires an explicit review and restores exact saved book versions',()=>{
 assert.deepEqual(npcBooks(library).map(p=>p.manifest.id),['core']);
 assert.throws(()=>assembleNPCBooks(library,['core','up-in-arms']),/reviewed/);
 const next=extended(), catalog=assembleNPCBooks(next,['core','npc-fixture']);
 const s=freshNPC(catalog,'npc-fixture:creatures:sample');
 assert.deepEqual(catalogForNPC(next,s).selection,catalog.selection);
 validateNPCState(catalog,s);
 const bad=structuredClone(s);bad.books.packs[1].version='0.0.0';
 assert.throws(()=>catalogForNPC(next,bad),/version/);
 bad.books=bookSelection(catalog);bad.books.packs.reverse();
 assert.throws(()=>catalogForNPC(next,bad),/order/);
 bad.books=bookSelection(catalog);bad.books.packs.push({...bad.books.packs[1]});
 assert.throws(()=>catalogForNPC(next,bad),/selected books|order/);
 next.packs.find(p=>p.manifest.id==='core').manifest.creators=['pc'];
 assert.throws(()=>assembleNPCBooks(next,['npc-fixture']),/required book/);
});
test('structured NPC grants preserve printed ranks, Skills, attacks, armour and magic with their own source',()=>{
 const catalog=assembleNPCBooks(extended(),['npc-fixture']), s=freshNPC(catalog,'npc-fixture:creatures:sample'), d=npcResult(catalog,s);
 assert.equal(d.talents.find(t=>t.name==='Strong Back').ranks,2);
 assert.equal(d.attacks[0].skill,35);assert.equal(d.attacks[0].damage,7);
 assert.equal(d.protection.Body,2);assert.equal(d.protection.Head,0);
 assert.equal(d.magic[0].origin,'Printed');
 assert.equal(d.issues.find(i=>i.code==='printed.profile-note').source.book,'npc-fixture');
 assert.equal(npcSourceLabel(catalog,d.profile),'Fixture p. 7');
 s.removedSpells.push(d.magic[0].contentId);assert.equal(npcResult(catalog,s).magic.length,0);
 s.advanceCounts.skill['Melee (Basic)']=0;s.career='soldier';
 s.ledger.push({type:'skill',name:'Melee (Basic)',amount:5,cost:M.SKILL_COST[0],startingAdvances:0,source:{book:'core',page:191},at:new Date().toISOString()});
 assert.equal(npcResult(catalog,s).attacks[0].skill,40);
 const text=npcText(catalog,s,{record:true});
 assert.match(text,/Synthetic book · 1\.0\.0/);assert.match(text,/Fixture p\. 7/);
});
test('malformed structured grants and unsupported magic cannot silently disappear',()=>{
 const cases=[p=>p.talentGrants[0].ranks=0,p=>p.traitGrants[0].name='Invented Trait',p=>p.armourProfiles[0].ap=-1,p=>p.magicGrants[0].name='Invented spell',p=>p.magicGrants[0].lore='Invented Lore',p=>p.attacks[0].skillName='Invented Skill'];
 for(const edit of cases){const next=extended();edit(next.packs.at(-1).data.creatures[0]);assert.throws(()=>assembleNPCBooks(next,['npc-fixture']),/Bestiary/);}
 const catalog=assembleNPCBooks(extended(),['npc-fixture']);validateBestiary(catalog);
});
test('Career-scoped Miracle access agrees in PC grants, NPC choices and saved purchases',()=>{
 const catalog=structuredClone(R), spells=catalog.spells.filter(p=>p.category==='Ranald').slice(0,2);
 assert.equal(spells.length,2);
 catalog.cults.push({name:'Ranald',miracles:[spells[0].name],careerMiracles:{soldier:[spells[1].name]},source:{book:'npc-fixture',page:18},text:'Synthetic restricted list.'});
 assert.deepEqual(miracleChoices(catalog,'Ranald').map(p=>p.name),[spells[0].name]);
 assert.deepEqual(miracleChoices(catalog,'Ranald','soldier').map(p=>p.name),[spells[1].name]);
 const pc=soldier();pc.freeTalent='Invoke (Ranald)';
 assert.deepEqual(M.spellGrants(catalog,pc).find(g=>g.category==='Ranald').choices.map(p=>p.name),[spells[1].name]);
 pc.ledger.push({type:'spell',name:spells[0].name,talent:'Invoke (Ranald)'});
 assert.equal(cultIssues(catalog,pc,true)[0].code,'cult.miracle');
 const npc=freshNPC(catalog);npc.career='soldier';npc.talents.push({name:'Invoke (Ranald)',ranks:1});
 const choices=npcMagicChoices(catalog,npcResult(catalog,npc)).filter(p=>p.lore==='Ranald');
 assert.deepEqual(choices.map(p=>p.entry.name),[spells[1].name]);
 npc.spells.push({id:spells[0].contentId,lore:'Ranald'});
 assert.ok(npcResult(catalog,npc).issues.some(i=>i.code==='magic.access'));
});
test('Craftsman’s printed Trade placeholder requires a real Trade specialisation',()=>{
 const options=M.options(R,'Craftsman (Trade)','talent');
 assert.ok(options.includes('Craftsman (Smith)'));assert.ok(!options.includes('Craftsman (Trade)'));
});

test('creator declarations and scoped Miracle references reject unsupported identifiers',()=>{
 for(const creators of [[],['npc','npc'],['manager'],'npc']){
  const manifest=structuredClone(library.packs[0].manifest);manifest.creators=creators;
  assert.throws(()=>validateManifest(manifest),/creator/);
 }
 const next=extended(), pack=next.packs.at(-1), spells=R.spells.filter(p=>p.category==='Ranald').slice(0,2);
 pack.data.cults=[{id:'npc-fixture:cult:ranald',name:'Ranald',page:7,text:'Synthetic access rule.',miracles:[spells[0].name],careerMiracles:{soldier:[spells[1].name]}}];
 const valid=assembleBooks(next,['npc-fixture']);assert.equal(miracleChoices(valid,'Ranald','soldier')[0].name,spells[1].name);
 for(const invalid of [{unknown:[spells[1].name]},{soldier:[]},{soldier:[spells[1].name,spells[1].name]},{soldier:['Invented Miracle']}]){
  pack.data.cults[0].careerMiracles=invalid;
  assert.throws(()=>assembleBooks(next,['npc-fixture']),/Career-specific/);
 }
});
