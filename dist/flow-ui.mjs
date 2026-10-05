import * as M from './rules.mjs';
import {esc,careerResults,careerDifferences} from './workspace.mjs';
import {sourceLabel} from './sources.mjs';
import {legacyTag} from './legacy.mjs';
import {gearSlots,gearOptions} from './equipment.mjs';
import {careerVariantPanel} from './career-variants.mjs';
import {dwarfCareerPanel} from './dwarf-guide-ui.mjs';
import {elfCareerPanel} from './high-elf-ui.mjs';
import {collegePanel} from './winds-of-magic-ui.mjs';

export function careerBrowser(R,s,filters){
 const available=careerResults(R,s),results=careerResults(R,s,filters),preview=R.careers.find(x=>x.id===filters.preview)||M.career(R,s);
 const effective=preview.id===s.career?M.career(R,s):M.career(R,{...s,career:preview.id,dwarfCareerUpdates:{},highElf:s.highElf?{...s.highElf,careerVariant:'standard'}:undefined}),first=effective.levels[0];
 return `<section class="career-browser"><div class="browser-filters"><div class="field"><label for="career-search">Find a Career</label><input id="career-search" type="search" data-search="career" value="${esc(filters.query)}" placeholder="Name, Class or starting Skill"></div><div class="field"><label for="class-filter">Class</label><select id="class-filter" data-bind="careerFilter">${['All classes',...[...new Set(available.map(x=>x.class))].sort()].map(x=>`<option ${x===filters.className?'selected':''}>${esc(x)}</option>`).join('')}</select></div><div class="field"><label for="career-book">Source</label><select id="career-book" data-bind="careerBook"><option value="all">All selected books</option>${R.books.filter(b=>available.some(c=>c.source.book===b.id)).map(b=>`<option value="${esc(b.id)}" ${filters.book===b.id?'selected':''}>${esc(b.shortTitle||b.title)}</option>`).join('')}</select></div></div><p class="small muted" aria-live="polite">${results.length} matching Careers. Previewing keeps your character unchanged.</p><div class="career-results">${results.slice(0,filters.limit).map(c=>`<button type="button" class="career-result ${c.id===preview.id?'previewed':''}" data-action="career-preview" data-id="${esc(c.id)}" aria-pressed="${c.id===preview.id}"><strong>${esc(c.name)}</strong><small>${esc(c.class)} · ${esc(sourceLabel(R,c,{legacy:false}))}</small><span>${Object.entries(M.career(R,{...s,career:c.id,dwarfCareerUpdates:{},highElf:s.highElf?{...s.highElf,careerVariant:'standard'}:undefined}).advanceScheme).filter(([,v])=>v===1).map(([k])=>k).join(' · ')}${c.id===s.career?' · Current':''}</span></button>`).join('')}</div>${results.length>filters.limit?'<button type="button" class="quiet" data-action="career-more">Show more Careers</button>':''}${!results.length?'<p class="empty">No matching Careers. Try another search or filter.</p>':''}<article class="career-preview"><div class="split"><h3>${esc(preview.name)} ${legacyTag(R,effective)}</h3><span class="counter">${preview.id===s.career?'Current Career':'Preview only'}</span></div><p>${esc(first.name)} · ${first.status} ${first.standing} · ${esc(sourceLabel(R,effective,{legacy:false}))}</p><p><strong>Starting Skills:</strong> ${esc(first.skills.join(', '))}</p><p><strong>Starting Talents:</strong> ${esc(first.talents.join(', '))}</p><p><strong>Starting kit:</strong> ${esc(first.trappings.join(', '))}</p>${preview.id!==s.career?`<button type="button" class="primary" data-action="career-apply" data-id="${esc(preview.id)}" ${s.ledger.length?'disabled':''}>Choose ${esc(preview.name)}</button>`:''}</article></section>`;
}

