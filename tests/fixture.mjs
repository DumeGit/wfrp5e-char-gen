import fs from 'node:fs';
import * as M from '../dist/rules.mjs';
import {loadBookLibrary,assembleBooks} from '../dist/books.mjs';
export const library=await loadBookLibrary(url=>JSON.parse(fs.readFileSync(url,'utf8')));
export const R=assembleBooks(library);
export function soldier(){const s=M.fresh();s.name='Walther Schmidt';s.appearance='34 years; 5 ft 5 in; grey eyes; dark brown hair';s.points=[16,6,15,15,9,12,5,6,12,4];s.randomTalents=['Read/Write','Super Numerate','Cardsharp','Attractive'];s.freeTalent='Warrior Born';s.speciesSkills=['s-10','s-2','s-4','s-8','s-9'];s.skillChoices={'c1-7':'Melee (Polearm)','c1-9':'Ranged (Bow)'};s.careerSkills={'c1-7':2,'c1-4':1,'c1-3':1,'c1-0':1,'c1-1':1,'c1-5':1,'c1-9':1};s.gearChoices={'career-2':'Halberd (2H)'};s.wealth={amount:71,currency:'brass pennies'};return s;}
export function advancedSoldier(){const s=soldier();for(const [type,name]of [['char','WS'],['char','S'],['talent','Drilled'],['talent','Strong Back'],['skill','Melee (Polearm)'],['skill','Melee (Basic)'],['skill','Cool'],['skill','Endurance'],['skill','Dodge'],['skill','Language (Battle)'],['promotion','']])M.purchase(R,s,type,name);return s;}
