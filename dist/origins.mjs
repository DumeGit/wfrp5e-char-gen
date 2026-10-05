import { dwarfBackground } from "./dwarf-guide.mjs";
// Regional creation profiles extend a Species without creating a new Species.
export function originProfile(R, s) {
  return (
    (R.origins || []).find(
      (x) => x.id === s.origin && x.species === s.species,
    ) || null
  );
}
export function creationSpecies(R, s) {
  const sp = R.species[s.species],
    o = originProfile(R, s);
  if (!o) return sp;
  const profile = {
    ...sp,
    ...Object.fromEntries(
      ["languages", "skills", "talents", "randomTalents"]
        .filter((k) => k in o)
        .map((k) => [k, o[k]]),
    ),
    source: o.source,
    page: o.page,
    adaptation: o.adaptation,
    contentId: o.contentId,
  };
  if (o.randomTalentAlternative && s.originTalentMode !== "random") {
    profile.talents = [...profile.talents, [o.randomTalentAlternative]];
    profile.randomTalents--;
  }
  return profile;
}
export function creationBackground(R, s) {
  const b = dwarfBackground(R, s, R.background[s.species]),
    o = originProfile(R, s);
  if (b.imperialNames && s.nameStyle !== "traditional") {
    const human = R.background[b.imperialNames];
    return {
      ...b,
      forenames: human.forenames,
      surnames: human.surnames,
      source: human.source,
      nameElements: undefined,
      namePages: undefined,
    };
  }
  return o?.background
    ? {
        ...b,
        ...o.background,
        source: { book: o.source.book, page: o.background.page },
      }
    : b;
}
export function startingTalentReplacement(R, s) {
  const o = originProfile(R, s);
  return o?.optionalTalent && typeof s.originTalentSlot === "string"
    ? { slot: s.originTalentSlot, talent: o.optionalTalent }
    : null;
}
export function careerRefinementTable(R, s, id = s.career) {
  return (
    (R.tables || []).find(
      (x) => x.kind === "career-refinement" && x.career === id,
    ) || null
  );
}
export function regionalCareerChoices(R, s, id = s.career) {
  return [
    ...new Set([
      ...(originProfile(R, s)?.careerChoices?.[id] || []),
      ...(s.careerMode === "choose"
        ? []
        : R.careers
            .filter(
              (c) => c.randomAlternativeFor === id && careerAvailable(R, s, c),
            )
            .map((c) => c.id)),
    ]),
  ];
}
export function careerSpecies(R, s) {
  return originProfile(R, s)?.careerSpecies || s.species;
}
export function careerAvailable(R, s, c) {
  if (!c || (c.requiredOrigins && !c.requiredOrigins.includes(s.origin)))
    return false;
  return (
    !!(
      s.species === "High Elf" &&
      R.books.some((b) => b.id === "high-elf") &&
      originProfile(R, s)?.source.book === "high-elf" &&
      [
        "up-in-arms:career:archer",
        "up-in-arms:career:artillerist",
        "up-in-arms:career:light-cavalry",
        "up-in-arms:career:camp-follower",
      ].includes(c.id)
    ) ||
    !!originProfile(R, s)?.careers?.includes(c.id) ||
    c.species.includes(careerSpecies(R, s)) ||
    !!R.species[s.species]?.mechanics?.careers?.includes(c.id) ||
    !!R.tables?.some(
      (t) =>
        t.kind === "career" &&
        ((t.origin === s.origin && t.origin) ||
          t.origins?.includes(s.origin)) &&
        t.rows.some((r) => r.result === c.id),
    ) ||
    !!originProfile(R, s)?.additionalCareers?.some((x) => x.career === c.id)
  );
}
export function careerCreationIssue(R, s, talents) {
  const grant = originProfile(R, s)?.additionalCareers?.find(
    (x) => x.career === s.career,
  );
  return grant?.requiredTalent && !talents.includes(grant.requiredTalent)
    ? grant.reason
    : "";
}
export function sheetSpecies(R, s) {
  return originProfile(R, s)?.sheetSpecies || s.species;
}
export function sheetClass(R, s, c) {
  const note = originProfile(R, s)?.classNote;
  return c.class + (note ? ` (${note})` : "");
}