export function careerOptions(R,s){
 const parts=[careerVariantPanel(R,s),dwarfCareerPanel(R,s),elfCareerPanel(R,s)].filter(Boolean);
 return parts.length?`<details class="career-options section-gap" open><summary>Career options <span class="minilabel">Optional profiles, levels & equipment</span></summary><p class="small muted">Each change shows its effect on training and equipment before you apply it. These choices grant no extra free Advances.</p>${parts.join('')}</details>`:'';
}

export function trainingPrerequisites(R,s,{select,button}){
 const options=M.careerTalentOptions(R,s),problem=s.freeTalent?M.invalidTalent(R,{...s,freeTalent:'',ledger:[]},s.freeTalent):'';
 return `<details class="training-prerequisites section-gap" ${options.some(x=>/^(Bless|Invoke|Arcane Magic|Petty Magic|Sword-dancing)/.test(x))?'open':''}><summary>Training choices before Skills</summary><p class="small muted">You may choose your one free Career Talent now. Your choice is the same one shown in Talents; a patron can unlock conditional training. Equipment alternatives below are also shared with Gear.</p>${collegePanel(R,s)}<div class="field"><label for="prereq-freeTalent">One free Career Talent</label>${select('id="prereq-freeTalent" data-bind="freeTalent"',options.map(n=>[n,n,M.talentInfo(R,n)?.unavailable]),s.freeTalent,true)}</div>${problem?`<p class="purchase-error">${esc(problem)}</p>`:''}${gearSlots(R,s).filter(x=>x.key.startsWith('career-')&&gearOptions(x.name,R).length>1).map(x=>`<div class="field"><label for="prereq-${esc(x.key)}">${esc(x.name)}</label>${select(`id="prereq-${esc(x.key)}" data-bind="gearChoices" data-key="${esc(x.key)}"`,gearOptions(x.name,R),s.gearChoices[x.key]||gearOptions(x.name,R)[0])}</div>`).join('')}${button('step','Continue to Skill allocation','data-step="3"')}</details>`;
}

export function kitSummary(R,s,{select,button,tag}){
 const slots=gearSlots(R,s).filter(x=>!x.marketId),choices=slots.filter(x=>gearOptions(x.name,R).length>1),fixed=slots.filter(x=>gearOptions(x.name,R).length===1);
 const rolled=x=>x.name.replace(/\{?(\d+)d10\}?/g,m=>s.gearRolls[`${x.key}:${m}`]??m);
 return `<h3>Your starting kit</h3><p class="small muted">Class and Career equipment is included automatically, with armour and bags worn and weapons equipped.</p><div class="kit-summary">${fixed.map(x=>`<span class="kit-item"><strong>${esc(rolled(x))}</strong>${tag(x)}<small>${esc(x.origin)}</small></span>`).join('')}</div>${choices.length?`<h3>Choose your equipment <span class="counter">${choices.length} choice${choices.length===1?'':'s'}</span></h3>${choices.map(x=>`<div class="field"><label for="gear-${esc(x.key)}">${esc(x.origin)} · ${esc(x.name)}</label>${select(`id="gear-${esc(x.key)}" data-bind="gearChoices" data-key="${esc(x.key)}"`,gearOptions(x.name,R),s.gearChoices[x.key]||gearOptions(x.name,R)[0])}</div>`).join('')}`:''}${slots.some(x=>/\d+d10/.test(x.name)&&!Object.keys(s.gearRolls).some(k=>k.startsWith(x.key+':')))?button('gear-quantities','Roll unresolved item quantities','','primary'):''}`;
}

export function comparisonHTML(before,after){
 const rows=careerDifferences(before,after);
 return rows.length?`<details open><summary>Profile changes</summary><div class="table-wrap"><table><thead><tr><th>Choice</th><th>Current</th><th>After change</th></tr></thead><tbody>${rows.map(x=>`<tr><th>${esc(x.label)}</th><td>${esc(x.before)}</td><td>${esc(x.after)}</td></tr>`).join('')}</tbody></table></div></details>`:'<p class="small muted">The Career profile is unchanged; dependent choices will be recalculated.</p>';
}
