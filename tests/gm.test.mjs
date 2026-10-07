import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assembleBooks } from "../dist/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
  applyTemplate,
  individualise,
  woundFormula,
} from "../dist/gm/model.mjs";
import { prepareGM } from "../dist/gm/content.mjs";
import { pickerEntries, workspace } from "../dist/gm/views.mjs";
import { sheetSections, createGMPDF } from "../dist/gm/pdf.mjs";
import { prepareGMPrint, cardSections } from "../dist/gm/print.mjs";
import { wrapPDFRuns } from "../dist/gm/pdf-text.mjs";
import { statBlock } from "../dist/gm/sheet.mjs";
import * as PDFLib from "pdf-lib";
const R = assembleBooks(
    JSON.parse(
      await readFile(
        new URL("../dist/data/book-library.json", import.meta.url),
      ),
    ),
  ),
  data = JSON.parse(
    await readFile(new URL("../dist/gm/data.json", import.meta.url)),
  ),
  raw = JSON.parse(
    await readFile(new URL("../dist/gm/sources/core.json", import.meta.url)),
  );
const profile = (name) => data.profiles.find((p) => p.name === name),
  draft = (name) => freshGM(data, profile(name).id),
  result = (s) => calculateGM(data, R, s),
  trait = (s, name, value = "") =>
    s.traits.push({
      key: `gm-test-${s.traits.length}`,
      name,
      value,
      ranks: 1,
      origin: "GM",
    });

test("mixed-weight PDF wrapping preserves content and measures the actual font faces", async () => {
  const doc = await PDFLib.PDFDocument.create(),
    font = await doc.embedFont(PDFLib.StandardFonts.Helvetica),
    bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold),
    longName = "UnbrokenCreatureName".repeat(8),
    runs = [
      { text: "Attacks: ", bold: true },
      { text: `Fangs 40 / +8; ${longName} 55 / +12\n` },
      { text: "Magic: ", bold: true },
      { text: "Aethyric Armour (CN 2)" },
    ];
  for (const size of [7.5, 9.25, 11]) {
    const lines = wrapPDFRuns(runs, font, bold, size, 245);
    assert.equal(
      lines
        .flat()
        .map((x) => x.text)
        .join("")
        .replace(/\s/g, ""),
      runs
        .map((x) => x.text)
        .join("")
        .replace(/\s/g, ""),
    );
    assert.equal(lines[0][0].bold, true);
    assert.ok(lines.flat().some((x) => !x.bold && x.text.includes("Fangs")));
    for (const line of lines) {
      const width = line.reduce(
        (n, x) => n + (x.bold ? bold : font).widthOfTextAtSize(x.text, size),
        0,
      );
      assert.ok(width <= 245 + 0.001, `Text exceeds card width at ${size} pt`);
    }
  }
});

test("six complete table cards share one portrait A4 page, with additional cards paginated", async () => {
  const s = draft("Human"),
    r = result(s),
    entries = Array.from({ length: 6 }, () => ({ s, r }));
  const print = await prepareGMPrint(PDFLib, entries);
  assert.equal(print.perPage, 6);
  assert.deepEqual(print.overflow, []);
  assert.ok(print.cards.every((c) => c.fontSize >= 7.5));
  const doc = await PDFLib.PDFDocument.load(await print.bytes());
  assert.equal(doc.getPageCount(), 1);
  assert.ok(Math.abs(doc.getPage(0).getWidth() - 595.28) < 0.01);
  assert.ok(Math.abs(doc.getPage(0).getHeight() - 841.89) < 0.01);
  assert.equal(
    (await prepareGMPrint(PDFLib, [...entries, { s, r }], { perPage: 6 }))
      .pages,
    2,
  );
});

test("four-card layout measures each profile and never clips oversized content", async () => {
  const s = draft("Dragon"),
    r = result(s);
  const print = await prepareGMPrint(
    PDFLib,
    Array.from({ length: 4 }, () => ({ s, r })),
    { perPage: 4 },
  );
  assert.deepEqual(print.overflow, []);
  assert.equal(
    (await PDFLib.PDFDocument.load(await print.bytes())).getPageCount(),
    1,
  );
  const huge = {
    ...s,
    includeNotes: true,
    notes: "A very long optional note. ".repeat(1000),
  };
  const blocked = await prepareGMPrint(PDFLib, [{ r, s: huge }], {
    perPage: 6,
  });
  assert.deepEqual(blocked.overflow, [r.name]);
  await assert.rejects(blocked.bytes(), /do not fit/);
});

