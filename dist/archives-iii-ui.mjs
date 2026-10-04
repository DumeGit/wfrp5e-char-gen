import {archivesIII,cantGrants,knownCants,divineReference} from './archives-iii.mjs';
import {originProfile} from './origins.mjs';
import {sourceLabel} from './sources.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function originTalentChoice(R,s){
 const o=originProfile(R,s);if(!o?.randomTalentAlternative)return '';
 return `<div class="field"><label for="regional-talent-mode">Eastender’s final Species Talent</label><select id="regional-talent-mode" data-bind="originTalentMode"><option value="fixed" ${s.originTalentMode!=='random'?'selected':''}>${esc(o.randomTalentAlternative)}</option><option value="random" ${s.originTalentMode==='random'?'selected':''}>Roll one random Talent</option></select><small class="muted">One starting slot · ${esc(sourceLabel(R,o))}. Changing this clears your starting Talent and magic choices.</small></div>`;
}
export function divinePanel(R,s){return divineReference(R,s).map(x=>`<div class="notice"><strong>${esc(sourceLabel(R,x))}</strong><p>${esc(x.text)}</p></div>`).join('');}
export function cantReview(R,s){const cants=knownCants(R,s);return cants.length?`<h3>Optional Cants · 0 XP</h3>${cants.map(x=>`<details class="spell-description"><summary>${esc(x.name)} · ${esc(x.lore)} ${esc(sourceLabel(R,x))}</summary><p>${esc(x.text)}</p></details>`).join('')}`:'';}
export function cantPanel(R,s){
 if(!archivesIII(R))return '';
 const grants=cantGrants(R,s);
 return `<section class="section-gap" aria-label="Optional Cants"><h3>Optional Cants</h3><label class="check"><input type="checkbox" data-bind="cantsEnabled" ${s.cants?.enabled?'checked':''}> Use Cants from Archives III</label><p class="small muted">Choose a free Cant after learning 1, 3 and 6 spells of a Colour Lore (Archives III p. 86). Each choice costs 0 XP. Casting and power spending are reference rules.</p>${!s.cants?.enabled?'':!grants.length?'<p class="empty">Learn Arcane Magic for a Colour Lore and at least one spell of that Lore to choose your first Cant.</p>':grants.map(g=>`<h3>${esc(g.lore)} · ${g.spells} spell${g.spells===1?'':'s'} · ${g.count} Cant${g.count===1?'':'s'}</h3>${Array.from({length:g.count},(_,i)=>{const selected=s.cants.choices?.[g.lore]?.[i]||'',chosen=g.choices.find(x=>x.id===selected),id=`cant-${g.lore}-${i}`;return `<div class="field"><label for="${id}">${esc(g.lore)} Cant ${i+1}</label><select id="${id}" data-bind="cant" data-lore="${esc(g.lore)}" data-key="${i}"><option value="">Choose…</option>${g.choices.map(x=>`<option value="${esc(x.id)}" ${selected===x.id?'selected':''} ${selected!==x.id&&(s.cants.choices?.[g.lore]||[]).includes(x.id)?'disabled':''}>${esc(x.name)} · ${esc(sourceLabel(R,x))}</option>`).join('')}</select></div>${chosen?`<details class="spell-description"><summary>${esc(chosen.name)} ${esc(sourceLabel(R,chosen))}</summary><p>${esc(chosen.text)}</p></details>`:''}`;}).join('')}`).join('')}</section>`;
}
