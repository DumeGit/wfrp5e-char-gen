export function appearanceSummary(s){return [s.appearance,s.background?.eyes?`Eyes: ${s.background.eyes}`:'',s.background?.hair?`Hair: ${s.background.hair}`:'',s.background?.clan?`Clan: ${s.background.clan}`:''].filter(Boolean).join('; ');}
export function setAgeHeight(s,age,height){
 // Replace generated prefixes, including duplicates left by older versions.
 const background=(s.appearance||'').replace(/^(?:\d+ years;\s*\d+ ft \d+ in(?:;\s*|$))+/,'');
 s.appearance=`${age} years; ${Math.floor(height/12)} ft ${height%12} in`+(background?`; ${background}`:'');
}
export function bookName(value){return value.replace(/ \([^)]*\)/g,'');}
export function nameParts(s){
 if(s.identity&&typeof s.identity.forename==='string'&&typeof s.identity.surname==='string')return {...s.identity};
 // Old saves keep the full name; only split for display until a part is edited.
 const [forename='',...rest]=(s.name||'').trim().split(/\s+/);
 return {forename,surname:rest.join(' ')};
}
export function setNamePart(s,key,value){
 if(!['forename','surname'].includes(key))throw Error('Unknown name field.');
 s.identity={...nameParts(s),[key]:value};
 s.name=[s.identity.forename.trim(),s.identity.surname.trim()].filter(Boolean).join(' ');
}
export function suggestion(R,s,kind,roll){const choices=R.background?.[s.species]?.[kind]||[];if(!choices.length)throw Error('No book suggestions for this choice.');const n=roll(choices.length,R.background[s.species].page,kind);return choices[n-1];}
export function suggestedName(R,s,roll){return [suggestion(R,s,'forenames',roll),suggestion(R,s,'surnames',roll)].map(bookName).join(' ');}
export function doomingResult(R,n){return R.background.doomings.find(x=>n>=x.min&&n<=x.max);}