test("all 53 described core profiles fit four-per-A4, with measured six-card overflow rather than dropped Traits", async () => {
  const entries = data.profiles.map((p) => {
    const s = freshGM(data, p.id);
    return { s, r: result(s) };
  });
  for (let i = 0; i < entries.length; i += 48) {
    const print = await prepareGMPrint(PDFLib, entries.slice(i, i + 48));
    assert.ok(print.cards.every((c) => c.fontSize >= 7.5));
    if (print.overflow.length) {
      await assert.rejects(print.bytes(), /do not fit/);
      const larger = await prepareGMPrint(PDFLib, entries.slice(i, i + 48), {
        perPage: 4,
      });
      assert.deepEqual(larger.overflow, []);
      assert.ok(larger.cards.every((c) => c.fontSize >= 7.5));
    }
  }
});

test("Griffon sheet uses the three printed Trait descriptions, never suggested optional Traits", () => {
  const s = draft("Griffon"),
    r = result(s);
  assert.deepEqual(
    r.traits.map((t) => t.name),
    ["Fly", "Night Vision", "Size"],
  );
  assert.match(r.traits[0].description, /fly up to 80 yards/);
  assert.equal(r.attacks[0].text, "Fast");
  assert.match(
    r.traits[1].description,
    /extend the illumination distance.*20 yards/,
  );
  assert.match(r.traits[2].description, /page 360/);
  for (const text of [
    JSON.stringify(sheetSections(r, s)),
    JSON.stringify(cardSections(r, s)),
    statBlock(r, s),
  ]) {
    assert.match(text, /Fly \(80\)/);
    assert.match(text, /fly up to 80 yards/);
    assert.doesNotMatch(
      text,
      /Optional Traits|Bestial|Immune to Psychology|Territorial|Trained/,
    );
  }
  const html = statBlock(r, s);
  assert.match(html, /<strong>Fly \(80\):<\/strong>/);
  s.removed.push(r.traits.find((t) => t.name === "Night Vision").key);
  assert.doesNotMatch(
    JSON.stringify(cardSections(result(s), s)),
    /Night Vision|illumination/,
  );
});

test("added Traits and updated ratings use full definitions without stale profile summaries; rule conflicts retain the full core rule", () => {
  const s = draft("Griffon");
  s.removed.push(profile("Griffon").traits.find((t) => t.name === "Fly").key);
  trait(s, "Fly", "40");
  trait(s, "Bestial");
  const r = result(s);
  assert.equal(
    r.traits.find((t) => t.name === "Fly").description,
    data.traits.find((t) => t.name === "Fly").text,
  );
  assert.equal(
    r.traits.find((t) => t.name === "Bestial").description,
    data.traits.find((t) => t.name === "Bestial").text,
  );
  assert.doesNotMatch(
    JSON.stringify(cardSections(r, s)),
    /80 yards|Fly \(80\)/,
  );
  const spider = draft("Giant Spider");
  trait(spider, "Venom", "Average");
  assert.equal(
    result(spider).traits.find((t) => t.name === "Venom").description,
    data.traits.find((t) => t.name === "Venom").text,
  );
  assert.match(
    result(draft("Bloodletter of Khorne")).traits.find(
      (t) => t.name === "Frenzy",
    ).description,
    /Test WP to enter Frenzy: Free Attack/,
  );
  assert.match(
    result(draft("Orc")).traits.find((t) => t.name === "Belligerent")
      .description,
    /Momentum/,
  );
  assert.ok(
    result(draft("Orc")).warnings.some((w) => /summary.*Advantage/.test(w)),
  );
  assert.doesNotMatch(
    JSON.stringify(cardSections(result(draft("Orc")), draft("Orc"))),
    /profile summary|Advantage/,
  );
  const injected = {
    ...r,
    traits: [{ ...r.traits[0], description: "<script>bad</script>" }],
  };
  assert.doesNotMatch(statBlock(injected, s), /<script>/);
  assert.match(statBlock(injected, s), /&lt;script&gt;/);
});

