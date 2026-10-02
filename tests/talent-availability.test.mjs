import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../dist/rules.mjs';
import {R,soldier} from './fixture.mjs';

test('a second Bless explains the normal one-Talent limit even when XP is insufficient',()=>{
 const s=soldier();s.career='priest';s.freeTalent='Bless (Sigmar)';s.xp=0;
 const q=M.quote(R,s,'talent','Bless (Manann)');
 assert.match(q.error,/Already have Bless \(Sigmar\); normally only one Bless Talent \(p\. 116\)/);
 assert.throws(()=>M.purchase(R,s,'talent','Bless (Manann)'),/normally only one Bless/);
 assert.equal(s.ledger.length,0);
});

test('Invoke has its own normal one-Talent limit (p. 121)',()=>{
 const s=soldier();s.freeTalent='Invoke (Sigmar)';
 assert.match(M.invalidTalent(R,s,'Invoke (Morr)'),/normally only one Invoke Talent \(p\. 121\)/);
 assert.match(M.invalidTalent(R,s,'Invoke (Sigmar)'),/Already known/);
});

test('an otherwise valid purchase still explains insufficient XP',()=>{
 const s=soldier();s.xp=99;
 assert.equal(M.quote(R,s,'talent','Drilled').error,'Requires 100 XP; 99 remain.');
 s.xp=100;
 assert.equal(M.quote(R,s,'talent','Drilled').error,'');
});

test('level-two Priest Invoke matches Bless for every patron and rejects other deities',()=>{
 for(const god of R.config.gods){
  const s=M.fresh();s.career='priest';s.freeTalent=`Bless (${god})`;s.xp=100000;
  for(let i=0;i<10;i++)M.purchase(R,s,'char','Int');
  M.purchase(R,s,'promotion','');
  assert.equal(M.derive(R,s).level,2);
  assert.equal(M.quote(R,s,'talent',`Invoke (${god})`).error,'',god);
  for(const other of R.config.gods.filter(x=>x!==god)){
   const before=JSON.stringify(s.ledger);
   const reason=M.quote(R,s,'talent',`Invoke (${other})`).error;
   assert.ok(reason.includes(`Requires Invoke (${god})`),reason);
   assert.throws(()=>M.purchase(R,s,'talent',`Invoke (${other})`),/match your patron/);
   assert.equal(JSON.stringify(s.ledger),before);
  }
  M.purchase(R,s,'talent',`Invoke (${god})`);
  assert.equal(M.spellGrants(R,s).find(x=>x.talent===`Invoke (${god})`).category,god);
 }
});

test('Bless also matches an already established Invoke patron',()=>{
 const s=M.fresh();s.career='priest';s.freeTalent='';s.ledger.push({type:'talent',name:'Invoke (Shallya)',cost:100,tick:true});
 assert.equal(M.invalidTalent(R,s,'Bless (Shallya)'),'');
 assert.match(M.invalidTalent(R,s,'Bless (Ulric)'),/Requires Bless \(Shallya\).*Invoke \(Shallya\)/);
});
