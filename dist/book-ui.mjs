import {randomTable} from './books.mjs';
import {sourceLabel} from './sources.mjs';
import {careerSpecies} from './origins.mjs';
import {isCareerVariant} from './career-variants.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function bookPanel(library,R,s){
 const enabled=new Set(R.selection.map(x=>x.id));
 const books=library.packs.filter(x=>!isCareerVariant(x.manifest.id));
 const choices=books.map(({manifest:b})=>`<label class="book-choice"><input type="checkbox" data-book="${esc(b.id)}" ${enabled.has(b.id)?'checked':''} ${b.kind==='core'?'disabled':''}><span><strong>${esc(b.title)}</strong><small>${b.kind==='core'?'Required core rules':b.kind==='variant'?'Optional rule variant':'Additional character options'} · ${esc(b.shortTitle||b.id)}</small></span></label>`).join('');
 const tables=['species','career','talent'].map(kind=>{
  const available=R.tables.filter(x=>x.kind===kind&&(kind!=='career'||x.species===careerSpecies(R,s)));
  const active=randomTable(R,s,kind);if(!available.length||available.length<2&&active)return '';
  return `<div class="field"><label for="table-${kind}">${kind==='talent'?'Random Talents':kind==='species'?'Species':'Career'} roll table</label><select id="table-${kind}" data-bind="rollTable" data-key="${kind}">${!active?'<option value="" selected>Choose a printed table to enable rolls…</option>':''}${available.map(x=>`<option value="${esc(x.id)}" ${x.id===active?.id?'selected':''}>${esc(x.name+' · '+sourceLabel(R,x))}</option>`).join('')}</select></div>`;
 }).join('');
 return `<details class="book-panel" data-group="books"><summary>Books & options <span class="counter">${R.books.filter(b=>!isCareerVariant(b.id)).length}</span></summary><div class="book-choices">${choices}</div>${books.length>1?'<p class="small muted">Changing books starts a new character. Required books are included automatically.</p><button type="button" class="quiet" data-action="apply-books">Use selected books & start new character</button>':'<p class="small muted">The core book is currently the only installed source. Verified supplements will appear here when added.</p>'}${tables?`<h3>Random tables</h3><p class="small muted">Archives II’s Species table is the default while enabled. Other core tables stay the default; a sole Career table is automatic. You can choose an alternative here.</p>${tables}`:''}${R.books.filter(b=>b.kind==='variant'&&!isCareerVariant(b.id)).map(b=>`<p class="small muted">Variant enabled: ${esc(b.title)}</p>`).join('')}</details>`;
}