test("table cards retain mechanical fields and Trait descriptions, omitting discrepancy notes", async () => {
  const s = draft("Giant Spider");
  s.size = "Large";
  const r = result(s),
    sections = cardSections(r, s);
  assert.match(JSON.stringify(sections), /Fangs 40 \/ \+8/);
  assert.match(JSON.stringify(sections), /Wallcrawler/);
  assert.doesNotMatch(
    JSON.stringify(sections),
    /discrepancy|worked example|printing mismatch/,
  );
  const invalid = draft("Human");
  invalid.size = "Tiny";
  await assert.rejects(
    prepareGMPrint(PDFLib, [{ s: invalid, r: result(invalid) }]),
    /Resolve/,
  );
  await assert.rejects(prepareGMPrint(PDFLib, []), /between 1 and 48/);
  await assert.rejects(
    prepareGMPrint(PDFLib, [{ s, r }], { perPage: 3 }),
    /six or four/,
  );
});
test("every core profile preserves untouched printed values, Skills and attacks", () => {
  assert.equal(data.profiles.length, 53);
  assert.equal(data.templates.length, 7);
  assert.equal(data.traits.length, 67);
  for (const p of data.profiles) {
    const s = freshGM(data, p.id),
      r = result(s);
    assert.deepEqual(
      r.stats,
      Object.fromEntries(Object.entries(p.stats).filter(([k]) => k !== "W")),
      p.name,
    );
    assert.equal(r.wounds, p.stats.W, p.name);
    assert.equal(r.tb, p.toughnessBonus ?? Math.floor(p.stats.T / 10), p.name);
    assert.equal(r.issues.length, 0, p.name);
    for (const x of p.skills)
      assert.equal(
        r.skills.find((t) => t.name === x.name).total,
        x.total,
        p.name,
      );
    for (const a of p.attacks.filter((a) => !a.optional)) {
      const final = r.attacks.find((x) => x.key === a.key);
      assert.equal(final.skill, a.skill, p.name);
      assert.equal(final.damage, a.damage, p.name);
    }
    assert.equal(
      new Set(p.traits.map((t) => t.name)).size,
      p.traits.length,
      p.name,
    );
    validateGMDraft(data, R, s);
  }
});
test("source compilation rejects invalid source and keeps the Dragon naming decision scoped", () => {
  assert.throws(() =>
    prepareGM({ ...raw, source: { ...raw.source, sha256: "wrong" } }, R),
  );
  const p = profile("Dragon");
  assert.ok(p.skills.some((s) => s.name === "Track" && s.total === 70));
  assert.ok(p.notes.some((n) => n.includes("Tracking")));
  assert.ok(!p.skills.some((s) => s.name === "Tracking"));
});
test("resizing the Spider follows the general Size rule and keeps the worked conflict in app only", async () => {
  const s = draft("Giant Spider");
  s.size = "Large";
  const r = result(s);
  assert.equal(r.stats.S, 35);
  assert.equal(r.stats.T, 45);
  assert.equal(r.stats.Ag, 25);
  assert.equal(r.wounds, 26);
  assert.equal(r.attacks[0].damage, 8);
  assert.equal(r.attacks[1].damage, 6);
  assert.ok(r.warnings.some((n) => n.includes("+5")));
  assert.ok(!JSON.stringify(sheetSections(r, s)).includes("worked example"));
  const bytes = await createGMPDF(PDFLib, r, s);
  assert.equal((await PDFLib.PDFDocument.load(bytes)).getPageCount(), 1);
});
test("Tiny requires an early structured issue and blocks PDF until a manual Wounds value is set", async () => {
  const s = draft("Giant Spider");
  s.size = "Tiny";
  let r = result(s);
  assert.equal(r.issues[0].control.target, "#gm-wounds");
  assert.equal(r.issues[0].severity, "error");
  await assert.rejects(createGMPDF(PDFLib, r, s));
  s.wounds = 2;
  assert.equal(result(s).issues.length, 0);
});
test("Orc retains printed TB4 until a changed profile requires an explicit decision", () => {
  const s = draft("Orc");
  assert.equal(result(s).tb, 4);
  s.stats.T = 40;
  let r = result(s);
  assert.ok(r.issues.some((x) => x.code === "source.tb"));
  s.tbMode = "printed";
  r = result(s);
  assert.equal(r.tb, 4);
  assert.equal(r.issues.length, 0);
  s.stats.T = 50;
  s.tbMode = "calculated";
  assert.equal(result(s).tb, 5);
});
test("templates use higher Skill bonuses, require distinct alternatives and never stack", () => {
  const s = draft("Human Watchman");
  applyTemplate(s, data.templates.find((t) => t.name === "Elite").id);
  let r = result(s);
  assert.ok(r.issues.some((x) => x.control.target.includes("template-skill")));
  const t = r.template,
    index = t.skills.findIndex((x) => x.count === 2);
  s.templateSkills[index] = ["Melee (Basic)", "Melee (Basic)"];
  assert.ok(result(s).issues.length);
  s.templateSkills[index] = ["Melee (Basic)", "Melee (Brawling)"];
  r = result(s);
  assert.equal(r.stats.WS, profile("Human Watchman").stats.WS + 15);
  assert.ok(
    r.skills.find((x) => x.name === "Melee (Basic)").total >= r.stats.WS + 15,
  );
  assert.equal(r.issues.length, 0);
  applyTemplate(s, data.templates.find((t) => t.name === "Soldier").id);
  assert.equal(result(s).stats.WS, profile("Human Watchman").stats.WS + 10);
});
test("training handles absent Fellowship and Guard/War once", () => {
  const s = draft("Giant Spider");
  trait(s, "Trained", "Broken, Guard, War");
  assert.ok(
    result(s).issues.some((x) => x.control.target === "#gm-broken-roll"),
  );
  s.brokenRoll = [3, 7];
  const r = result(s);
  assert.equal(r.stats.Fel, 10);
  assert.equal(r.stats.WS, 45);
  assert.equal(r.traits.filter((t) => t.name === "Territorial").length, 1);
  const human = draft("Human");
  trait(human, "Trained", "Broken");
  human.brokenRoll = [3, 7];
  assert.equal(result(human).stats.Fel, profile("Human").stats.Fel + 10);
});
test("Swarm, Construct and Hardy use core Wounds calculations without double-counting", () => {
  const s = draft("Human");
  trait(s, "Swarm");
  let r = result(s);
  assert.equal(r.stats.WS, 40);
  assert.equal(r.wounds, 60);
  s.size = "Large";
  assert.equal(result(s).stats.S, 30);
  const c = draft("Human");
  trait(c, "Construct");
  r = result(c);
  assert.equal(r.stats.Int, null);
  assert.equal(r.stats.WP, null);
  assert.equal(r.stats.Fel, null);
  assert.equal(r.wounds, 12);
  const h = draft("Human");
  h.size = "Large";
  h.talents.push({ key: "gm-hardy", name: "Hardy", ranks: 1, origin: "GM" });
  assert.equal(result(h).wounds, 38);
  assert.equal(
    woundFormula({ S: 35, T: 45, WP: 25 }, "Large", false, false, 1),
    34,
  );
});
test("core equipment resolves attacks and AP, with shield kept conditional", () => {
  const s = draft("Human");
  const weapon = R.weapons.find((x) => x.name === "Dagger"),
    shield = R.armour.find((x) => x.name === "Shield"),
    armour = R.armour.find((x) => x.name === "Leather Jerkin");
  s.gear = [
    { key: "gm-weapon", id: weapon.contentId, quantity: 1 },
    { key: "gm-shield", id: shield.contentId, quantity: 1 },
    { key: "gm-armour", id: armour.contentId, quantity: 1 },
  ];
  const r = result(s);
  assert.equal(r.attacks.find((x) => x.key === "gm-weapon").damage, 5);
  assert.equal(r.ap.Body, 1);
  assert.equal(r.ap.Head, 0);
  assert.equal(r.shield, 2);
});
test("optional printed attacks/armour and removals are explicit and reversible", () => {
  const s = draft("Human"),
    p = profile("Human");
  const a = p.attacks.find((x) => x.optional),
    arm = p.armour.find((x) => x.optional);
  assert.ok(a);
  assert.ok(!result(s).attacks.some((x) => x.key === a.key));
  s.optionalAttacks.push(a.key);
  s.optionalArmour.push(arm.key);
  assert.ok(result(s).attacks.some((x) => x.key === a.key));
  assert.ok(result(s).armour.some((x) => x.key === arm.key));
  s.removed.push(a.key);
  assert.ok(!result(s).attacks.some((x) => x.key === a.key));
  s.removed = [];
  assert.ok(result(s).attacks.some((x) => x.key === a.key));
});
test("Spellcaster template allows compatible magic and enforces printed count limits", () => {
  const s = draft("Human"),
    t = data.templates.find((t) => t.name === "Spellcaster");
  applyTemplate(s, t.id);
  for (const [i, x] of t.skills.entries())
    if (x.options.length > 1)
      s.templateSkills[i] = [
        x.options.find((n) => n === "Channelling (Ghur)") || x.options[0],
      ];
  for (const [i, x] of t.talents.entries())
    if (x.options.length > 1)
      s.templateTalents[i] =
        x.options.find((n) => n === "Arcane Magic (Beasts)") || x.options[0];
  let r = result(s);
  assert.equal(r.issues.length, 0);
  const choices = pickerEntries(data, R, r, "magic");
  assert.ok(choices.some((x) => x.category === "Beasts"));
  assert.ok(!choices.some((x) => x.category === "Fire"));
  s.spells = R.spells
    .filter((x) => x.category === "Petty")
    .slice(0, 4)
    .map((x) => x.contentId);
  assert.ok(result(s).issues.some((x) => x.code === "magic.count"));
  s.spells = [R.spells.find((x) => x.category === "Fire").contentId];
  assert.ok(result(s).issues.some((x) => x.code === "magic.lore"));
});
test("real rolls record faces and variation replaces the previous score", () => {
  const s = draft("Human"),
    p = profile("Human");
  individualise(s, p, "WS");
  const first = s.rolls[0];
  assert.equal(first.faces.length, 2);
  assert.equal(
    first.total,
    first.faces.reduce((a, b) => a + b, 0),
  );
  assert.equal(s.stats.WS, p.stats.WS - 10 + first.total);
  individualise(s, p, "WS");
  assert.equal(s.stats.WS, p.stats.WS - 10 + s.rolls[1].total);
  assert.equal(s.rolls.length, 2);
});
test("GM saves reject PC files, unknown versions, malformed choices, duplicate identities and invalid dice", () => {
  const s = draft("Human");
  assert.throws(() => validateGMDraft(data, R, { ...s, type: "player" }));
  assert.throws(() => validateGMDraft(data, R, { ...s, dataVersion: "old" }));
  assert.throws(() => validateGMDraft(data, R, { ...s, profile: "unknown" }));
  assert.throws(() =>
    validateGMDraft(data, R, {
      ...s,
      traits: [{ key: "gm-x", name: "Invented", value: "" }],
    }),
  );
  assert.throws(() =>
    validateGMDraft(data, R, {
      ...s,
      rolls: [
        {
          label: "bad",
          faces: [11],
          total: 11,
          count: 1,
          sides: 10,
          page: 318,
          at: "now",
        },
      ],
    }),
  );
  assert.throws(() =>
    validateGMDraft(data, R, { ...s, templateSkills: { 0: ["Climb"] } }),
  );
  const h = draft("Human");
  h.template = data.templates.find((t) => t.name === "Elite").id;
  const index = data.templates
    .find((t) => t.id === h.template)
    .skills.findIndex((x) => x.count === 2);
  h.templateSkills[index] = ["", "Melee (Basic)"];
  validateGMDraft(data, R, h);
});
test("mobile creator navigation, issue panel and every control escape user content", () => {
  const s = draft("Human");
  s.name = '<img src=x onerror="bad">';
  s.step = 3;
  const r = result(s),
    html = workspace(
      data,
      R,
      s,
      r,
      { tab: 0, profileQuery: "", category: "", browse: false },
      true,
      false,
      "Saved",
    );
  assert.ok(html.includes('id="gm-step-select"'));
  assert.ok(html.includes('aria-label="Creator"'));
  assert.ok(html.includes("&lt;img"));
  assert.ok(!html.includes(s.name));
});
test("long user notes produce paginated PDF without source discrepancy text", async () => {
  const s = draft("Dragon");
  s.includeNotes = true;
  s.notes = Array.from(
    { length: 70 },
    (_, i) =>
      `GM note ${i}: keep every detail of this creature's appearance and behaviour.`,
  ).join("\n");
  const bytes = await createGMPDF(PDFLib, result(s), s);
  assert.ok((await PDFLib.PDFDocument.load(bytes)).getPageCount() > 1);
});
test("Blessed and Miracles grant only their respective prayer access", () => {
  const s = draft("Human");
  trait(s, "Blessed", "Shallya");
  let choices = pickerEntries(data, R, result(s), "magic");
  assert.ok(choices.some((x) => x.category === "Blessing"));
  assert.ok(!choices.some((x) => x.category === "Shallya"));
  s.traits = [];
  trait(s, "Miracles", "Shallya");
  choices = pickerEntries(data, R, result(s), "magic");
  assert.ok(!choices.some((x) => x.category === "Blessing"));
  assert.ok(choices.some((x) => x.category === "Shallya"));
});
test("Spellcaster Trait does not invent a Petty Magic grant, and specialised Talent choices are usable", () => {
  const s = draft("Human");
  trait(s, "Spellcaster", "Beasts");
  const choices = pickerEntries(data, R, result(s), "magic");
  assert.ok(choices.some((x) => x.category === "Beasts"));
  assert.ok(!choices.some((x) => x.category === "Petty"));
  const talents = pickerEntries(data, R, result(s), "talent");
  assert.ok(talents.some((x) => x.name === "Bless (Shallya)"));
  assert.ok(talents.some((x) => x.name === "Arcane Magic (Fire)"));
  assert.ok(!talents.some((x) => x.name === "Bless (Deity)"));
});
test("a Small swarm has five times its normal printed Wounds; Fear uses the printed default", () => {
  const s = draft("Giant Spider");
  trait(s, "Swarm");
  assert.equal(result(s).wounds, 20);
  assert.equal(
    profile("Bloodletter of Khorne").traits.find((t) => t.name === "Fear")
      .value,
    "1",
  );
});
test("new weapon attack overrides are final values, including explicit zero Damage", () => {
  const s = draft("Human"),
    w = R.weapons.find((x) => x.name === "Dagger");
  s.gear.push({ key: "gm-dagger", id: w.contentId, quantity: 1 });
  s.talents.push({
    key: "gm-mighty",
    name: "Strike Mighty Blow",
    ranks: 1,
    origin: "GM",
  });
  s.attackOverrides["gm-dagger"] = { skill: 65, damage: 0 };
  validateGMDraft(data, R, s);
  const a = result(s).attacks.find((x) => x.key === "gm-dagger");
  assert.equal(a.skill, 65);
  assert.equal(a.damage, 0);
});
test("Quick Armour is not stacked with detailed armour, and template Talents do not duplicate owned names", () => {
  const s = draft("Chaos Warrior"),
    armour = R.armour.find((x) => x.name === "Leather Jerkin");
  s.gear.push({ key: "gm-armour", id: armour.contentId, quantity: 1 });
  assert.equal(result(s).ap.Body, 5);
  assert.ok(result(s).warnings.some((x) => x.includes("Quick Armour")));
  const other = draft("Stormvermin"),
    t = data.templates.find((t) => t.name === "Elite");
  applyTemplate(other, t.id);
  other.templateSkills[t.skills.findIndex((x) => x.count === 2)] = [
    "Melee (Basic)",
    "Melee (Brawling)",
  ];
  assert.equal(
    result(other).talents.filter((x) => x.name === "Combat Aware").length,
    1,
  );
});
