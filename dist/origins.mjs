// Regional creation profiles extend a Species without creating a new Species.
export function originProfile(R,s){return (R.origins||[]).find(x=>x.id===s.origin&&x.species===s.species)||null;}
export function creationSpecies(R,s){const sp=R.species[s.species],o=originProfile(R,s);return o?{...sp,...Object.fromEntries(['languages','skills','talents','randomTalents'].filter(k=>k in o).map(k=>[k,o[k]])),source:o.source,page:o.page}:sp;}
export function creationBackground(R,s){const b=R.background[s.species],o=originProfile(R,s);return o?.background?{...b,...o.background,source:{book:o.source.book,page:o.background.page}}:b;}
export function startingTalentReplacement(R,s){const o=originProfile(R,s);return o?.optionalTalent&&typeof s.originTalentSlot==='string'?{slot:s.originTalentSlot,talent:o.optionalTalent}:null;}
export function careerRefinementTable(R,s,id=s.career){return (R.tables||[]).find(x=>x.kind==='career-refinement'&&x.career===id)||null;}
export function regionalCareerChoices(R,s,id=s.career){return originProfile(R,s)?.careerChoices?.[id]||[];}
