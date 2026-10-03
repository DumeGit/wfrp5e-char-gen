import {KEYS,canon,base,options,skillInfo,talentInfo} from './rules.mjs';

export const BOOK_SCHEMA=1;
const arrays=['careers','skills','talents','spells','gear','weapons','armour','market','tables','origins'];
const files=new Set([...arrays,'species','background','career-rolls','source','config','rules']);
const settings=new Set(['talentEffects','talentLimits','talentOptions','skillOptions','colours','gods','blessings','classKit','containers','carriers','gearEnc']);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const strings=x=>Array.isArray(x)&&x.every(nonempty);
const slug=x=>x.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const fail=message=>{throw Error(`Book pack: ${message}`);};
const pageOK=p=>Number.isInteger(p)&&p>0||typeof p==='string'&&/^\d+(?:[–—-]\d+)?$/.test(p);
const unsafe=x=>['__proto__','prototype','constructor'].includes(x);
const columns={
 careers:['class','species','advanceScheme','levels','runtimeId'],skills:['char','advanced','grouped','options'],talents:['text','unavailable'],spells:['category','text','range','target','duration','cn'],gear:['price','enc','capacity','availability','category','text','ammunition','wearable'],market:['price','enc','availability','category','text','ammunition','wearable'],weapons:['group','enc','reach','damage','qualities','kind','text'],armour:['enc','locations','ap','qualities','quick'],species:['offsets','languages','fate','fortune','movement','age','height','skills','talents','randomTalents'],background:['forenames','surnames','eyes','hair','clans'],tables:['kind','sides','rows','species','career'],origins:['species','languages','skills','talents','randomTalents','background','optionalTalent','careerChoices','allowedPatrons']
};

export function validateManifest(p){
 if(!plain(p)||p.schemaVersion!==BOOK_SCHEMA||!/^\w[\w-]*$/.test(p.id)||!nonempty(p.title)||!nonempty(p.version))fail('invalid manifest identity or schema.');
 if(!['core','supplement','variant'].includes(p.kind)||![4,5].includes(p.edition))fail(`${p.id}: invalid kind or edition.`);
 if(!strings(p.dependsOn)||p.dependsOn.includes(p.id))fail(`${p.id}: invalid dependencies.`);
 if(!plain(p.source)||!nonempty(p.source.file)||! /^[a-f0-9]{64}$/i.test(p.source.sha256))fail(`${p.id}: source file and SHA-256 are required.`);
 if(p.edition===4&&(!p.compatibility?.reviewed||!strings(p.compatibility.notes)||!p.compatibility.notes.length))fail(`${p.id}: Fourth Edition conversion review is required.`);
 if(!plain(p.files)||Object.keys(p.files).some(k=>!files.has(k)))fail(`${p.id}: unsupported data file.`);
 if(p.kind!=='core'&&['config','source','career-rolls'].some(k=>k in p.files))fail(`${p.id}: use rules or explicit tables rather than replacing core configuration.`);
 return p;
}

