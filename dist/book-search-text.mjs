// Reviewed annotations embedded in existing imports. Ordinary book mentions of
// users, creators or editions must remain searchable: never strip them generically.
export function searchBookText(entry) {
  let text = entry.text || "";
  const notes = [],
    book = entry.source?.book;
  const remove = (phrase) => {
    if (text.includes(phrase)) {
      text = text.replace(phrase, "");
      notes.push(phrase.trim());
    }
  };
  const tail = (marker) => {
    const at = text.indexOf(marker);
    if (at >= 0) {
      notes.push(text.slice(at).trim());
      text = text.slice(0, at);
    }
  };
  if (book === "dwarf-guide") {
    remove(
      "Adaptation warning — Approved Fourth Edition adaptation: printed purchase limit and effects retained. No old per-rank Test SL bonus. Situational, combat and campaign effects are references only. ",
    );
    remove("Live bearer/activation effects are deferred.");
    remove(
      "Rune forging is deferred to character management; no item is granted by learning a rune.",
    );
    remove(
      "; retained as a reference, not automatically converted to a Test SL modifier",
    );
    remove(" Printed numeric modifiers are reference only.");
    remove("Reference only; ");
    remove("Reference only, ");
  }
  if (book === "archives-ii")
    remove(
      " Equipment Quality/Flaw editing is deferred in this creator; no option is silently chosen.",
    );
  if (["rough-nights", "high-elf"].includes(book)) tail(" Adaptation warning:");
  if (book === "blood-bramble") {
    tail(" Source discrepancy:");
    tail(" Printed ambiguity:");
    remove(
      " Foraging and ingredient consumption are campaign references, not character-creation grants.",
    );
    remove(
      " Each purchase records one purchase of ingredients, not a defined number of spell uses.",
    );
    remove(" Foraging and consumption are deferred.");
  }
  if (book === "high-elf") {
    remove(
      " The creator applies permanent effects and XP discounts; play-time effects remain descriptions.",
    );
    remove(" Performance and Yenlui remain references.");
    remove(
      " Protection and full penalties remain unresolved; do not infer AP.",
    );
    remove(" Unique items are not ordinary shop purchases.");
    remove(
      "Mage levels 1–4 are supported. Archmage (level five) and entry into the three Elf priest branches are deferred by user decision. ",
    );
    remove(
      " Sacrifices and referenced external creature/ship profiles remain GM references.",
    );
  }
  if (book === "winds-of-magic") {
    remove(", approved for this creator’s shop");
    remove(" Situational magic modifiers remain reference text.");
    remove(
      "; commissioning is deferred by user choice, so this is not a shop purchase",
    );
    remove(", outside this creator");
    remove("; generating and managing that creature are deferred");
  }
  if (
    book === "up-in-arms" &&
    text.startsWith("Printed Fourth Edition reference: ")
  )
    text = text.slice("Printed Fourth Edition reference: ".length);
  return { text: text.trim(), notes };
}
