import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../dist/rules.mjs';
import {library,R} from './fixture.mjs';
import {assembleBooks,bookSelection,catalogForCharacter} from '../dist/books.mjs';
import {bookPanel} from '../dist/book-ui.mjs';
import {careerVariantPanel,switchCareerVariant} from '../dist/career-variants.mjs';

const B=assembleBooks(library,['archives-iii','winds-of-magic']);
test('Career variants appear only with their Career and parent book, outside the book picker',()=>{
 const s={...M.fresh(),career:'hedge-witch'};
 assert.equal(careerVariantPanel(R,s),'');
 assert.equal(careerVariantPanel(B,{...s,career:'soldier'}),'');
 assert.match(careerVariantPanel(B,s),/Animal-doctor Hedge Witch/);
 assert.doesNotMatch(bookPanel(library,B,s),/archives-iii-hedge|Animal-doctor/);
 const V=switchCareerVariant(library,B,s,'archives-iii-hedge');
 assert.match(careerVariantPanel(V,s),/value="archives-iii-hedge" selected/);
 assert.doesNotMatch(bookPanel(library,V,s),/archives-iii-hedge|Animal-doctor/);
 assert.match(bookPanel(library,V,s),/counter">3<\/span>/);
});
test('Switching Career variants clears dependent choices, preserves creation rolls, and round trips saved sources',()=>{
 const s={...M.fresh(),version:2,books:bookSelection(B),career:'hedge-witch',name:'Test',origin:'',speciesSkills:['s-0'],randomTalents:['Strong Back'],talentChoices:{'species-0':'Doomed'},careerMode:'first',careerAttempts:1,careerOffers:['hedge-witch'],rolls:[{label:'Career',dice:'1d100',values:[18],total:18}],charMode:'first',charRolls:Array(10).fill(10),background:{eyes:'Brown'},careerSkills:{'c1-0':2},freeTalent:'Petty Magic',spells:['Open Lock'],spellLores:{'Open Lock':'Petty Magic'},gearChoices:{x:'old'},purchases:[{id:'old'}],wealth:{amount:10,currency:'silver shillings'}};
 s.skillChoices={'s-2':'Melee (Basic)','c1-0':'Channelling (Magick)'};s.boost={I:2};
 const original=structuredClone(s),V=switchCareerVariant(library,B,s,'archives-iii-hedge');
 for(const key of ['name','species','speciesSkills','randomTalents','talentChoices','careerMode','careerAttempts','careerOffers','rolls','charMode','charRolls','background'])assert.deepEqual(s[key],original[key],key);
 assert.deepEqual(s.skillChoices,{'s-2':'Melee (Basic)'});assert.deepEqual(s.boost,original.boost);assert.deepEqual(s.careerSkills,{});assert.equal(s.freeTalent,'');assert.deepEqual(s.spells,[]);assert.deepEqual(s.spellLores,{});assert.deepEqual(s.gearChoices,{});assert.deepEqual(s.purchases,[]);assert.equal(s.wealth,null);
 assert.equal(M.career(V,s).source.book,'archives-iii-hedge');
 assert.ok(M.careerSkillSlots(V,s,1).some(x=>x.name==='Animal Care'));
 assert.equal(M.career(catalogForCharacter(library,JSON.parse(JSON.stringify(s))),s).source.book,'archives-iii-hedge');
 assert.ok(V.selection.some(x=>x.id==='winds-of-magic'));
 const C=switchCareerVariant(library,V,s,'');
 assert.equal(M.career(C,s).source.book,'core');assert.equal(M.career(catalogForCharacter(library,s),s).source.book,'core');
 assert.deepEqual(C.selection,B.selection);
});
test('Unavailable or XP-locked variant changes fail without altering character',()=>{
 for(const [catalog,career,id,ledger] of [[R,'hedge-witch','archives-iii-hedge',[]],[B,'soldier','archives-iii-hedge',[]],[B,'hedge-witch','unknown',[]],[B,'hedge-witch','archives-iii-hedge',[{type:'skill',name:'Animal Care',cost:50}]]]){
  const s={...M.fresh(),career,ledger,books:bookSelection(catalog)},before=structuredClone(s);
  assert.throws(()=>switchCareerVariant(library,catalog,s,id),/unavailable|advancement/);assert.deepEqual(s,before);
 }
});
