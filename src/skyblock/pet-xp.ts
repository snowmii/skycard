import petData from "../../data/pets.json" with { type: "json" };

/**
 * Pet leveling data lives in `../../data/pets.json` — per-level XP costs,
 * rarity offsets and the special level-200 extension for dragon pets.
 */
const LEVEL_XP: readonly number[] = petData.levelXp;

const RARITY_OFFSET: Record<string, number> = petData.rarityOffset;

const LEVEL_200_PETS = new Set(petData.level200.pets);

const { head, perLevel, levels } = petData.level200.extensionXp;

const LEVEL_200_EXTENSION_XP: readonly number[] = [
  ...head,
  ...Array<number>(levels).fill(perLevel),
];

export function calculatePetLevel(
  type: string,
  rarity: string,
  experience: number,
): number {
  if (type === "FRACTURED_MONTEZUMA_SOUL" || type === "MONTEZUMA") {
    return 100;
  }

  const maxLevel = LEVEL_200_PETS.has(type) ? 200 : 100;

  const rarityOffset = type === "BINGO" ? 0 : (RARITY_OFFSET[rarity] ?? 0);

  const requirements =
    maxLevel === 200 ? [...LEVEL_XP, ...LEVEL_200_EXTENSION_XP] : LEVEL_XP;

  let remainingExperience = Math.max(0, experience);
  let level = 1;

  for (let index = rarityOffset; level < maxLevel; index += 1) {
    const requirement = requirements[index];

    if (requirement == null || remainingExperience < requirement) {
      break;
    }

    remainingExperience -= requirement;
    level += 1;
  }

  return level;
}
