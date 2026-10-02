export function appearanceSummary(s){return [s.appearance,s.background?.eyes?`Eyes: ${s.background.eyes}`:'',s.background?.hair?`Hair: ${s.background.hair}`:'',s.background?.clan?`Clan: ${s.background.clan}`:''].filter(Boolean).join('; ');}
export function suggestion(R,s,kind,roll){const choices=R.background?.[s.species]?.[kind]||[];if(!choices.length)throw Error('No book suggestions for this choice.');const n=roll(choices.length,R.background[s.species].page,kind);return choices[n-1];}
export function suggestedName(R,s,roll){return [suggestion(R,s,'forenames',roll),suggestion(R,s,'surnames',roll)].map(x=>x.replace(/ \([^)]*\)/g,'')).join(' ');}
export function doomingResult(R,n){return R.background.doomings.find(x=>n>=x.min&&n<=x.max);}
