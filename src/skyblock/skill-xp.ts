import skillData from "../../data/skills.json" with { type: "json" };

/**
 * Skill XP data lives in `../../data/skills.json`. `SKILL_CUMULATIVE_XP` is
 * derived from the per-level costs so the two can never drift apart.
 */
export const SKILL_XP_REQUIRED_PER_LEVEL: readonly number[] =
  skillData.xpRequiredPerLevel;

export const SKILL_CUMULATIVE_XP: readonly number[] = (() => {
  const cumulative: number[] = [];

  let sum = 0;

  for (const required of SKILL_XP_REQUIRED_PER_LEVEL) {
    sum += required;
    cumulative.push(sum);
  }

  return cumulative;
})();
