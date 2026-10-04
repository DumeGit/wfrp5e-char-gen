// Explicit, validated creation mechanics from selected Species profiles.
// Normal core Species have no overrides and keep their existing behavior.
export const speciesMechanics=(R,s)=>R.species[s.species]?.mechanics||{};
export function speciesSkillName(R,s,name){return speciesMechanics(R,s).skillReplacements?.[name]||name;}
export function skillCharacteristic(R,s,name,normal){return speciesMechanics(R,s).skillCharacteristics?.[name]||normal;}
export function speciesSize(R,s){return speciesMechanics(R,s).size||'Average';}
export function speciesLoreIssue(R,s,lore){
 if(lore==='Magick')return '';
 lore=({Aqshy:'Fire',Azyr:'Heavens',Chamon:'Metal',Ghur:'Beasts',Ghyran:'Life',Hysh:'Light',Shyish:'Death',Ulgu:'Shadows'})[lore]||lore;
 const allowed=speciesMechanics(R,s).arcaneLores;
 if(allowed&&!allowed.includes(lore)){const source=R.species[s.species].source;return `${s.species} may learn only ${allowed.join(', ')} with the implemented creation options (${source.book} p. ${s.species==='Ogre'?31:source.page}).${s.species==='Ogre'?' Firebelly modifications require the GM and are not defined here.':''}`;}
 const exclusive=Object.entries(R.species).filter(([,sp])=>sp.mechanics?.exclusiveLores?.includes(lore)).map(([name])=>name);
 if(exclusive.length&&!exclusive.includes(s.species))return `${lore} is available to ${exclusive.join(' or ')} characters (${R.species[exclusive[0]].source.book} p. 32).`;
 return '';
}
export function speciesMagicReferences(R,s,talents){
 if(!talents.some(t=>/^(Petty Magic|Arcane Magic \(|Witch!)/.test(t)))return [];
 return (speciesMechanics(R,s).magicReferences||[]).filter(x=>!x.lore||talents.includes(`Arcane Magic (${x.lore})`)).map(x=>({...x,source:{book:R.species[s.species].source.book,page:x.page}}));
}
export function speciesReferences(R,s){return (speciesMechanics(R,s).references||[]).map(x=>({...x,source:{book:R.species[s.species].source.book,page:x.page}}));}
