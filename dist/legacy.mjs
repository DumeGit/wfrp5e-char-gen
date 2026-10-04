// Presentation provenance only. Legacy labels never change names, IDs or game rules.
export const LEGACY_EXPLANATION='Fourth Edition material adapted for this Fifth Edition creator. Printed options and their reviewed conversions are included; a reused core definition remains a Fifth Edition rule.';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function legacySources(R,entry){
 const found=new Map();
 const add=source=>{if(source&&R.books?.some(b=>b.id===source.book&&b.edition===4))found.set(`${source.book}:${source.page}`,source);};
 for(const source of [entry?.source,entry?.definition,entry?.eligibility,entry?.grantSource,entry?.swapSource,...(entry?.legacySources||[])])add(source);
 // Effective core Careers retain their core identity while a supplement changes a level.
 for(const level of entry?.levels||[])add(level.source);
 for(const note of entry?.adaptationNotes||[])add({book:'high-elf',page:note.page});
 if(entry?.discount?.startsWith('Blood of Aenarion'))add({book:'high-elf',page:51});
 return [...found.values()];
}
export const isLegacy=(R,entry)=>legacySources(R,entry).length>0;
export const legacyName=(R,entry,name=entry?.displayName||entry?.name||'')=>isLegacy(R,entry)?`${name} · Legacy`:name;
export const legacyPDFName=(R,entry,name=entry?.displayName||entry?.name||'')=>isLegacy(R,entry)?`[Legacy] ${name}`:name;
export function legacyTag(R,entry){
 if(!isLegacy(R,entry))return '';
 const sources=legacySources(R,entry).map(s=>`${R.books.find(b=>b.id===s.book)?.shortTitle||s.book}${s.page?` p. ${s.page}`:''}`).join('; ');
 return `<span class="legacy-tag" title="${esc(`${LEGACY_EXPLANATION} ${sources}${entry?.conversion?'. '+entry.conversion:''}`)}">Legacy</span>`;
}