// readJSON is injected so the exact browser loader is also used by build/tests.
export async function loadBookLibrary(readJSON,registryURL=new URL('./data/books/index.json',import.meta.url)){
 const index=await readJSON(registryURL);
 if(index.schemaVersion!==BOOK_SCHEMA||index.core!=='core'||!Array.isArray(index.packs))fail('invalid registry; the Fifth Edition base pack must be core.');
 const seen=new Set();
 for(const item of index.packs){
  if(!nonempty(item.id)||seen.has(item.id)||!nonempty(item.path))fail('duplicate or invalid registered book.');
  seen.add(item.id);
 }
 const packs=await Promise.all(index.packs.map(async item=>{
  const url=new URL(item.path,registryURL);
  if(url.origin!==registryURL.origin||!url.href.startsWith(new URL('./',registryURL).href))fail('manifest must be inside the books directory.');
  const manifest=validateManifest(await readJSON(url));if(manifest.id!==item.id)fail('registry and manifest IDs differ.');
  const entries=await Promise.all(Object.entries(manifest.files).map(async([key,path])=>{
   if(!nonempty(path))fail(`${item.id}: missing file path.`);
   const file=new URL(path,url),dataRoot=new URL('../',registryURL);
   if(file.origin!==url.origin||!file.href.startsWith(dataRoot.href))fail(`${item.id}: data must stay inside the data directory.`);
   return [key,await readJSON(file)];
  }));
  return {manifest,data:Object.fromEntries(entries)};
 }));
 const core=packs.find(p=>p.manifest.id===index.core);if(!core||core.manifest.kind!=='core'||packs.filter(p=>p.manifest.kind==='core').length!==1)fail('exactly one registered core book is required.');
 for(const p of packs)for(const id of p.manifest.dependsOn)if(!seen.has(id))fail(`${p.manifest.id}: missing dependency ${id}.`);
 // Validate every pack, including disabled ones, in its dependency context.
 const library={schemaVersion:BOOK_SCHEMA,core:index.core,packs};
 for(const p of packs)assembleBooks(library,[p.manifest.id]);
 return library;
}

export function selectedPacks(library,ids=[library.core]){
 if(!strings(ids)||new Set(ids).size!==ids.length)fail('invalid selected books.');
 const result=[],done=new Set(),visiting=new Set();
 function visit(id){
  if(done.has(id))return;if(visiting.has(id))fail(`dependency cycle at ${id}.`);
  const p=library.packs.find(p=>p.manifest.id===id);if(!p)fail(`unknown book ${id}.`);
  visiting.add(id);for(const dep of p.manifest.dependsOn)visit(dep);visiting.delete(id);done.add(id);result.push(p);
 }
 visit(library.core);for(const id of ids)visit(id);return result;
}

