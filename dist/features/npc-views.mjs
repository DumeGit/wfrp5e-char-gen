import { chapterHeading } from "../design-system.mjs";
import { NPC_SECTIONS } from "../npc-flow.mjs";
import {
  btn,
  select,
  field,
  value,
  createNPCReference,
  section,
} from "./npc-controls.mjs";
import { createNPCProfile } from "./npc-profile-view.mjs";
import { createNPCCharacteristics } from "./npc-characteristics-view.mjs";
import { createNPCTraits } from "./npc-traits-view.mjs";
import { createNPCTraining } from "./npc-training-view.mjs";
import { createNPCEquipment } from "./npc-equipment-view.mjs";
import { createNPCDevelopment } from "./npc-development-view.mjs";
import { createNPCReview } from "./npc-review-view.mjs";
import { createNPCShell } from "./npc-shell.mjs";
export { btn, select, field, value };
export const npcSteps = NPC_SECTIONS.map((x) => x.name);
export function createNPCViews(getContext) {
  const ref = createNPCReference(getContext);
  const profile = createNPCProfile(getContext, ref);
  const stats = createNPCCharacteristics(getContext, ref);
  const traits = createNPCTraits(getContext, ref);
  const training = createNPCTraining(getContext, ref);
  const equipment = createNPCEquipment(getContext, ref);
  const development = createNPCDevelopment(getContext, ref);
  const review = createNPCReview(getContext);
  const shell = createNPCShell(getContext, ref);
  const renderers = [
    profile.profileView,
    () =>
      chapterHeading("Characteristics") +
      section(
        "Development template",
        stats.templateView().replace("<h2>Development template</h2>", ""),
      ) +
      section(
        "Scores & size",
        stats.statsView().replace("<h2>Characteristics & size</h2>", ""),
      ),
    () =>
      chapterHeading("Traits & mutations") +
      section(
        "Creature Traits",
        traits.traitsView().replace("<h2>Creature Traits</h2>", ""),
      ) +
      section("Mutations", traits.mutationsView()),
    () => {
      const { ui, d } = getContext();
      return (
        chapterHeading("Skills & talents") +
        `<p>Printed training stays intact. Add explicit GM changes here, or use Career development for paid Advances.</p><div class="page-tabs" aria-label="Training type">${btn("tab", `Skills (${d.skills.length})`, `data-key="trainingTab" data-value="skills" aria-pressed="${ui.trainingTab === "skills"}"`, ui.trainingTab === "skills" ? "active" : "quiet")}${btn("tab", `Talents (${d.talents.length})`, `data-key="trainingTab" data-value="talents" aria-pressed="${ui.trainingTab === "talents"}"`, ui.trainingTab === "talents" ? "active" : "quiet")}</div>` +
        (ui.trainingTab === "talents"
          ? training.talentsView()
          : training.skillsView())
      );
    },
    equipment.gearView,
    equipment.magicView,
    () =>
      chapterHeading("Career development") +
      `<p>Optional: develop this NPC through a Career with a chosen XP budget.</p>` +
      development.xpView(),
    review.reviewView,
  ];
  return {
    render: () => shell.shell(renderers[getContext().s.step]()),
    booksView: profile.booksView,
  };
}
