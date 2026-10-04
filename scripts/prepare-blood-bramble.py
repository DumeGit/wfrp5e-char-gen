"""Prepare reviewed Blood and Bramble spell data from staged PDF columns.

The user approved the detailed Godspakt profile and a qualified ingredient entry.
"""
from pathlib import Path
import argparse, json, re, unicodedata

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--input-dir', type=Path, default=ROOT.parent/'tmp/pdfs/blood-bramble-review')
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/blood-bramble-prepared')
args = parser.parse_args()
pages = {p['page']: p for p in json.loads((args.input_dir/'pages.json').read_text(encoding='utf-8'))}

def column(n, i):
    return re.sub(r'(?m)^\d+\s*$', '', pages[n]['columns'][i])

def clean(s):
    return re.sub(r'\s+', ' ', s.replace('sor-\ncery', 'sorcery').replace('\u00ad', '')).strip()

groups = [
    (6, 'Hedgecraft', column(6, 0) + '\n' + column(6, 1)),
    (7, 'Hedgecraft', column(7, 0) + '\n' + column(7, 1)),
    (8, 'Hedgecraft', column(8, 0) + '\n' + column(8, 1)),
    (9, 'Hedgecraft', column(9, 0).split('Oh, they thought')[0] + '\n' + column(9, 1)),
    (10, 'Hedgecraft', column(10, 0) + '\n' + column(10, 1)),
    (12, 'Witchcraft', column(12, 1)),
    (13, 'Witchcraft', column(13, 0) + '\n' + column(13, 1)),
    (14, 'Witchcraft', column(14, 0) + '\n' + column(14, 1)[column(14, 1).index('Outcast’s Curse'):]),
    (15, 'Witchcraft', column(15, 0) + '\n' + column(15, 1).split('WITCHES AND THEIR PACTS')[0]),
    (16, 'Witchcraft', column(16, 0) + '\n' + column(16, 1)),
    (17, 'Witchcraft', column(17, 0).split('NAMELESS SUM')[0] + '\n' + column(17, 1).split('MMONS TABLE')[0]),
]
pattern = re.compile(r'(?m)^([^\n]+)\nCN: (\d+)\nRange: ([^\n]+)\nTarget: ([^\n]+)\nDuration: ([^\n]+)\n')
conversion = ('Fifth Edition spell-learning grants, prices and core Traits/Talents apply. Named Fourth Edition Test Difficulties use Appendix I SL modifiers. Printed numerical situational modifiers remain reference text. Casting, Conditions, curses, spirits and summons are not automated. References explicitly labelled Fourth Edition core retain their original page numbers.')
ingredients = ('Blood and Bramble p. 6: Hedgecraft spells require ingredients. A successful Lore (Herbalism) foraging roll provides 1 + SL ingredients; the printed purchase price is 5 brass pennies. Foraging and ingredient consumption are campaign references, not character-creation grants.')
spells = []
for page, category, chunk in groups:
    matches = list(pattern.finditer(chunk))
    for i, match in enumerate(matches):
        name, cn, range_, target, duration = match.groups()
        body = clean(chunk[match.end():matches[i+1].start() if i+1<len(matches) else len(chunk)])
        body = re.sub(r'(Difficult|Hard|Challenging)\s*\(([–−-]\d+|\+0)\)', lambda m: {'Difficult':'Difficult (−1 SL)', 'Hard':'Hard (−2 SL)', 'Challenging':'Challenging (+0 SL)'}[m[1]], body)
        body = body.replace('WFRP, page', 'Fourth Edition core, page')
        if name == 'Nameless Summons':
            body += (' Nameless Summons table (p. 17), printed results: −5 or worse: a greater daemon’s forelimb drags you into its realm; Hostile; gift: your flesh, blood and soul. '
                     '−4 to −0: a Lesser Daemon or powerful spirit (Cairn Wraith or Tomb Banshee); Hostile; immediate sacrifice of 1d10 living, sentient creatures. '
                     '+0 to +4: a Lesser Daemon or powerful spirit; Neutral; sacrifice of one living, sentient creature. '
                     '+5 to +9: a Lesser Daemon or powerful spirit; Favourable; promise of a future sacrifice or great service. '
                     '+10 or better: a Greater Daemon interested in speaking rather than killing outright; Neutral if demands are met, Hostile otherwise; future great service and your essence at death. '
                     'Printed ambiguity: −0 and +0 overlap. Both rows are preserved as reference text; the GM must resolve result 0. The creator does not roll summons or grant an entity.')
        # Preserve original profiles and wording; source discrepancies require
        # explicit user review, never silently choose the card as errata.
        if category == 'Hedgecraft':
            body += ' ' + ingredients
        if name == 'Godspakt':
            body += ' Source discrepancy: the quick-reference card on PDF p. 28 prints Range Touch and Target 1. The user selected the detailed p. 10 profile, Range You and Target You.'
        slug = re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()).strip('-')
        spells.append({'id': f'blood-bramble:spell:{slug}', 'name': name, 'page': page, 'category': category,
                       'cn': cn, 'range': range_, 'target': target, 'duration': duration, 'text': body, 'conversion': conversion})

