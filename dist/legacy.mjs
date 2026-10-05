// Reviewed changes only: edition and generic compatibility notes are not conversions.
export const LEGACY_EXPLANATION='A printed rule changed for Fifth Edition. Compatible material used unchanged has only its book reference. Hover over a Legacy tag for the specific adaptation.';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mechanics={
 elder:['high-elf',53,'Past-Career points use Fifth Edition individual Advances and creation caps; lost Fate/Resilience becomes a choice of Fate/Fortune.'],
 blood:['high-elf',51,'Psychology uses Fifth Edition core effects; ritual memorisation is included in the Prodigy discount by approved interpretation.'],
 sailor:['high-elf',63,'Approved Fifth Edition Sailor adaptation: Athletics once at L1, no Consume Alcohol, Basic instead of Brawling, Intuition at L2.'],
 elvenArcane:['high-elf',79,'Assigned to the latest acquired Colour Lore for Fifth Edition learning prices and training counts.'],
 longbeard:['dwarf-guide',50,'Approved −1 starting Fate/Fortune conversion; the old zero-Fate Resilience/Resolve fallback remains deferred.'],
 psychometry:['winds-of-magic',48,'Approved Species Talent trade unlocks paid advancement only, with no free Fifth Edition Skill points.'],
 alchemist:['winds-of-magic',39,'Approved Petty Magic grant capped at the smaller of acquisition Willpower Bonus or four.'],
 oldFaith:['archives-iii',58,'Extra Blessing prices count Invoke and purchased Blessings, excluding the six from Bless, using the approved Fifth Edition interpretation.'],
 ogreSizing:['archives-ii',31,'User-approved categories resolve unspecified typical trappings: ordinary weapons, armour, clothing and containers double price/weight; food, ammunition, animals and vehicles retain listed units.'],
 ogreCapacity:['archives-ii',31,'Apply Fifth Edition carrying Talents first, then double capacity, by user-approved interpretation.'],
 astrology:['archives-ii',39,'Star-sign Talent grants use Fifth Edition purchase limits and magic compatibility instead of importing extra incompatible ranks.']
};
export function legacyMechanic(id){const [book,page,adaptation]=mechanics[id]||[];return adaptation?{source:{book,page},adaptation}:null;}
export function legacyCareerSkill(c,name){
 if(['high-elf:career:sea-guard','high-elf:career:merchant-adventurer'].includes(c?.id)&&['Animal Care','Sail'].includes(name))return {source:c.source,adaptation:`Printed grouped ${name} options use one ungrouped Fifth Edition Skill total.`};
 return null;
}
export function legacySources(R,entry){
 const found=new Map();
 const add=(source,adaptation)=>{if(source&&adaptation&&R.books?.some(b=>b.id===source.book&&b.edition===4))found.set(`${source.book}:${source.page}:${adaptation}`,{...source,adaptation});};
 add(entry?.source,entry?.adaptation);
 for(const source of entry?.legacySources||[])add(source,source.adaptation);
 // XP and owned-spell records store source references, not full catalog definitions.
 for(const source of [entry?.source,entry?.definition]){
  if(!source||!entry?.name)continue;
  for(const kind of ['skills','talents','spells','runes','techniques','gear','market','weapons','armour']){
   const name=kind==='talents'?entry.name.split(' (')[0]:entry.name;
   for(const record of R[kind]||[])if(record.source?.book===source.book&&record.name===name&&String(record.source.page)===String(source.page))add(record.source,record.adaptation);
  }
 }
 const eligibility=entry?.eligibility;
 if(entry?.type==='skill'&&eligibility)for(const c of R.careers||[])if(c.source.book===eligibility.book&&c.source.page===eligibility.page){const changed=legacyCareerSkill(c,entry.name);add(changed?.source,changed?.adaptation);}
 if(entry?.type==='talent'&&['Dicer','Striding Gait','Tunnel Fighter','Public Speaker','Trick Rider'].includes(entry.name.split(' (')[0])&&eligibility?.book!=='core')add(eligibility,'Printed older Talent option replaced with its Fifth Edition core definition.');
 if(entry?.type==='talent'&&eligibility?.book==='archives-i'&&eligibility.page===89&&(/^Fearless \(/.test(entry.name)||entry.name==='Savant (Moot)'))add(eligibility,'Unspecified Fearless uses a core enemy-group choice; Savant (Moot terrain) uses core Savant (Moot) and its prerequisite.');
 if(entry?.type==='talent'&&entry.name==='Petty Magic'&&eligibility?.book==='winds-of-magic'&&eligibility.page===39){const x=legacyMechanic('alchemist');add(x.source,x.adaptation);}
 if(entry?.type==='spell'&&eligibility?.book==='archives-iii'&&eligibility.page===58){const x=legacyMechanic('oldFaith');add(x.source,x.adaptation);}
 const patron=entry?.lore||entry?.talent?.match(/^Invoke \((.*)\)$/)?.[1];
 if(entry?.name==='Trickster’s Glamour'&&(patron==='Evawn'||entry.grantSource?.book==='rough-nights'&&entry.grantSource.page===90)||entry?.name==='You Saw Nothing'&&(patron==='Mabyn'||entry.grantSource?.book==='rough-nights'&&entry.grantSource.page===90)){
  const cult=R.cults?.find(x=>x.name===(entry.name==='Trickster’s Glamour'?'Evawn':'Mabyn'));add(cult?.source,cult?.adaptation);
 }
 for(const level of entry?.levels||[])add(level.source,level.adaptation);
 if(entry?.legacySailor){const x=legacyMechanic('sailor');add(x.source,x.adaptation);}
 if(entry?.discount?.startsWith('Blood of Aenarion')){const x=legacyMechanic('blood');add(x.source,x.adaptation);}
 return [...found.values()];
}
export const isLegacy=(R,entry)=>legacySources(R,entry).length>0;
export const legacyName=(R,entry,name=entry?.displayName||entry?.name||'')=>isLegacy(R,entry)?`${name} · Legacy`:name;
export const legacyPDFName=(R,entry,name=entry?.displayName||entry?.name||'')=>isLegacy(R,entry)?`[Legacy] ${name}`:name;
export const legacyTitle=(R,entry)=>legacySources(R,entry).map(s=>`${R.books.find(b=>b.id===s.book)?.shortTitle||s.book}${s.page?` p. ${s.page}`:''}: ${s.adaptation}`).join('; ');
export function legacyTag(R,entry){
 const sources=legacySources(R,entry);if(!sources.length)return '';
 const explanations=legacyTitle(R,entry);
 return `<span class="legacy-tag" title="${esc(explanations)}">Legacy</span>`;
}
