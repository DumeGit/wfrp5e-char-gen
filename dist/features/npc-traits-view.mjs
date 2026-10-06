import { esc } from "../workspace.mjs";
import { trainingChoices } from "../npc-training.mjs";
import {
  traitParameter,
  suggestedTraits,
  profileFeatures,
} from "../npc-profile.mjs";
import { legacyTag } from "../legacy.mjs";
import { btn, select, field } from "./npc-controls.mjs";
export function createNPCTraits(getContext, ref) {
  function traitsView() {
    const { R, s, d, ui } = getContext(),
      entry = R.traits.find((x) => x.contentId === ui.trait),
      parameter = entry ? traitParameter(entry.name, entry) : null;
    let choices;
    if (entry?.name === "Trained") choices = trainingChoices(d.profile);
    if (entry?.name === "Breath")
      choices = ["Acid", "Cold", "Electricity", "Fire", "Poison", "Smoke"];
    if (entry?.name === "Mark of Chaos")
      choices = ["Khorne", "Nurgle", "Slaanesh", "Tzeentch"];
    if (["Blessed", "Miracles"].includes(entry?.name)) choices = R.config.gods;
    if (entry?.name === "Spellcaster")
      choices = [...new Set(R.spells.map((x) => x.category))].filter(
        (x) => !["Petty", "Arcane", "Blessing", ...R.config.gods].includes(x),
      );
    return `<h2>Creature Traits</h2><div id="npc-traits" class="npc-compact-list">${d.traits
      .filter((t) => t.name !== "Size")
      .map(
        (t) =>
          `<div class="npc-item"><details data-detail-key="npc:trait:${esc(t.id)}:${esc(t.value)}"><summary><strong>${esc(t.name)}${t.value ? ` (${esc(t.value)})` : ""}</strong><small>${t.printed ? "Printed" : "Added"}</small>${legacyTag(R, t)}</summary><p>${esc(R.traits.find((x) => x.contentId === t.id)?.text || "")}</p>${ref(R.traits.find((x) => x.contentId === t.id))}</details>${t.printed || s.traits.some((x) => x.id === t.id && x.value === t.value) ? btn("remove-trait", "Remove", `data-id="${esc(t.id)}" data-value="${esc(t.value)}" data-printed="${t.printed}"`) : `<small class="muted">Granted by selected option</small>`}</div>`,
      )
      .join(
        "",
      )}</div><p class="small">${suggestedTraits(R, d.profile).length ? "Printed suggestions: " : ""}${suggestedTraits(
      R,
      d.profile,
    )
      .map((t) =>
        btn(
          "suggest-trait",
          t.name,
          `data-id="${esc(t.contentId)}"`,
          "text-button",
        ),
      )
      .join(" · ")}</p>
    <div class="npc-toolbar">${field("Add Trait", select("npc-trait-select", [["", "Choose…"], ...R.traits.filter((x) => x.name !== "Size").map((x) => [x.contentId, x.name])], ui.trait, 'data-ui="trait"'))}${parameter ? field(entry.parameter || "Value", choices ? select("npc-trait-value", [["", "Choose…"], ...choices], ui.traitValue, 'data-ui="traitValue"') : `<input id="npc-trait-value" data-ui="traitValue" ${parameter === "number" ? 'type="number" min="1"' : ""} value="${esc(ui.traitValue)}" placeholder="${parameter === "number" ? "Rating" : esc(entry.parameter || "Value")}">`) : ""}${btn("add-trait", "Add Trait", entry && (!parameter || ui.traitValue) ? "" : "disabled", "primary")}</div>${entry ? `<details data-detail-key="npc:trait-preview:${esc(entry.contentId)}"><summary>${esc(entry.name)} · rule description</summary><p class="small">${esc(entry.text)} ${ref(entry)}</p></details>` : ""}
    ${d.trainingReferences.map((x) => `<details data-detail-key="npc:training:${esc(x.name)}"><summary>Trained (${esc(x.name)}) ${ref(x)}</summary><p>${esc(x.text)}</p><p class="small muted">Command Tests and ongoing training are references; they are not rolled or tracked by this creator.</p></details>`).join("")}
    ${d.training.has("Broken") && !profileFeatures(R, d.profile, "trait").some((t) => t.name === "Trained" && t.value.includes("Broken")) ? `<div id="npc-training-roll">${btn("training-roll", "Roll Broken’s 2d10 Fellowship")}${s.trainingRoll ? `<span>${s.trainingRoll.faces.join(" + ")} = ${s.trainingRoll.faces.reduce((a, b) => a + b, 0)}</span>` : ""}</div>` : ""}
    ${d.traits.some((t) => t.name === "Mark of Chaos" && t.value === "Tzeentch" && !t.printed) ? `<div id="npc-mark-roll" class="npc-toolbar">${field("First Mutation table", select("npc-mark-start", ["Mental", "Physical"], ui.markStart, 'data-ui="markStart"'))}${btn("mark-roll", "Roll Tzeentch Mutations")}${s.markRoll ? `<span>d10 ${s.markRoll.faces[0]} → ${Math.ceil(s.markRoll.faces[0] / 3)} alternating Mutations</span>` : ""}</div>` : ""}`;
  }
  function mutationsView() {
    const { R, s, d, ui } = getContext();
    return `<details id="npc-mutations" data-detail-key="npc:mutations"><summary>Mutations <small>${d.mutations.length} chosen</small></summary>${d.mutations.map((m, i) => `<div class="npc-item"><div><strong>${esc(m.name)}</strong><p class="small">${esc(m.text)} ${ref(m)}</p>${["Extra Mouth", "Patchy Feathers", "Spiny Protrusions"].includes(m.name) ? field("Location(s)", `<input id="npc-mutation-location-${i}" data-mutation-location="${i}" value="${esc(m.location || "")}" placeholder="Enter the location(s) rolled on p. 163">`) : ""}</div>${btn("remove-mutation", "Remove", `data-index="${i}"`)}</div>`).join("")}<div class="npc-toolbar">${field(
      "Mutation",
      select(
        "npc-mutation",
        R.mutations.map((x) => [x.contentId, `${x.category}: ${x.name}`]),
        ui.mutation,
        'data-ui="mutation"',
      ),
    )}${btn("add-mutation", "Add Mutation")}${btn("roll-mutation", "Roll mental d100", 'data-table="Mental"')}${btn("roll-mutation", "Roll physical d100", 'data-table="Physical"')}</div></details>`;
  }
  return { traitsView, mutationsView };
}
