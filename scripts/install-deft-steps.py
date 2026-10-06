"""Install reviewed Deft Steps creator data; release checks follow before commit."""
from pathlib import Path
from copy import deepcopy
import argparse, json, shutil
from book_build import prepare_manifest
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--input-dir',type=Path,default=ROOT.parent/'tmp/pdfs/deft-steps-prepared')
args=parser.parse_args()
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
if read(args.input_dir/'pending.json'):raise ValueError('Unanswered source choices')
target=ROOT/'dist/data/books/deft-steps'
target.mkdir(parents=True,exist_ok=True)
files={kind:kind+'.json' for kind in ['careers','spells','gear','rules','cults']}
for filename in files.values():shutil.copyfile(args.input_dir/filename,target/filename)
features=[
 ('npc-material','NPC/animal profiles and hunting training','deferred','34–134','NPC creator removed at the user’s request. Animal shop entries record PC acquisition only; profiles, training and named NPC equipment are outside current scope.'),
 ('ranald-lists','Ranald aspect Miracle access','adapted',13,'Four Careers retain separate printed Miracle lists with approved core Invoke/Miracle equivalents.'),
 ('tools','Tool naming mismatches','implemented',32,'Thin Jimmy/Steel Mummit and Telescopic Pole/Stick use paired table prices and descriptions.'),
 ('campaign','Campaign procedures and ongoing play','deferred',15,'Ranald’s Gamble, contacts/organisations, crime/fraud, patrols/bounties, pathfinding/camping, hunting and ongoing training remain outside creation.'),
]
coverage={'schemaVersion':1,'records':[], 'features':[{'id':'deft-steps:feature:'+i,'name':name,'status':status,'source':{'book':'deft-steps','page':page},'reason':reason} for i,name,status,page,reason in features]}
(target/'coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
manifest={'schemaVersion':1,'id':'deft-steps','title':'Deft Steps, Light Fingers','shortTitle':'Deft Steps','edition':4,'version':'1.0.1','kind':'supplement','dependsOn':['core'],
 'source':{'file':'Deft Steps Light Fingers.pdf','sha256':'2581d969680a019b7db3d083578e0759b9b96e2a0612e5e99088821690537eec'},
 'compatibility':{'reviewed':True,'notes':[
 'Nine Careers, 32 Miracles, 15 priced entries. Fifth Edition creation, XP and core Talent definitions govern; no random probabilities are invented.',
 'User-reviewed Public Speaking Talent placement, Perform (Acting) → Entertain (Acting), explicit Art/Stealth specialisations and Impassioned Zeal Cause; no extra free Advances or Talents.',
 'Ranald aspects use Invoke (Ranald) and their printed lists. Protector heading corrected; A Suitable Stooge uses A Suitable Sucker. Stay Lucky → Cheat the Odds and the previously approved core Miracle equivalents retain Legacy notes.',
 'Named Test Difficulty modifiers use Appendix I SL; ordinary printed numeric situational modifiers remain text. Old core references keep their Fourth Edition identification.',
 'Thieving tool naming pairs use their approved table/description equivalences. Animal weights shown as dashes remain unknown; buying an animal does not create a companion.',
 ]},'files':files}
manifest=prepare_manifest('manifest.json',manifest,target)
(target/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
path=ROOT/'dist/data/books/index.json'
registry=read(path)
if not any(p['id']=='deft-steps' for p in registry['packs']):registry['packs'].append({'id':'deft-steps','path':'deft-steps/manifest.json'})
core_careers={c['id']:c for c in read(ROOT/'dist/data/careers.json')}
variants=[
 ('ranald-priest','priest','General Ranald Priest',13,['Athletics','Bribery','Cool','Endurance','Gamble','Intuition','Lore (Theology)','Perception','Pray','Stealth (Urban)']),
 ('dealer','priest','Ranald the Dealer',24,None),
 ('taal-priest','priest','Taal Priest',89,['Athletics','Charm Animal','Cool','Endurance','Intuition','Lore (Theology)','Outdoor Survival','Perception','Pray','Research']),
 ('white-stag','nun','White Stag / Hermit',89,['Art (Calligraphy)','Charm Animal','Cool','Endurance','Entertain (Storytelling)','Gossip','Heal','Lore (Theology)','Outdoor Survival','Pray']),
 ('longshanks','scout','Longshanks Scout',89,['Animal Care','Charm Animal','Climb','Endurance','Gossip','Lore (Local)','Melee (Basic)','Outdoor Survival','Perception','Ranged (Bow)']),
 ('pickpocket','thief','Pickpocket',27,['Athletics','Climb','Cool','Dodge','Endurance','Intuition','Perception','Perform (Clowning)','Sleight of Hand','Stealth (Urban)']),
]
for suffix, core_id, label, page, skill_list in variants:
    vid='deft-steps-'+suffix
    folder=target.parent/vid
    folder.mkdir(exist_ok=True)
    career=deepcopy(core_careers[core_id])
    career.update(id=vid+':career:'+core_id,runtimeId=core_id,page=page,replaces='core:careers:'+core_id,
                  reason='Printed optional '+label+' first-level choices; keeps core Fifth Edition Career structure and allocations.')
    career['levels'][0]['skills'] = skill_list or list(dict.fromkeys(career['levels'][0]['skills']+['Haggle','Evaluate']))
    career['conversion']='Only printed first-level Skill changes apply. Core Fifth Edition level structure, Characteristics, Talent definitions, free allocations and XP limits remain. Choosing the variant grants no additional Advances.'
    extra_features=[
 ('npc-material','NPC/animal profiles and hunting training','deferred','34–134','NPC creator removed at the user’s request. Animal shop entries record PC acquisition only; profiles, training and named NPC equipment are outside current scope.'),]
    if suffix=='pickpocket':
        assert 'Fast Hands' in career['levels'][0]['talents'] and 'Strike to Stun' not in career['levels'][0]['talents']
        career['text']='The printed swap from Strike to Stun to Fast Hands is already present in the Fifth Edition Thief. Its Talents remain unchanged; there is no extra Talent slot.'
        extra_features=[
 ('npc-material','NPC/animal profiles and hunting training','deferred','34–134','NPC creator removed at the user’s request. Animal shop entries record PC acquisition only; profiles, training and named NPC equipment are outside current scope.'),{'id':vid+':feature:talent-swap','name':'Pickpocket Talent swap','status':'reference-only','source':{'book':vid,'page':27},'reason':'Core Fifth Edition Thief already has Fast Hands and no level-one Strike to Stun; no further swap or free Talent is added.'}]
    if suffix=='white-stag':career['conversion']+=' Printed Entertain (Storyteller) uses the core Storytelling name, a spelling correction without a Legacy adaptation.'
    (folder/'careers.json').write_text(json.dumps([career],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (folder/'coverage.json').write_text(json.dumps({'schemaVersion':1,'records':[],'features':extra_features},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    vm=deepcopy(manifest)
    vm.update(id=vid,title='Deft Steps — '+label,shortTitle=label,kind='variant',dependsOn=['deft-steps'],files={'careers':'careers.json'})
    vm['compatibility']['notes']=[career['conversion']]
    if suffix=='dealer':
        cult=read(target/'cults.json')[0]
        cult.update(id=vid+':cult:ranald',page=24,replaces='deft-steps:cult:ranald',reason='Explicit Ranald the Dealer Career option changes only the core Priest’s extra Miracle list.')
        cult['careerMiracles']['priest'] = cult['miracles']+['A Suitable Sucker','Bamboozle','Force the Hand of Chance','Perfect Empathy','Up the Stakes']
        (folder/'cults.json').write_text(json.dumps([cult],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        vm['files']['cults']='cults.json'
    vm=prepare_manifest('manifest.json',vm,folder)
    (folder/'manifest.json').write_text(json.dumps(vm,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if not any(p['id']==vid for p in registry['packs']):registry['packs'].append({'id':vid,'path':vid+'/manifest.json'})
path.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Installed reviewed base pack. Run release and UI/export checks before committing.')
