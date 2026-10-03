import {careerRefinementTable,regionalCareerChoices} from './origins.mjs';
import {tableResult} from './books.mjs';

export function storedRefinement(s,id=s.career){return Object.values(s.careerRefinements||{}).find(x=>x.career===id)||null;}

export function refineCareer(R,s,roll){
 if(s.careerMode==='choose')throw Error('First roll a Career using its printed core table.');
 if(s.careerRefinement||storedRefinement(s))throw Error('This Career result already received its optional refinement roll.');
 const table=careerRefinementTable(R,s);if(!table)throw Error('No optional military table for this Career.');
 const n=roll(table.sides,table.page,table.name,table.source),result=tableResult(table,n),printed=R.careers.find(c=>c.id===result),original=R.careers.find(c=>c.id===s.career),legal=printed.species.includes(s.species),book=R.books.find(b=>b.id===table.source.book).shortTitle;
 const message=legal?`Optional d100 ${n}: ${printed.name} (${book} p. ${table.page}).`:`Optional d100 ${n}: ${printed.name} is unavailable to ${s.species} characters. Retained ${original.name}; no additional reroll (${book} p. ${table.page}).`;
 if(s.rolls?.length){s.rolls.at(-1).result=result;s.rolls.at(-1).label+=legal?` → ${printed.name}`:` → ${printed.name}; unavailable for ${s.species}, retained ${original.name}`;}
 return {base:s.career,career:legal?result:s.career,result,roll:n,source:table.source,message};
}

export function regionalCareer(R,s,id){
 const base=s.regionalCareerBase||s.career;
 if(s.careerMode==='choose'||!regionalCareerChoices(R,s,base).includes(id))throw Error('Choose a printed Tilean alternative to your rolled Career.');
 return {base,career:id};
}
