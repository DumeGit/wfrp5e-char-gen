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
