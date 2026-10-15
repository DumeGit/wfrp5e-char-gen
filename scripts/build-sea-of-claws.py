"""Reviewed Sea of Claws integration, using the supplied PDF and explicit decisions."""
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
BOOK = "sea-of-claws"
PDF = Path(r"C:\Users\ninod\Downloads\Sea of Claws (1).pdf")
SHA = "30b76209db926d2f392f184e5825601f27cffb967e5c667926e0910c775ba62c"
PACK = ROOT / f"content/sources/data/books/{BOOK}"
REVIEW = ROOT.parent / "sea-of-claws-review"


def read(path): return json.loads(path.read_text(encoding="utf-8"))
def clean(text): return re.sub(r"\s+", " ", text.replace("\u00ad", "")).strip()
def slug(text): return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
def ident(kind, name): return f"{BOOK}:{kind}:{slug(name)}"
def source(page): return {"book": BOOK, "page": page}
def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def split(text):
    return [clean(item) for item in re.split(r",(?![^()]*\))",text) if clean(item)]


def gm_source(doc):
    profiles=[]
    abilities=[]
    # Exact mechanical paragraphs, excluding the surrounding monster lore.
    specs={
        140:[("Lure of the Lurkerfish",0)],
        141:[("Slimy",0),("Love the Light",0)],
        142:[("Immersion",1),("Fire Resistant",0),("Mindless Spellcaster",0)],
        143:[("Boat Crusher",1),("Electrical Discharge",3)],
        145:[("Whale Bane",0),("Syreen’s Call",0)],
        147:[("Resistant to Cold",0),("Lure of the Leviathan",0),("Devastating Assault",0),("On a Different Scale",1)],
    }
    for page,rows in specs.items():
        blocks=doc[page-1].get_text("blocks")
        for name,extra in rows:
            start=next(b for b in blocks if re.sub(r"\s+"," ",b[4]).startswith(name+":"))
            column=sorted([b for b in blocks if abs(b[0]-start[0])<8 and b[1]>=start[1]],key=lambda b:b[1])
            original=clean(" ".join(b[4] for b in column[:extra+1])).split(":",1)[1].strip()
            text=original
            changes=[]
            for label,old,new in [("Hard","–20","−2"),("Easy","+40","+4"),("Average","+20","+2"),("Difficult","–10","−1"),("Difficult","-10","−1"),("Challenging","+0","+0")]:
                if f"{label} ({old})" in text:
                    text=text.replace(f"{label} ({old})",f"{label} ({new} SL)")
                    if old!="+0":changes.append("Printed Test Difficulty uses current SL modifiers.")
            if "Advantage" in text:
                text=text.replace("Advantage","Momentum");changes.append("Printed Advantage uses Momentum.")
            if name=="Whale Bane":
                text="All Fanged Maw attacks have core Venom (Difficult −1 SL recovery): causing Wounds inflicts Poisoned; the Difficulty applies to recovery."
                changes.append("Uses full Fifth Edition Venom rather than the older on-hit interpretation.")
            abilities.append({"id":ident("trait",name),"name":name,"page":page,"source":source(page),"text":text,**({"adaptation":" ".join(dict.fromkeys(changes))} if changes else {})})
    marine="The creature is at home in the ocean and unsuited to life on land. Its printed profile assumes an aquatic environment and it moves its full Movement in water. Out of water, Movement drops to 1 and all its Tests suffer −2 SL. It must be regularly doused with water or begin to suffocate (core Suffocation)."
    abilities.append({"id":ident("trait","marine-creature"),"name":"Marine Creature","page":140,"source":source(140),"text":marine})
    extras={"Lurkerfish":["Lure of the Lurkerfish"],"Latch-Eel":["Slimy"],"Daggerfish":["Love the Light"],"Sea Elemental":["Immersion","Fire Resistant","Mindless Spellcaster"],"Gargantuan":["Boat Crusher","Electrical Discharge"],"Merwyrm":["Whale Bane"],"Syreen":["Syreen’s Call"],"Orb Leviathan":["Lure of the Leviathan","Resistant to Cold"],"Black Leviathan":["Devastating Assault","On a Different Scale"]}
    core=read(ROOT / "content/sources/gm/books/core.json")
    allowed={t["name"] for t in core["traits"]}|{t["name"] for t in abilities}
    for raw in read(REVIEW / "profiles.raw.json"):
        name,page,stats=raw["name"],raw["page"],raw["stats"]
        bits=re.split(r"(Traits:|Attack Traits:|Optional Traits:|Optional:|Talents:|Spells:)",raw["printedSections"])
        sections={bits[i].rstrip(":"):bits[i+1].strip() for i in range(1,len(bits),2)}
        traits=[];optional=[];changes=[];notes=[];ap=0;size="Average"
        def convert(item):
            nonlocal ap,size
            if item.startswith("Armour "):
                ap=int(re.match(r"Armour (\d+)",item)[1]);return []
            match=re.match(r"^(.*?)(?: \((.*?)\))?(?: (\d+))?$",item)
            t,value,rating=match.groups();value=value or rating or ""
            if t=="Armour":ap=int(rating or item.split()[1]);return []
            if t=="Rear":changes.append("Printed Rear is replaced by current core Size/Stomp.");return []
            if t=="Grim":
                if value:changes.append("Printed ranked Grim uses the current unranked core Trait.")
                value=""
            if t=="Fury":t="Frenzy";changes.append("Proposed user-approved Fury → core Frenzy; the old effect is not verified as equivalent.")
            if t=="Corrupting":t="Corruption";changes.append("Printed Corrupting (Minor) uses core Corruption (Minor).")
            if t=="Immunity to Psychology":t="Immunity";value="Psychology"
            if t=="Regenerate":t="Regeneration"
            if t=="Size":
                if value=="Little":value="Tiny";changes.append("Old Little is mapped to Tiny; no Wounds formula is invented.")
                if value=="Small to Average":return [{"name":"Size","value":"Small"},{"name":"Size","value":"Average"}]
            if t=="Spellcaster":value=value.replace("Lore of ","")
            assert t in allowed,(name,t)
            return [{"name":t,"value":value}]
        for item in split(sections["Traits"]):traits.extend(convert(item))
        for t in traits:
            if t["name"]=="Size":size=t["value"]
        for item in split(sections.get("Optional Traits",sections.get("Optional",""))):optional.extend(convert(item))
        traits.extend({"name":n,"value":""} for n in extras.get(name,[]))
        talents=[]
        for item in split(sections.get("Talents","")):
            match=re.match(r"(.*?)(?: (\d+))?$",item);talent,rank=match.groups()
            if rank and int(rank)>1:changes.append(f"Printed {talent} {rank} becomes one nonrepeatable core rank.")
            talents.append({"name":talent,"ranks":1})
        attacks=[]
        for item in split(sections["Attack Traits"]):
            primary=re.match(r"Weapon \((.*?)\) \+(\d+)",item)
            if primary:
                damage=int(primary[2]);sb=stats["S"]//10
                addition=sb if size in ["Large","Enormous"] else sb*2 if size=="Monstrous" else 0
                attacks.append({"name":primary[1],"skill":stats["WS"],"damage":damage+addition,"optional":False,"free":False,"text":f"Printed Weapon ({primary[1]}) +{damage}."})
                if addition:changes.append(f"Core Size adds {addition} to the primary melee attack: printed +{damage} becomes +{damage+addition}.")
            elif item.startswith("Ranged"):
                match=re.search(r"Ranged \((.*?)\) \+(\d+) \((\d+)\)",item);assert match,item
                attacks.append({"name":f"Ranged ({match[1]})","skill":stats["BS"],"damage":int(match[2]),"optional":False,"free":False,"text":f"{match[3]} yards; uses its own body as the projectile."})
            elif item.startswith("Breath"):
                traits.append({"name":"Breath","value":"Poison","deriveAttack":True,"adaptation":"Core Poison Breath uses TB + 2 = 9 instead of printed +10; full core Venom governs Poisoned and recovery."})
                changes.append("Printed Poison Breath +10 uses current TB + 2 (9).")
                notes.append("Printed Breath lists Hard (−20) poison Difficulty; the current Breath/Venom definitions govern instead of importing an older poison save.")
            elif item=="Vomit":traits.append({"name":"Vomit","value":"","deriveAttack":True})
            else:
                match=re.match(r"(Bite|Tail(?: Attack)?)(?: \((.*?)\))? \+\s*(\d+)",item);assert match,(name,item)
                kind="Tail" if match[1].startswith("Tail") else "Bite"
                damage=stats["S"]//10+2 if kind=="Tail" else int(match[3])
                if damage!=int(match[3]):changes.append(f"Core Tail uses SB + 2: printed +{match[3]} becomes +{damage}.")
                attacks.append({"name":kind+(f" ({match[2]})" if match[2] else ""),"skill":stats["WS"],"damage":damage,"optional":False,"free":True,"text":"Lose Momentum to make this Free Attack."})
                traits.append({"name":kind,"value":match[3] if kind=="Bite" else ""})
        if name in ["Gymmcrab","Latch-Eel"]:
            old=stats["W"];stats["W"]=2*(stats["T"]//10)
            changes.append(f"Core Small Wounds (2 × TB) changes printed {old} to {stats['W']}.")
        if size=="Tiny":notes.append("Printed 3 Wounds retained. Tiny has no supplied core Wounds formula; after changes, set Wounds manually.")
        if name=="Kharibdyss":notes.append("Feast of Bones (p. 144) raises old Grim 2 to Grim 4 whilst Engaged. The approved core unranked Grim replacement has no numeric rating; this older effect is reference-only and does not add another effective Trait.")
        if name=="Black Leviathan":notes.append("Printed Armour 6 (18) conflicts with Toughness 145: TB 14 + 6 AP = 20 protection. Keep the sourced AP and calculated TB; do not silently use the parenthetical total.")
        profile={"id":ident("creatures",name),"name":name,"page":page,"source":source(page),"example":False,"category":"Sea creatures","stats":stats,"size":size,"toughnessBonus":stats["T"]//10,"skills":[],"talents":talents,"traits":traits,"optionalTraits":optional,"attacks":attacks,"armour":[{"name":"Natural armour","ap":ap,"locations":"Head, Arms, Body, Legs","quick":False,"shield":False,"optional":False}] if ap else [],"spells":[],"sections":{},"notes":notes,**({"adaptation":" ".join(dict.fromkeys(changes))} if changes else {})}
        if name=="Leech Wyrm": notes.append("The printed profile has no Ballistic Skill, but core Vomit requires an Opposed BS/Dodge Test. Set an explicit Vomit attack score before export; no BS is invented.")
        if name=="Sea Elemental":
            profile["spells"]=[ident("spell",s) for s in ["Living Mire","Whirlpool"]]
            profile["magicCharacteristic"]="S"
            notes.append("Mindless Spellcaster uses Strength for casting and Channelling. Printed 80 Wounds are retained as its source baseline; explicit recalculation uses current core Size.")
        profiles.append(profile)
    write(ROOT / f"content/sources/gm/books/{BOOK}.json",{"schemaVersion":1,"id":BOOK,"source":{"file":PDF.name,"sha256":SHA},"summary":"13 generic sea creatures; named captains and Triton excluded","profiles":profiles,"templates":[],"training":[],"traits":abilities})
    return profiles,abilities


def publish(doc, careers, origins, chanties):
    profiles,abilities=gm_source(doc)
    write(PACK / "rule-references.json",[{"id":ident("rule-reference",a["name"]),"name":a["name"],"page":a["page"],"category":"trait","topic":"Sea creature abilities","text":a["text"],**({"adaptation":a["adaptation"]} if a.get("adaptation") else {})} for a in abilities])
    refs=[]
    def ref(name,page,text,category="rule",notes=None):
        refs.append({"id":ident("reference",name),"name":name,"category":category,"topic":"Seafaring","page":page,"text":clean(text),**({"notes":notes} if notes else {})})
    for song in chanties:ref("Chanty: "+song["name"],67,song["text"])
    ref("Hullbreaker",44,"This ammunition is designed to smash through wooden structures and leave large holes. When striking a wooden structure, such as a ship, the ammunition inflicts +2 Damage and gains the Damaging Quality.","property")
    ref("Grubark Gearing System",44,"Cost: 400 GC for Little to Average ships; may not be applied to larger ships. Weight: 120 Encumbrance. The minimum rowing crew is reduced to one quarter, rounding up. Rowers gain +1 SL to Endurance Tests for exhaustion after a shift. If Oars takes a Critical Hit, roll d10: on 5 or more, the gearing is ruined in addition to other Critical effects.","equipment")
    ref("Skaeling Mark of Khorne",56,"A Skaeling generating Pure Soul as a random Talent may take Mark of Khorne instead. The printed Mark gives Frenzy and Etiquette (Followers of Khorne), mutual Animosity with overt followers of Slaanesh, forbids Language (Magick)/Channelling except dispelling, and adds Berserk Charge, Combat Aware, Combat Reflexes, Furious Assault, Implacable, Magic Resistance, Resistance (Magic), Resolute, Strike Mighty Blow and Warrior Born to Career purchases.",notes="Optional PC replacement remains reference-only by user decision; no extra Traits or Talent access is granted.")
    ref("Norse Skill and Equipment Advice",57,"A Norse Character can replace Ranged (Blackpowder, Engineering or Crossbow) with Ranged (Throwing), Melee (Fencing) with Melee (Two-Handed), and Plate Armour with Chainmail. Suitable alternatives depend on the character's circumstances; a Norse Character starting elsewhere may ignore these restrictions.",notes="Reference only: no unspecified replacement weapon, armour piece or ammunition quantity is invented.")
    ref("Riverfolk Lore of Oceans",63,"Riverfolk Characters with Lore (Riverways) may substitute Lore (Oceans).")
    ref("Stromfels and Sin",91,"Stromfels will not grant the ability to use Invoke with two or more Sin Points, or Bless with five or more Sin Points. This applies in addition to other consequences of Sin.",notes="Gameplay reference; the creator does not track live Sin Points.")
    ref("Stromfels Strength Stricture",89,"A Priest of Stromfels must develop Strength to the minimum required to reach the next Career tier before developing other Characteristics, or earn Sin Points until they do so.",notes="The old tier minimum is retained as a Legacy reference without an invented Fifth Edition XP restriction, by user decision.")
    ref("Feast of Bones",144,next(b[4] for b in doc[143].get_text("blocks") if b[4].startswith("Feast of Bones:")).split(":",1)[1],notes="The printed effect depends on old ranked Grim. Current core Grim is unranked; this effect remains an older-edition reference and does not change the effective Trait.")
    raw_tables=read(REVIEW / "tables.raw.json")
    for page,name in [(57,"Norse Class and Career Table"),(63,"Seafarer Class Table"),(100,"Naval Artillery Profiles")]:
        cells=[row for table in raw_tables if table["page"]==page for row in table["cells"]]
        ref(name,page,"\n".join(" | ".join(clean(cell or "") for cell in row) for row in cells),"table",notes="Printed source values; the creator's agreed alternatives/corrections are documented separately.")
    ref("Naval Artillery Ammunition",101,"Ballista Bolt: 4/–, Enc 0, Scarce, range as weapon, Damage —, Impale, Penetrating. Cannon Ball and Powder: 8/–, Enc 1, Scarce, range as weapon, Damage —, Blast +2. Cannon Grapeshot and Powder: 6/6, Enc 0, Exotic, quarter range, Damage −5, Spread +5. Mortar Bomb: 3 GC, Enc 0, Rare, range as weapon, Damage +12, Blast +5, Dangerous, Impact. Mortar Incendiary: 1 GC, Enc 0, Scarce, half range, special Damage, Blast +4, Dangerous; inflicts 1 + SL Ablaze Conditions. Swivel Gun Bullets/Powder for one shot: 2/2, Enc 0, Common, range as weapon, Damage +1, Impale, Penetrating, Spread +3. Swivel Small Shot/Powder for one shot: 2/2, Enc 0, Common, range as weapon, Damage —, Spread +6.","table")
    write(PACK / "reference-entries.json",refs)
    features=[("origins","Four Norse origins","adapted",41,"Approved Fifth Edition starting allocations and native languages; printed choices retained."),("careers","Nine Career paths and optional Career tables","adapted",63,"Explicit core alternatives, current Talents and documented 07/68 table corrections."),("talents","Chanty and Master and Commander","adapted",63,"Approved printed limits and explicit effects; no default old per-rank Test bonus. Each Chanty rank selects a different song."),("magic","21 spells and Miracles","adapted",15,"Labelled Test Difficulty conversions and chosen Seasickness duration; unchanged effects retain source values."),("bestiary","13 generic sea creatures","adapted",140,"Approved Size and current Trait/Talent replacements; source-specific Strength casting."),("artillery","Optional naval artillery variant","implemented",100,"Explicit compatible statistics alternative; never a silent overwrite."),("khorne","Skaeling Mark of Khorne PC replacement","reference-only",56,"User retains this optional replacement as a reference without invented PC Trait mechanics."),("crew","Crew Commander","adapted",63,"Approved Initiative Bonus limit and explicit effect; shared existing definition, no old default rank bonus."),("gameplay","Ship handling, crew and voyage management","deferred",103,"No new management systems; current curated search entries do not claim exhaustive chapter coverage."),("named","Named captains and Triton","deferred",148,"Excluded from foundations and global search.")]
    write(PACK / "coverage.json",{"schemaVersion":1,"records":[],"features":[{"id":ident("feature",key),"name":name,"status":status,"source":source(page),"reason":reason} for key,name,status,page,reason in features]})
    write(PACK / "manifest.json",{"schemaVersion":1,"id":BOOK,"title":"Sea of Claws","shortTitle":"Sea of Claws","edition":4,"version":"1.0.0","kind":"supplement","dependsOn":["core","up-in-arms"],"source":{"file":PDF.name,"sha256":SHA},"compatibility":{"reviewed":True,"notes":["Fifth Edition creation and advancement govern. Explicit user decisions are in scripts/sea-of-claws-decisions.json and docs/SEA-OF-CLAWS.md.","Only actual conversions carry Legacy explanations; unchanged material has its source reference.","Crew Commander reuses the newly approved shared adaptation. Named NPCs and live campaign systems are excluded."]},"files":{key:key.replace("References","-references").replace("Entries","-entries")+".json" for key in ["careers","origins","tables","talents","spells","market","rules","coverage","ruleReferences","referenceEntries"]}})
    artillery_variant()
    index=read(ROOT / "content/sources/data/books/index.json")
    for book in [BOOK,BOOK+"-artillery"]:
        if not any(p["id"]==book for p in index["packs"]):index["packs"].append({"id":book,"path":book+"/manifest.json"})
    write(ROOT / "content/sources/data/books/index.json",index)
    audit=read(ROOT / "scripts/search-reference-review.json")
    audit["books"][BOOK]={"sourceHash":SHA,"publishedSHA256":hashlib.sha256((PACK / "reference-entries.json").read_bytes()).hexdigest(),"entries":len(refs),"areas":[{"first":41,"last":67,"topic":"Norse creation, artillery and Chanties"},{"first":89,"last":101,"topic":"Stromfels and naval artillery"},{"first":140,"last":147,"topic":"Sea creature abilities"}],"records":[{"id":r["id"],"name":r["name"],"page":r["page"],"disposition":"included"} for r in refs]+[{"id":p["id"],"name":p["name"],"page":p["page"],"disposition":"included","reason":"GM foundation only; excluded from global search."} for p in profiles]+[{"id":ident("excluded","named-captains"),"name":"Named captains and Triton","page":"148–158","disposition":"excluded","reason":"Named characters are outside the requested creator scope."}]}
    write(ROOT / "scripts/search-reference-review.json",audit)


def artillery_variant():
    variant=BOOK+"-artillery";folder=PACK.parent / variant
    profiles=[];market=[]
    tables=read(REVIEW / "tables.raw.json")
    up_weapons=read(PACK.parent / "up-in-arms/weapons.json")
    up_market=read(PACK.parent / "up-in-arms/market.json")
    rows=[row for table in tables if table["page"]==100 for row in table["cells"] if row[0]!="Weapon"]
    assert len(rows)==6
    for name,price,enc,availability,reach,damage,qualities in rows:
        name=clean(name)
        target=next(w for w in up_weapons if w["name"]==name)
        profiles.append({"id":f"{variant}:weapon:{slug(name)}","name":name,"kind":"ranged","group":"Crossbow" if name=="Ballista" else "Blackpowder","enc":int(enc),"reach":reach+" yards","damage":damage.lstrip("+"),"qualities":clean(qualities),"page":100,"replaces":target["id"],"reason":"Explicit Sea of Claws naval artillery alternative, selected by the user; retains its printed range and properties."})
        target=next(m for m in up_market if m["name"]==name)
        market.append({"id":f"{variant}:item:{slug(name)}","name":name,"price":price,"enc":int(enc),"availability":availability,"category":"Siege weapons","page":100,"replaces":target["id"],"reason":"Price/profile source belongs to the explicitly selected naval artillery alternative."})
    for name,damage,qualities in [("Ball and Powder (Cannon)","—","Blast +2"),("Grapeshot and Powder (Cannon)","−5","Spread +5")]:
        original=next(m for m in up_market if m["name"]==name)
        market.append({**{k:v for k,v in original.items() if k not in ["id","page","text","ammunition"]},"id":f"{variant}:item:{slug(name)}","page":101,"ammunition":{"range":"Quarter weapon" if "Grapeshot" in name else "As weapon","damage":damage,"qualities":qualities},"text":"Printed Sea of Claws naval artillery ammunition; modifiers are reference-only.","replaces":original["id"],"reason":"Explicit naval ammunition alternative: use printed Sea of Claws modifiers rather than silently changing Up in Arms."})
    write(folder / "weapons.json",profiles);write(folder / "market.json",market)
    write(folder / "coverage.json",{"schemaVersion":1,"records":[],"features":[{"id":variant+":feature:naval-artillery","name":"Six naval artillery profiles and two ammunition alternatives","status":"implemented","source":{"book":variant,"page":100},"reason":"Explicit user-selected alternative; GM options retain both sources as distinct labelled choices."}]})
    write(folder / "manifest.json",{"schemaVersion":1,"id":variant,"title":"Sea of Claws — Naval artillery","shortTitle":"Naval artillery","edition":4,"version":"1.0.0","kind":"variant","dependsOn":[BOOK,"up-in-arms"],"source":{"file":PDF.name,"sha256":SHA},"compatibility":{"reviewed":True,"notes":["User approved an explicitly enabled naval artillery variant. Printed compatible statistics are retained; no edition rule is invented.","In GM creation, source-labelled equipment alternatives are all available without changing the baseline catalogue or profile books."]},"files":{"weapons":"weapons.json","market":"market.json","coverage":"coverage.json"}})


def approve_crew_commander():
    for book, version in [("up-in-arms", "1.0.5"), ("dwarf-guide", "1.0.3")]:
        folder = PACK.parent / book
        manifest = read(folder / "manifest.json")
        prior = {"up-in-arms": "1.0.4", "dwarf-guide": "1.0.2"}[book]
        if manifest["version"] not in [prior, version]:
            raise ValueError(f"Review {book} changes before replacing its Crew Commander definition")
        talents = read(folder / "talents.json")
        talent = next(t for t in talents if t["name"] == "Crew Commander")
        talent.pop("unavailable", None)
        talent["limit"] = ["I"]
        talent["adaptation"] = "User-approved Fourth Edition adaptation: printed Initiative Bonus purchase limit and explicit Leadership/crew effect retained. No old default per-rank Talent Test bonus; situational crew effects are reference-only."
        talent["conversion"] = talent["adaptation"]
        if book == "dwarf-guide":
            talent["supersededBy"]["reason"] = "Uses the shared approved Up in Arms adaptation when both books are enabled."
        write(folder / "talents.json", talents)
        manifest["version"] = version
        manifest["compatibility"]["notes"] = [n.replace("Crew Commander is visible but unavailable until its repeat limit and Test bonus are converted by agreement.", "Crew Commander uses the approved Initiative Bonus limit and explicit effect, without the old default rank bonus.").replace("Axefighter and Crew Commander remain unavailable.", "Axefighter remains unavailable; Crew Commander uses its approved adaptation.") for n in manifest["compatibility"]["notes"]]
        write(folder / "manifest.json", manifest)


def build():
    decisions = read(ROOT / "scripts/sea-of-claws-decisions.json")
    expected = {"origins":"fifth-edition", "careers":"explicit-alternatives", "talents":"printed-limits", "little":"tiny-manual", "small":"core-wounds", "traits":"core-conversions", "seasickness":"strength-bonus-hours", "stromfels":"reference-stricture", "tableGaps":"artisan-07-10-sailor-68-71", "khorne":"reference-only", "artillery":"optional-variant", "crewCommander":"printed-limit-reference-effect"}
    if decisions != expected: raise ValueError("Review changed user decisions before rebuilding")
    assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA
    approve_crew_commander()
    doc = pymupdf.open(PDF)
    candidates = REVIEW / "pack-candidates"
    spells = read(candidates / "spells.json")
    seasickness = next(s for s in read(REVIEW / "spells.raw.json") if s["name"] == "Seasickness")
    seasickness["text"] = "You curse someone, even the saltiest of seadogs, with a bout of seasickness for the duration. See Sea of Claws p. 125 for Seasickness."
    seasickness["conversion"] = "User chose the printed Duration field (Strength Bonus hours) over the description's contradictory one hour; both source statements are documented."
    spells.append(seasickness)
    rules = read(candidates / "rules.json")
    def rule(group, key, value, page, reason, operation="include"):
        rules.append({"id": ident("rule", f"{group}-{key}"), "path": [group, key] if key else [group], "operation": operation, "value": value, "page": page, "reason": reason})
    rule("classKit", "Seafarer", ["Cloak", "Clothing", "Dagger", "Pouch", "Sling Bag containing 10 yards of Rope and a Flask of Spirits"],63,"Printed Seafarer Class Trappings.","add")
    # Explicit core equivalents already approved for the other supplied books.
    aliases = {"Strider":"Striding Gait", "Warleader":"War Leader", "Public Speaking":"Public Speaker", "Stout-hearted":"Stout-hearted", "In-fighter":"In-fighter", "In-Fighter":"In-fighter"}
    careers = read(REVIEW / "careers.raw.json")
    for career in careers:
        original = career["name"]
        changes = []
        if original == "Huffer":
            career["name"] = "Pilot"
            career["id"] = ident("career", "pilot")
            career["alternativeFor"] = "pilot"
            career["text"] = "Printed as Huffer, Sea of Claws p. 68. An explicit alternative to the Fifth Edition Pilot Career."
            changes.append("Printed Huffer uses the current Pilot Career name; the four Seafarer levels remain source-specific.")
        elif original in ["Sailor","Wrecker"]:
            career["alternativeFor"] = slug(original)
        for level in career["levels"]:
            mapped = []
            for talent in level["talents"]:
                for old, new in aliases.items():
                    if talent == old or talent.startswith(old + " ("):
                        talent = talent.replace(old,new,1)
                        if old in ["Strider","Public Speaking"]: changes.append(f"{old} uses current core {new} effects.")
                        break
                if talent == "Chanty": talent = "Chanty (Any)"
                mapped.append(talent)
            level["talents"] = mapped
        if original == "Priest of Stromfels":
            career["text"] = "Sea of Claws p. 89 requires a Priest of Stromfels to develop Strength to the minimum for the next Career tier before other Characteristics, or earn Sin Points. This old tier-minimum stricture is a legacy reference: Fifth Edition uses trackers and no XP gate is invented. Other cult strictures remain rules for play."
            changes.append("Old Strength-tier advancement stricture retained as reference only, without an invented tracker/XP restriction.")
        if changes: career["adaptation"] = " ".join(dict.fromkeys(changes))
    write(PACK / "careers.json", careers)
    for group, values, page in [
        ("Lore",["Coasts and Tides","Oceans","Wrecks","Manann","Stromfels","Norsca","Khorne"],63),
        ("Trade",["Boatbuilder"],64), ("Play",["Fiddle","Squeezebox","Tin Whistle","Pennywhistle"],66),
        ("Language",["Norse","Gospodarinyi"],56),
    ]:
        base_options=next(s["options"] for s in read(ROOT / "content/sources/data/skills.json") if s["name"]==group)
        additions=[value for value in values if value not in base_options]
        if additions:rule("skillOptions",group,additions,page,"Printed Sea of Claws specialisations; current core Skill definition and advancement apply.")
    chanties = read(REVIEW / "chanties.raw.json")
    rule("talentOptions","Chanty",[c["name"] for c in chanties],67,"One distinct printed song per Chanty purchase; no additional XP or tracker box for selecting the song.","add")
    for key, values, page in [("Striding Gait",["Coastal"],64),("Etiquette",["Crew"],66),("Hatred",["Followers of Stromfels","Manannites","Followers of Chaos"],74)]:
        # An existing setting can be extended idempotently only with include.
        config = read(ROOT / "content/sources/data/books/core/config.json")
        existing = config["talentOptions"].get(key)
        additions = [value for value in values if value not in (existing or [])]
        if additions:
            rule("talentOptions",key,additions,page,"Explicit printed Career Talent specialisations; current core effects apply.","append" if existing is not None else "add")
    talent_blocks = doc[62].get_text("blocks")
    chanty_text = next(b[4] for b in talent_blocks if "Chanty\nMax:" in b[4]).split("Tests: Entertain (Singing)\n",1)[1]
    commander_text = next(b[4] for b in talent_blocks if b[4].startswith("Master and Commander\n")).split("Tests: Leadership\n",1)[1]
    # Chanty's last paragraphs are separate PDF blocks.
    chanty_text += " " + " ".join(b[4] for b in talent_blocks if b[4].startswith(("It takes 30 seconds", "A Chanty may be sung")))
    talents = [
        {"id":ident("talent","chanty"),"name":"Chanty (Any)","page":63,"songs":chanties,"text":clean(chanty_text)+" Each purchase selects one different song from p. 67.","limit":["Int"],"adaptation":"User-approved printed Intelligence Bonus limit and effects; old default per-rank Test bonuses omitted. Songs use their printed effects as references only."},
        {"id":ident("talent","master-and-commander"),"name":"Master and Commander","page":63,"text":clean(commander_text),"limit":["Fel"],"adaptation":"User-approved printed Fellowship Bonus limit and explicit per-rank Leadership effect retained. No additional old default Test bonus; situational effect is not automated."},
    ]
    write(PACK / "talents.json",talents)
    # Crew Commander reuses the approved shared definition with explicit precedence.
    origins = []
    names = []
    for b in doc[55].get_text("blocks"):
        for label in ["Male Norse Names:","Female Norse Names:"]:
            if label in b[4]: names.extend([clean(n) for n in b[4].split(label,1)[1].split(",") if clean(n)])
    human_data = [
        ("Bjornling",["Consume Alcohol","Evaluate","Gossip","Haggle","Language (Reikspiel)","Language (Wastelander)","Lore (Norsca)","Melee (Basic)","Row","Sail","Swim","Trade (Any)"],[["Fisherman","War Leader"],["Resistant (Chaos)"],["Sea Legs","Warrior Born"]]),
        ("Sarl",["Animal Care","Consume Alcohol","Gossip","Language (Reikspiel)","Language (Gospodarinyi)","Lore (Norsca)","Melee (Basic)","Ride (Any)","Row","Sail","Swim","Trade (Any)"],[["Crack the Whip","Old Salt"],["Resistant (Chaos)"],["Roughrider","Sea Legs"]]),
        ("Skaeling",["Consume Alcohol","Cool","Endurance","Entertain (Storytelling)","Language (Reikspiel)","Language (Wastelander)","Lore (Khorne)","Melee (Basic)","Melee (Two-Handed)","Row","Sail","Swim"],[["Beneath Notice","Resolute"],["Berserk Charge","Flee!"],["Resistant (Chaos)"]]),
    ]
    for name, skills, talents in human_data:
        origins.append({"id":ident("origin",name),"name":f"{name} Norse","species":"Human","page":56,"skills":skills,"talents":talents,"randomTalents":2,"languages":["Norse"],"background":{"forenames":names,"surnames":[n + suffix for n in names for suffix in ["sson", "dottir"]],"page":56},"text":"Surname suggestions combine a printed Norse parent name with the core Dwarf sson/dottir endings, following Sea of Claws p. 56; nicknames can be entered freely.","conversion":"Core Human physical attributes, Fate/Fortune and creation limits. Native Norse replaces native Reikspiel; Reikspiel remains a selectable printed Species Skill. Five Species Skills at +5.","adaptation":"User-approved Fifth Edition starting Skill allocations and native-language handling replace old +5/+3 allocations."})
    origins.append({"id":ident("origin","norse-dwarf"),"name":"Norse Dwarf","species":"Dwarf","page":41,"skills":["Climb","Consume Alcohol","Cool","Endurance","Entertain (Storytelling)","Evaluate","Language (Khazalid)","Language (Norse)","Lore (Dwarfs)","Melee (Basic)","Sail","Trade (Any)"],"talents":[["Carouser","Strong-minded"],["Magic Resistance"],["Night Vision"],["Read/Write","Relentless"],["Sturdy"]],"randomTalents":0,"languages":["Khazalid","Reikspiel"],"adaptation":"User-approved core five Skills at +5, physical profile, creation limits and native Khazalid/Reikspiel with printed regional choices."})
    write(PACK / "origins.json",origins)
    # Tables: replace exactly the Riverfolk intervals; retain the remainder
    # of the supplied Fifth Edition table, rather than inventing new weights.
    raw_tables = read(REVIEW / "tables.raw.json")
    core_careers = read(ROOT / "content/sources/data/careers.json")
    by_name = {c["name"]:c["id"] for c in core_careers}
    by_name.update({c["name"]:c["id"] for c in careers})
    by_name["Huffer"] = ident("career","pilot")
    by_name["Sailor-Priest of Manann"] = ident("career","sailor-priest-of-manann")
    by_name["Ship’s Gunner"] = ident("career","ship-s-gunner")
    by_name["Advisor"] = "adviser"
    intervals = lambda text: [int(n) for n in re.findall(r"\d+",text)]
    tables = []
    norse_rows = []
    for cls, name, bounds in next(t["cells"] for t in raw_tables if t["page"]==57)[1:]:
        span=intervals(bounds)
        if name=="Artisan":span=[7,10]
        norse_rows.append({"min":span[0],"max":span[-1],"result":by_name[clean(name)]})
    tables.append({"id":ident("table","norse-careers"),"name":"Norse Human Careers","kind":"career","species":"Human","origins":[o["id"] for o in origins if o["species"]=="Human"],"sides":100,"page":57,"rows":norse_rows,"conversion":"User-approved Artisan 07–10 resolves missing 07. Advisor uses core Adviser; Huffer uses source Pilot alternative. Other printed weights remain unchanged."})
    sea_rows = next(t["cells"] for t in raw_tables if t["page"]==63)
    core_rolls = read(ROOT / "content/sources/data/career-rolls.json")
    for column, species in enumerate(["Human","Dwarf","Halfling","High Elf","Wood Elf"],1):
        replacement=[]
        for row in sea_rows[1:]:
            span=intervals(row[column])
            if not span:continue
            name=clean(row[0])
            if species=="Human" and name=="Sailor":span=[68,71]
            replacement.append({"min":span[0],"max":span[-1],"result":by_name[name]})
        if not replacement:continue
        low=min(r["min"] for r in replacement);high=max(r["max"] for r in replacement)
        rows=[{"min":r[species][0],"max":r[species][1],"result":next(c["id"] for c in core_careers if c["name"]==r["career"])} for r in core_rolls if r[species] and (r[species][1]<low or r[species][0]>high)]
        tables.append({"id":ident("table",f"seafarer-{species}"),"name":f"Optional Seafarer Careers ({species})","kind":"career","species":species,"sides":100,"page":63,"rows":sorted(rows+replacement,key=lambda r:r["min"]),"conversion":"Explicit optional Riverfolk-section replacement, retaining core weights outside this section. Human Sailor 68–71 corrects the omitted 68 by user decision."})
    write(PACK / "tables.json",tables)
    write(PACK / "spells.json",spells)
    write(PACK / "market.json",read(candidates / "market.json"))
    write(PACK / "rules.json",rules)
    return doc, careers, origins, chanties


if __name__ == "__main__":
    publish(*build())
