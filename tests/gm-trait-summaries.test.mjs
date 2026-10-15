import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { traitSummary } from "../dist/gm/trait-summaries.mjs";
import { describeTraits } from "../dist/gm/trait-descriptions.mjs";
import { selectableTemplates } from "../dist/gm/templates.mjs";

const data = JSON.parse(
  await readFile(new URL("../dist/gm/data.json", import.meta.url)),
);
const definition = (name) => data.traits.find((t) => t.name === name);
const summary = (name, value = "") =>
  traitSummary({ ...definition(name), value });

test("canonical Trait text stays immutable and unknown definitions retain their mechanics", () => {
  const snapshot = structuredClone(data.traits);
  for (const t of data.traits) {
    const text = traitSummary(t);
    assert.ok(text?.trim(), t.name);
    if (t.descriptionStatus === "reviewed") assert.equal(typeof t.descriptionId, "string");
  }
  assert.deepEqual(data.traits, snapshot);
  const unknown = {
    name: "Future Trait",
    source: { book: "future" },
    text: "Never discard an unreviewed mechanic.",
  };
  assert.equal(traitSummary(unknown), unknown.text);
});

test("Size shows the actual size, combat exceptions, manual Tiny and Swarm overrides", () => {
  const enormous = summary("Size", "Enormous");
  assert.match(
    enormous,
    /×4.*not ranged\/extra attacks.*−2 SL.*Fear.*Disengaging/s,
  );
  assert.match(
    enormous,
    /2\+ steps.*automatically.*Critical.*Counts as 3.*only 1.*Stomp.*SB Damage/s,
  );
  assert.doesNotMatch(
    enormous,
    /Giant Spider|Griffon|Butterfly|Monstrous|Counts as 4/,
  );
  assert.match(summary("Size", "Monstrous"), /adds 2 × SB/);
  assert.match(summary("Size", "Small"), /2 × TB.*No extra melee Damage/s);
  assert.match(summary("Size", "Tiny"), /no printed Wounds formula.*manually/);
  assert.doesNotMatch(summary("Size", "Tiny"), /undefined|Wounds: 2/);
  const swarm = describeTraits({ traits: [], sections: {} }, [
    { ...definition("Size"), value: "Large" },
    definition("Swarm"),
  ]);
  assert.match(swarm[0].description, /Size rules are ignored/);
  assert.doesNotMatch(swarm[0].description, /Stomp|adds SB/);
});

test("rated and conditional Traits retain costs, tests, limits and exceptions", () => {
  assert.match(
    summary("Venom", "Difficult"),
    /Causing Wounds inflicts Poisoned.*recover.*not to avoid/,
  );
  assert.match(
    summary("Regeneration"),
    /above 0.*1d10.*at 0.*8\+.*10.*Critical.*fire/s,
  );
  assert.match(
    summary("Vomit"),
    /starting.*Engaged.*Move and Action.*2 yards.*\+4 SL.*\+0 SL.*TB \+4.*Stunned.*1 Damage.*12 hours/s,
  );
  assert.match(
    summary("Fly", "40"),
    /40 yards.*must Fly or fall.*range step.*Extreme.*−20/s,
  );
  assert.match(
    summary("Magic Resistance"),
    /−3 SL.*Channelling.*Bless.*Invoke.*Witch!/,
  );
  assert.match(
    summary("Frenzy"),
    /Free Attack each Round.*\+1 Damage.*nearest visible enemy.*Stunned or Unconscious.*Fatigued/s,
  );
  assert.match(
    summary("Electrical Discharge"),
    /1 Momentum.*10 Damage.*non-magical metal.*−1 SL.*\+2 SL.*Fatigued.*6.*crew member.*3/s,
  );
  assert.match(
    summary("Stationary Attacker"),
    /cannot pursue.*Surprised.*Perception.*Lore.*either failure.*Massive/s,
  );
});

test("Breath, Marks and training include actual choices and preserve full rules separately", () => {
  const cold = summary("Breath", "8, Cold");
  assert.match(
    cold,
    /Free Attack.*BS roll.*30 if absent.*Dodge.*20 \+ TB.*SB yards.*SB \+2.*Fatigued.*Slow.*Immune/s,
  );
  assert.doesNotMatch(cold, /Acid:|Fire:|Poison:/);
  const training = summary("Trained", "Broken, War, Mount");
  assert.match(training, /Broken:.*2d10 Fellowship.*War:.*\+10 WS.*Mount:/s);
  assert.doesNotMatch(training, /Fetch:|Guard:|Home:|Shock Cavalry:/);
  const nurgle = summary("Mark of Chaos", "Nurgle");
  assert.match(
    nurgle,
    /\+10.*Toughness.*Animosity.*Tzeentch.*normal XP.*Hardy/s,
  );
  assert.doesNotMatch(nurgle, /Khorne:|Slaanesh:|Tzeentch:/);
  const full = definition("Size");
  const described = describeTraits({ traits: [], sections: {} }, [
    { ...full, value: "Large" },
  ])[0];
  assert.equal(described.text, full.text);
  assert.ok(described.description.length < full.text.length / 2);
  // An unusual book handler's replacement text must not regain an old benefit.
  const replacement = {
    ...definition("Vigor Mortis"),
    text: "Nearby Undead ignore Unstable. Balefire replaces the casting benefit.",
  };
  assert.equal(traitSummary(replacement), replacement.text);
});

test("template choices expose only legal foundations and exclude nested modifiers/marks", () => {
  const names = (id) =>
    selectableTemplates(
      data.templates,
      data.profiles.find((p) => p.id === id),
    ).map((t) => t.name);
  assert.deepEqual(selectableTemplates(data.templates, null), []);
  assert.ok(names("core:creatures:zombie").includes("Liche Lord"));
  assert.ok(!names("core:creatures:skeleton").includes("Liche Lord"));
  assert.ok(names("core:creatures:skeleton").includes("Wight"));
  assert.ok(!names("core:creatures:human").includes("Wight"));
  assert.ok(names("core:creatures:dog").includes("Warhound"));
  assert.ok(!names("core:creatures:human").includes("Warhound"));
  assert.ok(names("salzenmund:creatures:spite").includes("Mischief"));
  assert.ok(!names("core:creatures:human").includes("Mischief"));
  assert.ok(names("lustria:creatures:skink").includes("Priest caste"));
  assert.ok(!names("lustria:creatures:saurus").includes("Priest caste"));
  assert.ok(names("core:creatures:troll").includes("River Troll"));
  for (const p of data.profiles)
    assert.ok(
      selectableTemplates(data.templates, p).every(
        (t) => t.trollRole !== "modifier" && t.lustriaRole !== "mark",
      ),
    );
});