function entryFor(pack,kind,value,key){
 const entry=structuredClone(value);
 if(!plain(entry)||!pageOK(entry.page))fail(`${pack.id}/${kind}: a printed page is required.`);
 const allowed=new Set(['id','contentId','name','page','conversion','replaces','reason',...columns[kind]]);
 if(Object.keys(entry).some(k=>!allowed.has(k)))fail(`${pack.id}/${kind}: unsupported fields need an implemented rule handler.`);
 entry.name??=key;
 if(!nonempty(entry.name))fail(`${pack.id}/${kind}: name is required.`);
 const identity=entry.contentId||entry.id||`${pack.id}:${kind}:${slug(entry.name)}`;
 entry.contentId=identity.startsWith(pack.id+':')?identity:`${pack.id}:${kind}:${identity}`;
 if(pack.kind!=='core'&&(!nonempty(value.id)||!value.id.startsWith(pack.id+':')))fail(`${pack.id}/${kind}: explicit namespaced ID is required.`);
 entry.id??=entry.contentId;
 if(entry.runtimeId){if(pack.kind!=='variant'||!entry.replaces||kind!=='careers')fail('runtimeId is only supported on Career replacements.');entry.id=entry.runtimeId;}
 entry.source={book:pack.id,page:entry.page};
 if(entry.conversion!==undefined&&(!nonempty(entry.conversion)))fail(`${entry.contentId}: conversion note must be text.`);
 return entry;
}
function mergeEntry(R,pack,kind,value,key){
 const entry=entryFor(pack,kind,value,key),list=kind==='species'||kind==='background'?Object.values(R[kind]).filter(plain):R[kind];
 const old=list.find(x=>x.contentId===value.replaces);
 if(value.replaces){
  if(pack.kind!=='variant'||!old||!nonempty(value.reason))fail(`${entry.contentId}: replacement needs a selected variant, existing target and reason.`);
  if(old.name!==entry.name||old.id!==entry.id&&kind==='careers'||kind==='weapons'&&old.kind!==entry.kind)fail(`${entry.contentId}: replacement must preserve the target name, weapon kind and Career ID via runtimeId.`);
  entry.replaces=old.contentId;
  if(kind==='species'||kind==='background')R[kind][key]=entry;else R[kind][R[kind].indexOf(old)]=entry;
 }else{
  const sameName=x=>kind==='talents'?base(canon(x.name)).toLowerCase()===base(canon(entry.name)).toLowerCase():x.name.toLowerCase()===entry.name.toLowerCase()&&(kind!=='weapons'||x.kind===entry.kind);
  if(list.some(x=>x.contentId===entry.contentId||sameName(x)||x.id===entry.id))fail(`${entry.contentId}: duplicate option; declare an explicit variant replacement.`);
  if(kind==='species'||kind==='background')R[kind][key]=entry;else R[kind].push(entry);
 }
}
function applyRules(R,p,rules){
 if(!Array.isArray(rules))fail(`${p.id}: rules must be an array.`);
 for(const rule of rules){
  if(!plain(rule)||!nonempty(rule.id)||!rule.id.startsWith(p.id+':')||!strings(rule.path)||![1,2].includes(rule.path.length)||rule.path.some(unsafe)||!settings.has(rule.path[0])||!pageOK(rule.page)||!nonempty(rule.reason))fail(`${p.id}: unsupported or unsourced rule extension.`);
  if(rule.path[0]==='talentOptions'&&['Artistic','Arcane Magic','Bless','Invoke','Craftsman','Master Tradesman','Savant'].includes(rule.path[1]))fail(`${rule.id}: change the relevant Skill, gods or colours instead of a derived option list.`);
  const [group,key]=rule.path,target=key===undefined?R.config:R.config[group],field=key??group;
  if(!plain(target))fail(`${rule.id}: invalid setting path.`);
  const existing=Object.hasOwn(target,field);
  if(rule.operation==='add'){if(existing)fail(`${rule.id}: setting already exists.`);target[field]=structuredClone(rule.value);}
  else if(rule.operation==='append'){if(!Array.isArray(target[field])||!strings(rule.value)||rule.value.some(x=>target[field].includes(x)))fail(`${rule.id}: append requires new array options.`);target[field].push(...rule.value);}
  else if(rule.operation==='replace'){if(p.kind!=='variant'||!existing)fail(`${rule.id}: rule replacement requires a selected variant.`);target[field]=structuredClone(rule.value);}
  else fail(`${rule.id}: unknown rule operation.`);
  R.ruleSources[JSON.stringify(rule.path)]={book:p.id,page:rule.page,reason:rule.reason};
  R.rules.push({...structuredClone(rule),contentId:rule.id,source:{book:p.id,page:rule.page}});
 }
}

export function assembleBooks(library,ids=[library.core]){
 const packs=selectedPacks(library,ids),R={species:{},background:{},config:{},rules:[],ruleSources:{},books:packs.map(p=>({...p.manifest,files:undefined})),selection:packs.map(p=>({id:p.manifest.id,version:p.manifest.version}))};
 for(const key of arrays)R[key]=[];
 for(const {manifest:p,data}of packs){
  if(p.kind==='core'){
   R.source=structuredClone(data.source);R.config=structuredClone(data.config);R['career-rolls']=structuredClone(data['career-rolls']);
  }
  for(const key of arrays){if(data[key]===undefined)continue;if(!Array.isArray(data[key]))fail(`${p.id}: ${key} must be an array.`);for(const entry of data[key]){
   mergeEntry(R,p,key,entry);
  }}
  for(const key of ['species','background']){if(data[key]===undefined)continue;if(!plain(data[key]))fail(`${p.id}: ${key} must be an object.`);for(const [name,value]of Object.entries(data[key])){
   if(unsafe(name))fail('unsafe content key.');
   if(key==='background'&&name==='doomings'){if(p.kind!=='core')fail('alternate Dooming tables need an implemented rule handler.');R.background.doomings=structuredClone(value);continue;}
   mergeEntry(R,p,key,value,name);
  }}
  if(data.rules)applyRules(R,p,data.rules);
 }
 validateCatalog(R);
 return R;
}

