import test from 'node:test';
import assert from 'node:assert/strict';
import {bookName,nameParts,setNamePart,suggestion,appearanceSummary} from '../dist/background.mjs';
import {R,soldier} from './fixture.mjs';

test('old full names display as editable parts without changing the saved character',()=>{
 const s=soldier();s.name='Karl von Schwarzburg';s.background={forename:'Unused',surname:'Suggestion'};const before=JSON.stringify(s);
 assert.deepEqual(nameParts(s),{forename:'Karl',surname:'von Schwarzburg'});assert.equal(JSON.stringify(s),before);
 setNamePart(s,'forename','Ludwig');assert.equal(s.name,'Ludwig von Schwarzburg');
});
test('custom multiword names persist and independent edits retain the other part',()=>{
 const s=soldier();setNamePart(s,'forename','Anna Maria');setNamePart(s,'surname','von Altdorf');
 const restored=JSON.parse(JSON.stringify(s));assert.deepEqual(nameParts(restored),{forename:'Anna Maria',surname:'von Altdorf'});
 setNamePart(restored,'surname','the Bold (called Red)');assert.equal(restored.name,'Anna Maria the Bold (called Red)');
 setNamePart(restored,'forename','');assert.equal(restored.name,'the Bold (called Red)');
});
test('independent book rolls retain custom names and strip only book glosses',()=>{
 const s=soldier();setNamePart(s,'surname','von Somewhere');let calls=[];
 const value=suggestion(R,s,'forenames',(sides,page,kind)=>{calls.push({sides,page,kind});return 1;});setNamePart(s,'forename',bookName(value));
 assert.equal(s.name,`${R.background.Human.forenames[0]} von Somewhere`);assert.equal(calls.length,1);assert.equal(calls[0].page,27);
 assert.equal(bookName('Galazil (Golden Haired)'),'Galazil');assert.equal(bookName('The Lightbringer'),'The Lightbringer');
});
test('custom appearance values remain in the export summary',()=>{
 const s=soldier();s.background={eyes:'One blue, one green',hair:'Silver streaks',clan:'My own clan'};
 const text=appearanceSummary(s);assert.ok(text.includes('Eyes: One blue, one green'));assert.ok(text.includes('Hair: Silver streaks'));assert.ok(text.includes('Clan: My own clan'));
});