assert len(spells) == 24, [s['name'] for s in spells]
assert sum(s['category']=='Hedgecraft' for s in spells) == 12
assert len({s['name'] for s in spells}) == 24
source = json.loads((args.input_dir/'source.json').read_text(encoding='utf-8'))
manifest = {'schemaVersion':1, 'id':'blood-bramble', 'title':'Blood and Bramble', 'shortTitle':'Blood & Bramble', 'edition':4,
            'version':'1.0.0', 'kind':'supplement', 'dependsOn':['core'], 'source':{'file':source['file'],'sha256':source['sha256']},
            'compatibility':{'reviewed':True, 'notes':[
                'Adds twelve Hedgecraft and twelve Witchcraft spell profiles from detailed entries pp. 6–17. Existing Fifth Edition Lore Talents, free spell grants, learning prices and core Traits/Talents apply; no additional free spells or Careers.',
                'Named old Test Difficulty modifiers are converted using Appendix I. Ordinary printed numeric bonuses/penalties remain descriptions. Fourth Edition core page references are identified explicitly.',
                'Hedgecraft ingredient requirements and printed foraging/price information (p. 6) are retained as references. No free ingredients, potions, enchanted weapons, spirits or summoned creatures are granted.',
                'User selected Godspakt’s detailed p. 10 You/You profile; its PDF p. 28 card instead prints Touch/1. The mismatch remains visible in its description.',
                'User approved a 5-penny Hedgecraft ingredient shop entry with unknown Encumbrance, unspecified supplied amount and unlisted Availability, all explicitly noted.',
                'Nameless Summons p. 17 prints overlapping −0/+0 results. Both are retained as references without choosing errata or automating summoning.',
                'NPC profiles, adventure hooks, live casting, Condition/curse handling, spirit bargaining and summoning are deferred to campaign management.',
            ]}, 'files':{'spells':'spells.json','gear':'gear.json'}}
gear = [{'id':'blood-bramble:gear:hedgecraft-ingredients', 'name':'Hedgecraft Ingredients', 'page':6, 'price':'5d', 'enc':None,
         'availability':'Not specified', 'category':'Spell ingredients',
         'text':'Printed price: 5 brass pennies (p. 6). The book does not specify the amount supplied, Encumbrance or Availability. Each purchase records one purchase of ingredients, not a defined number of spell uses. Ingredients are required for Hedgecraft casting. Foraging and consumption are deferred.',
         'conversion':'User-approved shop entry at the printed 5-penny price. Unknown weight remains unresolved; no pack size or number of spell uses is invented.'}]
args.output_dir.mkdir(parents=True, exist_ok=True)
for name, value in [('spells.json',spells),('gear.json',gear),('manifest.json',manifest)]:
    (args.output_dir/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Prepared {len(spells)} spell profiles for review.')