export function validateCatalog(R){
 const C=R.config;
 if(!plain(C)||Object.keys(C).some(k=>!settings.has(k)))fail('unsupported core setting.');
 for(const key of settings)if(!(key in C))fail(`missing setting ${key}.`);
 for(const key of ['gods','colours'])if(!strings(C[key])||!C[key].length||new Set(C[key]).size!==C[key].length)fail(`invalid ${key}.`);
 for(const key of ['talentOptions','skillOptions','blessings','classKit'])if(!plain(C[key])||Object.values(C[key]).some(x=>!strings(x)))fail(`invalid ${key}.`);
 for(const [name,opts]of Object.entries(C.skillOptions))if(!R.skills.some(x=>x.name===name&&x.grouped)||new Set(opts).size!==opts.length||opts.some(x=>R.skills.find(s=>s.name===name).options.includes(x)))fail(`${name}: invalid additional Skill specialisations.`);
 for(const key of ['containers','carriers','gearEnc'])if(!plain(C[key])||Object.values(C[key]).some(x=>!Number.isFinite(x)||x<0))fail(`invalid ${key}.`);
 if(!plain(C.talentEffects)||Object.values(C.talentEffects).some(x=>!KEYS.includes(x)))fail('invalid Talent Characteristic effects.');
 if(!plain(C.talentLimits)||Object.values(C.talentLimits).some(x=>x!==null&&(!Number.isInteger(x)||x<1)))fail('invalid Talent repeat limits.');
 const ids=new Set();for(const key of arrays.concat('species','background','rules'))for(const x of (Array.isArray(R[key])?R[key]:Object.values(R[key])).filter(plain)){if(ids.has(x.contentId))fail(`duplicate content ID ${x.contentId}.`);ids.add(x.contentId);}
 for(const x of R.skills)if(!KEYS.includes(x.char)||typeof x.advanced!=='boolean'||typeof x.grouped!=='boolean'||x.grouped&&!strings(x.options))fail(`${x.name}: invalid Skill.`);
 for(const x of R.talents)if(!nonempty(x.text)||x.unavailable!==undefined&&!nonempty(x.unavailable))fail(`${x.name}: Talent description and unavailability reason must be text.`);
 for(const x of R.spells)if(!['text','category','range','target','duration'].every(k=>nonempty(x[k])))fail(`${x.name}: incomplete spell.`);
 for(const [name,sp]of Object.entries(R.species)){
  if(!plain(sp.offsets)||KEYS.some(k=>!Number.isFinite(sp.offsets[k]))||!strings(sp.languages)||!strings(sp.skills)||!Array.isArray(sp.talents)||sp.talents.some(x=>!strings(x)||!x.length)||!['fate','fortune','movement','randomTalents'].every(k=>Number.isInteger(sp[k])&&sp[k]>=0)||!['age','height'].every(k=>Array.isArray(sp[k])&&sp[k].length===2&&sp[k].every(x=>Number.isInteger(x)&&x>=0)))fail(`${name}: incomplete Species.`);
  const b=R.background[name];if(!b||!['forenames','surnames','eyes','hair'].every(k=>strings(b[k])&&b[k].length))fail(`${name}: background suggestions are required.`);
  for(const raw of sp.skills)if(!skillInfo(R,raw))fail(`${name}: unknown Skill ${raw}.`);
  for(const choices of sp.talents)for(const raw of choices)if(!talentInfo(R,raw))fail(`${name}: unknown Talent ${raw}.`);
 }
 for(const c of R.careers){
  if(!strings(c.species)||!c.species.length||c.species.some(x=>!R.species[x])||!C.classKit[c.class]||!plain(c.advanceScheme)||KEYS.some(k=>![null,1,2,3,4].includes(c.advanceScheme[k]))||!Array.isArray(c.levels)||c.levels.length!==4)fail(`${c.name}: invalid Career structure.`);
  c.levels.forEach((l,i)=>{
   if(l.level!==i+1||!nonempty(l.name)||!['Brass','Silver','Gold'].includes(l.status)||!Number.isInteger(l.standing)||l.standing<0||!['skills','talents','trappings'].every(k=>strings(l[k])))fail(`${c.name}: invalid Career level ${i+1}.`);
   for(const raw of l.skills)for(const n of options(R,raw))if(!skillInfo(R,n))fail(`${c.name}: unknown Skill ${n}.`);
   for(const raw of l.talents)if(!talentInfo(R,raw))fail(`${c.name}: unknown Talent ${raw}.`);
  });
 }
 for(const kind of ['gear','market'])for(const x of R[kind]){
  if(typeof x.price!=='string'||x.enc!==null&&(!Number.isFinite(x.enc)||x.enc<0)||x.wearable!==undefined&&typeof x.wearable!=='boolean'||x.text!==undefined&&!nonempty(x.text))fail(`${x.name}: invalid equipment data.`);
  if(x.ammunition&&(!plain(x.ammunition)||Object.keys(x.ammunition).some(k=>!['range','damage','qualities'].includes(k))||!['range','damage','qualities'].every(k=>nonempty(x.ammunition[k]))))fail(`${x.name}: incomplete ammunition reference.`);
 }
 const shopNames=new Map();for(const x of [...R.gear,...R.market]){const name=x.name.toLowerCase(),previous=shopNames.get(name);if(previous&&!(previous.source.book==='core'&&x.source.book==='core'&&previous.page!==x.page&&previous.price===x.price&&previous.enc===x.enc))fail(`${x.name}: duplicate shop option across gear and market.`);shopNames.set(name,x);}
 const runtimeIds=new Set();for(const c of R.careers){if(runtimeIds.has(c.id))fail(`duplicate Career ID ${c.id}.`);runtimeIds.add(c.id);}
 for(const w of R.weapons)if(!['melee','ranged'].includes(w.kind)||!['group','reach','damage'].every(k=>nonempty(w[k]))||!Number.isFinite(w.enc)||w.enc<0||typeof w.qualities!=='string'||w.text!==undefined&&!nonempty(w.text))fail(`${w.name}: incomplete weapon profile.`);
 for(const a of R.armour)if(!nonempty(a.locations)||!Number.isFinite(a.enc)||a.enc<0||!Number.isInteger(a.ap)||a.ap<0||typeof a.qualities!=='string')fail(`${a.name}: incomplete armour profile.`);
 for(const [name,char]of Object.entries(C.talentEffects))if(!talentInfo(R,name))fail(`unknown effect Talent ${name}.`);
 for(const name of Object.keys(C.talentLimits))if(!talentInfo(R,name))fail(`unknown repeat-limit Talent ${name}.`);
 for(const name of Object.keys(R.species))if(!R.careers.some(c=>c.species.includes(name)))fail(`${name}: no available Career.`);
 for(const o of R.origins){
  if(!R.species[o.species]||['languages','skills'].some(k=>o[k]!==undefined&&!strings(o[k]))||o.talents!==undefined&&(!Array.isArray(o.talents)||o.talents.some(x=>!strings(x)||!x.length))||o.randomTalents!==undefined&&(!Number.isInteger(o.randomTalents)||o.randomTalents<0))fail(`${o.name}: invalid regional creation profile.`);
  for(const name of o.skills||[])for(const n of options(R,name))if(!skillInfo(R,n))fail(`${o.name}: unknown Skill ${n}.`);
  for(const name of (o.talents||[]).flat().concat(o.optionalTalent||[]))if(!talentInfo(R,name))fail(`${o.name}: unknown Talent ${name}.`);
  if(o.background&&(!plain(o.background)||Object.keys(o.background).some(k=>!['forenames','surnames','page'].includes(k))||!pageOK(o.background.page)||['forenames','surnames'].some(k=>!strings(o.background[k])||!o.background[k].length)))fail(`${o.name}: invalid regional name suggestions.`);
  if(o.allowedPatrons&&(!strings(o.allowedPatrons)||o.allowedPatrons.some(n=>!C.gods.includes(n))))fail(`${o.name}: unknown regional patron.`);
  if(o.careerChoices){if(!plain(o.careerChoices))fail(`${o.name}: invalid regional Career choices.`);for(const [from,to]of Object.entries(o.careerChoices)){if(!runtimeIds.has(from)||!strings(to)||to.some(id=>!R.careers.some(c=>c.id===id&&c.species.includes(o.species))))fail(`${o.name}: unavailable regional Career choice.`);}}
 }
 for(const god of C.gods){if(!C.blessings[god]?.length||C.blessings[god].some(n=>!R.spells.some(x=>x.name===`Blessing of ${n}`)))fail(`${god}: missing Blessings.`);if(!R.spells.some(x=>x.category===god))fail(`${god}: missing Miracles.`);}
 for(const lore of C.colours)if(!R.spells.some(x=>x.category===lore))fail(`${lore}: missing Lore spells.`);
 for(const table of R.tables){
  if(!['species','career','talent','career-refinement'].includes(table.kind)||table.sides!==100||!Array.isArray(table.rows)||!table.rows.length||table.kind==='career'&&!R.species[table.species]||table.kind==='career-refinement'&&!runtimeIds.has(table.career))fail(`${table.id}: invalid roll table.`);
  for(let n=1;n<=100;n++){const rows=table.rows.filter(r=>n>=r.min&&n<=r.max);if(rows.length!==1)fail(`${table.id}: result ${n} is missing or overlapping.`);}
  for(const row of table.rows){
   if(!Number.isInteger(row.min)||!Number.isInteger(row.max)||row.min<1||row.max>100||row.min>row.max||!nonempty(row.result))fail(`${table.id}: invalid row.`);
   if(table.kind==='species'&&!R.species[row.result]||table.kind==='talent'&&!talentInfo(R,row.result)||table.kind==='career'&&!R.careers.some(c=>c.id===row.result&&c.species.includes(table.species))||table.kind==='career-refinement'&&!runtimeIds.has(row.result))fail(`${table.id}: unavailable result ${row.result}.`);
  }
 }
 if(!R.tables.some(x=>x.kind==='species'))fail('a Species roll table is required.');
 return R;
}

