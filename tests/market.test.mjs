import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import * as M from '../dist/rules.mjs';
import {equipment,gearSlots} from '../dist/equipment.mjs';
import {buyTrapping,formatMoney,marketCatalog,priceInPennies,purse} from '../dist/market.mjs';
import {exportSheet} from '../dist/export.mjs';
import {R,soldier} from './fixture.mjs';

test('listed book prices convert exactly across denominations',()=>{
 assert.equal(priceInPennies('4d'),4);
 assert.equal(priceInPennies('1/6'),18);
 assert.equal(priceInPennies('2 GC 10/–'),600);
 assert.equal(priceInPennies('1 GC –/10'),250);
 assert.equal(priceInPennies('Varies'),null);
 assert.equal(formatMoney(71),'5/11');
 assert.equal(formatMoney(258),'1 GC 1/6');
});

test('rolled money buys priced Trappings, enforces balance, and supports removal',()=>{
 const s=soldier(),before=M.derive(R,s).earnedBoxes;
 assert.equal(purse(R,s).start,71);
 assert.equal(marketCatalog(R).some(x=>x.name==='Jewellery'),false);
 assert.equal(marketCatalog(R).some(x=>x.name==='Enchanted Staff'),false);
 buyTrapping(R,s,'308:Pouch');
 buyTrapping(R,s,'303:Sling');
 assert.equal(purse(R,s).spent,16);
 assert.equal(purse(R,s).remaining,55);
 assert.equal(gearSlots(R,s).filter(x=>x.origin==='Bought with starting wealth').length,2);
 assert.equal(equipment(R,s).weapons.filter(x=>x.name==='Sling').length,1);
 assert.equal(M.derive(R,s).earnedBoxes,before);
 assert.throws(()=>buyTrapping(R,s,'307:Breastplate'),/Not enough money/);
 assert.throws(()=>buyTrapping(R,s,'308:Jewellery'),/listed book price/);
 s.purchases.pop();
 assert.equal(purse(R,s).remaining,67);
});

test('purchased armour updates protection and the editable sheet shows remaining coins',async()=>{
 globalThis.PDFLib=PDFLib;
 const s=soldier();s.wealth={amount:4,currency:'gold crowns'};
 buyTrapping(R,s,'307:Leather Jerkin');
 assert.equal(purse(R,s).remaining,360);
 assert.equal(equipment(R,s).armour.filter(x=>x.name==='Leather Jerkin').length,2);
 assert.equal(M.derive(R,s).earnedBoxes,0);
 const bytes=await exportSheet(R,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const form=(await PDFLib.PDFDocument.load(bytes)).getForm();
 assert.equal(form.getTextField('Wealth_Gold_Crowns_GC').getText(),'1');
 assert.equal(form.getTextField('Wealth_Silver_Shillings_SS').getText(),'10');
 assert.equal(form.getTextField('Wealth_Brass_Pennies_D').getText(),'0');
 assert.ok(form.getTextField('Armour_2_Name').getText().includes('Leather Jerkin'));
});

test('older saved characters without a purchases property keep their original purse',()=>{
 const s=soldier();delete s.purchases;
 assert.equal(purse(R,s).remaining,71);
 assert.equal(gearSlots(R,s).filter(x=>x.origin==='Bought with starting wealth').length,0);
});
