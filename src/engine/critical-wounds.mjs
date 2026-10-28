// Project the reviewed core tables for both search and the manager's picker.
// Keep one source of wording, roll ranges and identities.
export function criticalChoices(references) {
  return references.flatMap(({ entry }) => {
    if (
      entry?.source?.book !== "core" ||
      !/^(Head|Arm|Body|Leg) Critical Wounds$/.test(entry.name)
    )
      return [];
    const location = entry.name.split(" ")[0];
    return entry.text
      .split("\n")
      .filter((line) => line.startsWith("|"))
      .slice(2)
      .map((line, index) => {
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());
        if (cells.length !== 4 || !cells[1])
          throw Error(
            "Critical Wound references need updating. Reload the app.",
          );
        return {
          id: `${entry.id}:${index}`,
          name: cells[1],
          location,
          text: `Wounds: ${cells[2]}. ${cells[3]}`,
          roll: cells[0],
          source: entry.source,
          referenceId: entry.id,
        };
      });
  });
}
