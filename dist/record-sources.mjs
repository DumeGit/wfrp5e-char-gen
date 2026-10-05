import * as M from './rules.mjs';
import {creationSpecies,originProfile} from './origins.mjs';
import {equipment} from './equipment.mjs';
import {marketCatalog,purchaseItem} from './market.mjs';
import {knownCants} from './archives-iii.mjs';
import {knownRunes} from './dwarf-guide.mjs';
import {knownTechniques} from './high-elf.mjs';

// The complete creation record always retains owned content and actual decisions.
// Only the catalogue-wide compatibility appendix is optional.
export function characterReferences(R,s){
 const d=M.derive(R,s),c=M.career(R,s),eq=equipment(R,s),shop=marketCatalog(R);
 const records=[creationSpecies(R,s),originProfile(R,s),c,...c.levels,
  ...d.talents.map(name=>M.talentInfo(R,name)),
  ...Object.keys(d.skills).filter(name=>d.skills[name]>0).map(name=>M.skillInfo(R,name,s)),
  ...M.knownSpells(R,s),...knownRunes(R,s,M.derive(R,s).talents),...knownTechniques(R,s),...knownCants(R,s),
  ...s.purchases.map(x=>purchaseItem(R,x)),
  ...eq.entries.map(x=>[...R.gear,...R.weapons,...R.armour,...shop].find(record=>record.name===x.alias))
 ].filter(Boolean);
 const unique=new Map();
 for(const x of records)unique.set(x.contentId||x.id||`${x.source?.book}:${x.source?.page}:${x.name||x.level}`,x);
 return [...unique.values()];
}