export function bookSelection(R){return {schemaVersion:BOOK_SCHEMA,packs:R.selection.map(x=>({...x}))};}
export function catalogForCharacter(library,character){
 const selection=character.books;
 if(selection?.schemaVersion!==BOOK_SCHEMA||!Array.isArray(selection.packs)||!selection.packs.length)fail('this character needs a current book selection; start a new WIP character.');
 for(const ref of selection.packs){const p=library.packs.find(x=>x.manifest.id===ref.id);if(!p||p.manifest.version!==ref.version)fail(`missing or different book version: ${ref.id}.`);}
 const R=assembleBooks(library,selection.packs.map(x=>x.id));
 if(R.selection.length!==selection.packs.length||R.selection.some((ref,i)=>ref.id!==selection.packs[i].id||ref.version!==selection.packs[i].version))fail('saved book dependencies or order do not match.');
 return R;
}
export function randomTable(R,s,kind){
 const available=R.tables.filter(x=>x.kind===kind&&(kind!=='career'||x.species===s.species));
 const selected=s.rollTables?.[kind];
 if(selected&&!available.some(x=>x.id===selected))fail(`unavailable ${kind} random table.`);
 // Book additions never change the active table implicitly.
 return available.find(x=>x.id===selected)||available.find(x=>x.source.book==='core')||null;
}
export function tableResult(table,n){if(!table||!Number.isInteger(n)||n<1||n>table.sides)fail('invalid table roll.');return table.rows.find(x=>n>=x.min&&n<=x.max).result;}
