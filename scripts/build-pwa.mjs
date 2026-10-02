import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const dist=new URL('../dist/',import.meta.url);
async function files(directory,prefix=''){
 const result=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=prefix+entry.name;
  if(entry.isDirectory())result.push(...await files(new URL(entry.name+'/',directory),path+'/'));
  else if(entry.isFile()&&!['sw.js','vercel.json'].includes(path))result.push(path);
 }
 return result.sort();
}
const assets=await files(dist),template=await readFile(new URL('service-worker.template.js',import.meta.url),'utf8');
const hash=createHash('sha256').update(template);
for(const path of assets)hash.update(path).update('\0').update(await readFile(new URL(path,dist)));
const version=hash.digest('hex').slice(0,20);
const worker=template.replace('__VERSION__',JSON.stringify(version)).replace('__ASSETS__',JSON.stringify(assets,null,1));
await writeFile(new URL('sw.js',dist),worker);
console.log(`Prepared offline version ${version}: ${assets.length} files in ${fileURLToPath(dist)}`);
