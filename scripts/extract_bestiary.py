"""Extract reviewed NPC data from the supplied core PDF, after MarkItDown reading.

Profiles retain printed totals. The two-column Trait catalogue is read in layout
order so continued rules (notably Mark of Chaos and Size) remain together.
"""
from pathlib import Path
import json, re
import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\ninod\Downloads\Warhammer Fantasy Roleplay (2).pdf")
DEST = ROOT / "dist/data/books/core"
KEYS = "M WS BS S T I Ag Dex Int WP Fel W".split()
reader = PdfReader(SOURCE)
pdf = pdfplumber.open(SOURCE)

def norm(text):
    return re.sub(r"\s+", " ", text.replace("T oughness", "Toughness").replace("W ar", "War").replace("T entacles", "Tentacles").replace("T error", "Terror").replace("V arious", "Various").replace("\u00ad", "")).strip()

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")

def write(name, data):
    (DEST / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def category(n):
    for end, name in [(324,"Peoples of the Reikland"),(327,"Beasts of the Reikland"),(335,"Monstrous Beasts"),(338,"Orcs and Goblins"),(344,"Restless Dead"),(346,"Beastmen"),(348,"Cultists and Mutants"),(350,"Daemons"),(352,"Skaven"),(356,"Worked Examples")]:
        if n <= end: return name

def split_list(text):
    # Commas inside a Skill's specialisation are not separators.
    return [norm(x) for x in re.split(r",\s*(?![^()]*\))", text) if norm(x)]

profiles = []
for n in list(range(319,353)) + [354,355,356]:
    text = reader.pages[n-1].extract_text()
    starts = list(re.finditer(r"(?m)^([^\n]+)\nM WS BS S T I Ag Dex Int WP Fel W\n([^\n]+)", text))
    for i, hit in enumerate(starts):
        raw_name, raw_values = hit.group(1).strip(), hit.group(2).strip()
        if not raw_name.isupper() or "SPELLCASTER" == raw_name or "SPELLCASTER LORD" == raw_name: continue
        values = raw_values.split()
        if len(values) != 12 or any(not re.fullmatch(r"\d+|[–—-]", x) for x in values): continue
        end = starts[i+1].start() if i+1 < len(starts) else len(text)
        body = text[hit.end():end].strip()
        # Decorative lower/mixed-case narrative headings mark the end of a box.
        for line in body.splitlines():
            if len(line.strip()) < 70 and (slug(line) == slug(raw_name) and line.strip() != raw_name or re.search(r"\b[A-Za-z]*[a-z][A-Z][A-Za-z]*", line)):
                body = body[:body.find(line)].strip(); break
        body = re.split(r"\n(?:HALFLINGS AND OGRES|IT’S ALIVE! ALIVE!|UNQUIET DEAD|TROLL TYPES)\n", body)[0]
        sections = {}
        raw_sections = {}
        parts = re.split(r"(?m)^(Attacks|Armour|Skills|Talents|Spells|Traits(?: Continued)?|Optional Traits|Trappings)\s*$", body)
        for j in range(1,len(parts),2):
            key = parts[j].replace(" Continued", "")
            if key == "Talents" and key in sections: key = "Trappings"
            sections[key] = (sections.get(key, "") + " " + norm(parts[j+1])).strip()
            raw_sections[key] = parts[j+1]
        stats = dict(zip(KEYS, [int(x) if x.isdigit() else None for x in values]))
        name = raw_name.title().replace("Of ","of ").replace("Or ","or ").replace("(Elite)","(Elite)")
        trait_text = sections.get("Traits", "")
        size = re.search(r"Size \((Small|Average|Large|Enormous|Monstrous|Tiny)\)", trait_text)
        if raw_name == "VARGHULF":
            before = text[:hit.start()].split("Traits Continued\n",1)[1]
            continued, optional = before.split("Optional Traits\n",1)
            sections["Traits"] += " " + norm(continued)
            sections["Optional Traits"] = norm(optional)
            size = re.search(r"Size \((Small|Average|Large|Enormous|Monstrous|Tiny)\)", sections["Traits"])
        tb = re.search(r"Toughness Bonus:\s*(\d+)", sections.get("Armour", ""))
        skills = []
        for entry in split_list(sections.get("Skills", "")):
            group = re.fullmatch(r"Melee \((.+)\)", entry)
            if group and re.search(r"\d",group[1]):
                for piece in split_list(group[1]):
                    m = re.fullmatch(r"(.+?)\s+(\d+)",piece)
                    if m: skills.append({"name":"Melee ("+m[1]+")","total":int(m[2])})
            else:
                m = re.fullmatch(r"(.+?)\s+(\d+)",entry)
                if m: skills.append({"name":m[1],"total":int(m[2])})
        attacks=[]
        raw_attacks=raw_sections.get("Attacks","").strip()
        hits=list(re.finditer(r"(?m)^(Optional )?([A-Z0-9][^:\n]{0,80}):?\s*\((\d+)(?:/\+(\d+))?\)",raw_attacks))
        for j,a in enumerate(hits):
            stop=hits[j+1].start() if j+1<len(hits) else len(raw_attacks)
            tail=norm(raw_attacks[a.end():stop])
            for special in ["Breath (Any One):", "Ghostly Howl:"]:
                tail=tail.split(special)[0].strip()
            attacks.append({"name":norm(a[2]),"skill":int(a[3]),"damage":int(a[4]) if a[4] else None,"optional":bool(a[1]),"text":tail})
        for special in ["Breath (Any One)","Ghostly Howl"]:
            if special+":" in raw_attacks:
                attacks.append({"name":special,"skill":None,"damage":None,"optional":False,"text":norm(raw_attacks.split(special+":",1)[1])})
        profiles.append({"id":"core:creatures:"+slug(raw_name),"name":name,"page":n,"category":category(n),"example":n>=354,"stats":stats,"size":size[1] if size else "Average","toughnessBonus":int(tb[1]) if tb else None,"sections":sections,"skills":skills,"attacks":attacks,"text":norm(body),"notes":[]})

assert len(profiles) == 53, len(profiles)
for p in profiles:
    if p["name"] in ["Orc","Ogre","Dwarf","Human Thug"] and p["toughnessBonus"] != (p["stats"]["T"] or 0)//10:
        p["notes"].append("The printed Toughness Bonus differs from Toughness / 10. Printed values are retained until the GM explicitly selects recalculation or a manual value.")
    if p["name"] == "Human Watchman":
        p["notes"].append("The second printed Talents heading contains belongings; retained as Trappings.")
    if p["name"] == "Ogre":
        p["notes"].append("Belligerent, Infected and Tracker are printed under Trappings. See the documented heading decision.")
        p["sections"]["Optional Traits"] = p["sections"].pop("Trappings", "")
    if p["name"] == "Stormvermin" or p["example"]:
        p["notes"].append("This is a complete printed worked profile. Its template contributions are already included; applying another template is a further GM customisation.")
for p in profiles:
    p["text"] = " ".join(k+": "+v for k,v in p["sections"].items())
    if "Construct:" in p["sections"].get("Traits","") and p["stats"]["Int"] is not None:
        p["notes"].append("The printed profile has Intelligence despite Construct declaring that Characteristic absent. The untouched printed score is retained; new Construct additions follow the full Trait rule.")
write("creatures.json",profiles)

traits = []
current = None
skip = {"Stomp","Wounds"}
for n in range(356,364):
    page = pdf.pages[n-1]
    left = 58 if n%2 else 75
    for x in [left,left+244]:
        if n == 356 and x == left: continue
        words = page.extract_words(extra_attrs=["fontname","size"])
        headings = {}
        for w in words:
            if x-2 <= w["x0"] < x+226 and 55 < w["top"] < 728 and "ACaslonPro-Bold" in w["fontname"] and 11.5 < w["size"] < 12.5:
                headings.setdefault(round(w["top"],1),[]).append(w)
        heads = [(y," ".join(w["text"] for w in sorted(ws,key=lambda w:w["x0"]))) for y,ws in sorted(headings.items())]
        cuts = [(55,None)] + heads + [(728,None)]
        for j in range(len(cuts)-1):
            y,title = cuts[j]; next_y = cuts[j+1][0]
            block = norm(page.crop((x-1,y+(14 if title else 0),x+241,next_y-0.5)).extract_text() or "")
            if title and title not in skip:
                name = re.sub(r"\s*\(.*", "", title).replace("# ","")
                current = {"id":"core:traits:"+slug(name),"name":name,"page":n,"text":"","parameter":re.search(r"\((.+)\)",title).group(1) if "(" in title else ("Number" if "#" in title else None)}
                traits.append(current)
            if current and block: current["text"] += (" " if current["text"] else "")+block
assert len(traits) == 67, [(p["name"],p["page"]) for p in traits]
# The printed decorative bullet glyph extracts as a zero in the Size lists.
for trait in traits:
    trait["text"] = re.sub(r"(?<!\S)0 (?=(?:Small|Average|Large|Enormous|Monstrous):)", "\n• ", trait["text"])
write("traits.json",traits)
print(f"Extracted {len(profiles)} profiles and {len(traits)} Creature Traits.")

def grants(names,bonus,count=1):
    return {"options":names.split("|"),"bonus":bonus,"count":count}
def talents(names,ranks=1):
    return {"options":names.split("|"),"ranks":ranks}
templates = []
rows = [
    ("Soldier",353,{"WS":10,"S":10,"T":10,"WP":10},[grants("Cool",10),grants("Dodge",10),grants("Melee (Basic)|Melee (Polearm)",10)],[]),
    ("Skirmisher",353,{"BS":10,"I":10,"Ag":10,"WP":10},[grants("Dodge",10),grants("Ranged (Bow)|Ranged (Sling)|Ranged (Throwing)",10),grants("Stealth (Rural)|Stealth (Underground)",10)],[]),
    ("Elite",353,{"WS":15,"S":15,"T":15,"I":15,"WP":15},[grants("Cool",15),grants("Dodge",15),grants("Intimidate",10),grants("Leadership",5),grants("Melee (Any)",15,2),grants("Perception",15)],[talents(x) for x in ["Combat Aware","Combat Reflexes","Resolute"]]),
    ("Leader",353,{"WS":15,"BS":15,"S":15,"T":15,"I":15,"Ag":15,"WP":15,"Fel":5},[grants("Cool",15),grants("Dodge",15),grants("Intimidate",15),grants("Leadership",15),grants("Lore (Warfare)",10),grants("Melee (Any)",15,2),grants("Perception",15)],[talents(x) for x in ["Combat Aware","Combat Reflexes","Furious Assault","Inspiring","Resolute","War Leader"]]),
    ("Commander",353,{"WS":20,"BS":20,"S":20,"T":10,"I":20,"Ag":10,"WP":20,"Fel":15},[grants("Cool",20),grants("Dodge",20),grants("Intimidate",20),grants("Leadership",30),grants("Lore (Warfare)",20),grants("Melee (Any)",20,2),grants("Perception",20)],[talents(x) for x in ["Combat Aware","Combat Reflexes","Furious Assault","Inspiring","Luck","Resolute","Unshakeable","War Leader"]]),
    ("Spellcaster",354,{"I":10,"Int":10,"WP":10},[grants("Channelling (Any)",10),grants("Cool",10),grants("Dodge",10),grants("Intuition",10),grants("Language (Magick)",15),grants("Melee (Basic)|Melee (Polearm)",10),grants("Perception",10)],[talents("Aethyric Attunement|Instinctive Diction"),talents("Arcane Magic (Any)|Chaos Magic (Any)"),talents("Petty Magic"),talents("Second Sight")]),
    ("Spellcaster Lord",354,{"WS":10,"I":20,"Ag":15,"Int":20,"WP":20,"Fel":10},[grants("Channelling (Any)",20),grants("Cool",20),grants("Dodge",20),grants("Intuition",20),grants("Language (Magick)",20),grants("Leadership",10),grants("Melee (Basic)|Melee (Polearm)",10),grants("Perception",20)],[talents("Aethyric Attunement"),talents("Arcane Magic (Any)|Chaos Magic (Any)"),talents("Instinctive Diction",2)]+[talents(x) for x in ["Luck","Magical Sense","Menacing","Petty Magic","Second Sight","Sixth Sense"]])
]
for name,page,adjustments,skills,ts in rows:
    t={"id":"core:templates:"+slug(name),"name":name,"page":page,"adjustments":adjustments,"skills":skills,"talents":ts,"text":"Characteristic adjustments: "+", ".join(f"{k} +{v}" for k,v in adjustments.items())+". Skills: "+", ".join(" or ".join(s["options"])+f" +{s['bonus']}"+(f" (choose {s['count']})" if s['count']>1 else "") for s in skills)+". Talents: "+", ".join(" or ".join(a["options"])+(f" {a['ranks']}" if a['ranks']>1 else "") for a in ts)+". Recalculate Wounds."}
    if name.startswith("Spellcaster"):
        t["magic"]={"petty":6 if name.endswith("Lord") else 3,"lore":9 if name.endswith("Lord") else 3}
        t["text"]+=f" Choose up to {t['magic']['petty']} Petty spells and up to {t['magic']['lore']} spells from a suitable Lore."
    templates.append(t)
write("templates.json",templates)

# Permanent adjustments are explicit; conditional effects remain sourced text.
physical = [
 ("Animalistic Legs","+1 Movement",{"M":1}),
 ("Corpulent","+5 Strength, +5 Toughness, -1 Movement",{"S":5,"T":5,"M":-1}),
 ("Distended Digits","+10 Dexterity",{"Dex":10}),
 ("Emaciated","+5 Agility, -10 Strength",{"Ag":5,"S":-10}),
 ("Enormous Eye","Gain Acute Sense (Sight)",{}),
 ("Extra Leg Joints","+5 Agility",{"Ag":5}),
 ("Extra Mouth","Roll on the Hit Locations table to see where",{}),
 ("Fleshy Tentacle","Gain Tentacles 1",{}),
 ("Glowing Skin","Effective light of a candle",{}),
 ("Inhuman Beauty","+10 Fellowship; you do not scar",{"Fel":10}),
 ("Inverted Face","-20 Fellowship",{"Fel":-20}),
 ("Iron Skin","+2 Armour Points to all Locations",{}),
 ("Lolling Tongue","-10 to Language Tests when speaking",{}),
 ("Patchy Feathers","Roll on the Hit Locations table twice to see where",{}),
 ("Short Legs","-1 Movement",{"M":-1}),
 ("Spiny Protrusions","Roll on the Hit Locations table to see where",{}),
 ("Thorny Scales","+1 Armour Point to all Locations",{}),
 ("Uneven Horns","+1 Armour Point to Head; gain Horns",{}),
 ("Webbed Feet","Gain Striding Gait (Wetland)",{}),
 ("Whiskered Snout","Gain Acute Sense (Smell); +2 SL to Track Tests",{})]
mental = [
 ("Awful Cravings","-5 Willpower, -5 Fellowship",{"WP":-5,"Fel":-5}),
 ("Beast Within","+10 Willpower, -5 Intelligence, -5 Fellowship",{"WP":10,"Int":-5,"Fel":-5}),
 ("Chaotic Dreams","Fatigued for the first two hours of each day",{}),
 ("Crawling Skin","-5 Initiative, -5 Dexterity",{"I":-5,"Dex":-5}),
 ("Erratic Fantasist","-5 Initiative, -5 Willpower",{"I":-5,"WP":-5}),
 ("Fearful Concern","-10 Willpower",{"WP":-10}),
 ("Hateful Impulses","Animosity towards all not of your Species",{}),
 ("Hollow Heart","+10 Willpower, -10 Fellowship",{"WP":10,"Fel":-10}),
 ("Jealous Thoughts","-10 Fellowship",{"Fel":-10}),
 ("Lonely Spirit","-10 to any Test when alone",{}),
 ("Mental Blocks","-10 Intelligence",{"Int":-10}),
 ("Profane Urgency","+10 Agility, -10 Willpower",{"Ag":10,"WP":-10}),
 ("Shaky Morale","Gain Broken if you fail a Fear Test",{}),
 ("Suspicious Mind","-5 Initiative, -5 Intelligence",{"I":-5,"Int":-5}),
 ("Thrill Hunter","+10 Willpower, -10 Initiative",{"WP":10,"I":-10}),
 ("Tortured Visions","-10 Initiative",{"I":-10}),
 ("Totally Unhinged","+10 Willpower, -20 Fellowship",{"WP":10,"Fel":-20}),
 ("Unending Malice","+1 SL on Tests to hurt; -1 SL to other Tests",{}),
 ("Unholy Rage","+10 Weapon Skill; subject to Frenzy",{"WS":10}),
 ("Worried Jitters","+5 Agility, -5 Fellowship",{"Ag":5,"Fel":-5})]
mutations=[]
for kind,items in [("Physical",physical),("Mental",mental)]:
    for i,(name,text,adjustments) in enumerate(items):
        mutations.append({"id":"core:mutations:"+slug(name),"name":name,"page":189,"category":kind,"min":i*5+1,"max":i*5+5,"text":text,"adjustments":adjustments})
write("mutations.json",mutations)
