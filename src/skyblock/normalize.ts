import type {
  HypixelProfile,
  HypixelSkillResource,
} from "../api/hypixel.js";

import {
  SKILL_CUMULATIVE_XP,
  SKILL_XP_REQUIRED_PER_LEVEL,
} from "./skill-xp.js";

import type {
  PetCardData,
  SkillCardData,
  SkillKey,
  SlayerCardData,
  SlayerKey,
} from "../types.js";

import {
  clamp01,
  titleCaseIdentifier,
} from "../util/format.js";

import {
  calculatePetLevel,
} from "./pet-xp.js";

const SKILL_KEYS: SkillKey[] = [
  "combat",
  "mining",
  "farming",
  "fishing",
  "foraging",
];

interface SlayerDefinition {
  key: SlayerKey;
  apiKey: string;
  maxLevel: number;
}

const SLAYERS: SlayerDefinition[] = [
  {
    key: "revenant",
    apiKey: "zombie",
    maxLevel: 9,
  },
  {
    key: "tarantula",
    apiKey: "spider",
    maxLevel: 9,
  },
  {
    key: "sven",
    apiKey: "wolf",
    maxLevel: 9,
  },
  {
    key: "voidgloom",
    apiKey: "enderman",
    maxLevel: 9,
  },
  {
    key: "inferno",
    apiKey: "blaze",
    maxLevel: 9,
  },
  {
    key: "riftstalker",
    apiKey: "vampire",
    maxLevel: 5,
  },
];

const SLAYER_XP_THRESHOLDS = [
  0,
  5,
  15,
  200,
  1_000,
  5_000,
  20_000,
  100_000,
  400_000,
  1_000_000,
];

export function getMember(
  profile: HypixelProfile,
  uuid: string,
): Record<string, unknown> {
  const normalizedUuid = uuid
    .replaceAll("-", "")
    .toLowerCase();

  for (
    const [memberUuid, member]
    of Object.entries(profile.members)
  ) {
    const normalizedMemberUuid =
      memberUuid
        .replaceAll("-", "")
        .toLowerCase();

    if (
      normalizedMemberUuid ===
      normalizedUuid
    ) {
      return member;
    }
  }

  throw new Error(
    "The selected profile does not contain this player.",
  );
}

export function readPurse(
  member: Record<string, unknown>,
): number {
  return (
    readNumber(
      member,
      [
        "currencies",
        "coin_purse",
      ],
    ) ??
    readNumber(
      member,
      ["coin_purse"],
    ) ??
    0
  );
}

export function readBank(
  member: Record<string, unknown>,
): number {
  return (
    readNumber(
      member,
      [
        "profile",
        "bank_account",
      ],
    ) ??
    0
  );
}

export function readSkyBlockLevel(
  member: Record<string, unknown>,
): {
  level: number;
  progress: number;
} {
  const experience =
    readNumber(
      member,
      [
        "leveling",
        "experience",
      ],
    ) ??
    readNumber(
      member,
      [
        "leveling",
        "experience_total",
      ],
    ) ??
    0;

  const exactLevel =
    experience / 100;

  const level =
    Math.floor(exactLevel);

  return {
    level,
    progress:
      clamp01(exactLevel - level),
  };
}

export function readProfileAgeDays(
  member: Record<string, unknown>,
  now: number = Date.now(),
): number | null {
  const firstJoin =
    readNumber(
      member,
      [
        "profile",
        "first_join",
      ],
    );

  if (
    firstJoin == null ||
    firstJoin > now
  ) {
    return null;
  }

  return (now - firstJoin) / 86_400_000;
}

export function readSelectedEmblemId(
  member: Record<string, unknown>,
): string | null {
  const leveling =
    member.leveling;

  if (
    leveling == null ||
    typeof leveling !== "object"
  ) {
    return null;
  }

  const id =
    (
      leveling as Record<
        string,
        unknown
      >
    ).selected_symbol;

  return typeof id === "string"
    ? id
    : null;
}

export function buildSkills(
  member: Record<string, unknown>,
  resources: Record<
    string,
    HypixelSkillResource
  >,
): SkillCardData[] {
  return SKILL_KEYS.map(
    (key) => {
      const uppercase =
        key.toUpperCase();

      const resource =
        resources[uppercase] ??
        resources[`SKILL_${uppercase}`] ??
        resources[key];

      const totalXp =
        readNumber(
          member,
          [
            "player_data",
            "experience",
            `SKILL_${uppercase}`,
          ],
        ) ??
        readNumber(
          member,
          [
            `experience_skill_${key}`,
          ],
        ) ??
        0;

      return calculateSkill(
        key,
        totalXp,
        resource,
      );
    },
  );
}

function calculateSkill(
  key: SkillKey,
  totalXp: number,
  resource:
    | HypixelSkillResource
    | undefined,
): SkillCardData {
  const maxLevel = Math.min(
    resource?.maxLevel ??
      getDefaultSkillCap(key),
    60,
  );

  const safeTotalXp = Math.max(
    0,
    totalXp,
  );

  const level = calculateLevelFromTotalXp(
    safeTotalXp,
    maxLevel,
  );

  const isMaxed =
    level >= maxLevel;

  if (isMaxed) {
    const maxLevelCumulativeXp =
      SKILL_CUMULATIVE_XP[maxLevel] ??
      0;

    const overflowXp = Math.max(
      0,
      safeTotalXp -
        maxLevelCumulativeXp,
    );

    return {
      key,
      level: maxLevel,
      maxLevel,
      progress: 1,

      totalXp: safeTotalXp,
      currentLevelXp: overflowXp,
      nextLevelXp: null,

      overflowXp,
      isMaxed: true,
    };
  }

  const cumulativeXpAtCurrentLevel =
    SKILL_CUMULATIVE_XP[level] ??
    0;

  const xpRequiredForNextLevel =
    SKILL_XP_REQUIRED_PER_LEVEL[
      level + 1
    ] ?? 0;

  const currentLevelXp = Math.max(
    0,
    safeTotalXp -
      cumulativeXpAtCurrentLevel,
  );

  const progress =
    xpRequiredForNextLevel > 0
      ? clamp01(
          currentLevelXp /
            xpRequiredForNextLevel,
        )
      : 0;

  return {
    key,
    level,
    maxLevel,
    progress,

    totalXp: safeTotalXp,
    currentLevelXp,
    nextLevelXp:
      xpRequiredForNextLevel,

    overflowXp: 0,
    isMaxed: false,
  };
}

function calculateLevelFromTotalXp(
  totalXp: number,
  maxLevel: number,
): number {
  for (
    let level = maxLevel;
    level >= 0;
    level -= 1
  ) {
    const cumulativeXp =
      SKILL_CUMULATIVE_XP[level] ??
      Number.POSITIVE_INFINITY;

    if (totalXp >= cumulativeXp) {
      return level;
    }
  }

  return 0;
}

export function buildSlayers(
  member: Record<string, unknown>,
): SlayerCardData[] {
  return SLAYERS.map(
    ({
      key,
      apiKey,
      maxLevel,
    }) => {
      const xp =
        readNumber(
          member,
          [
            "slayer",
            "slayer_bosses",
            apiKey,
            "xp",
          ],
        ) ??
        readNumber(
          member,
          [
            "slayer_bosses",
            apiKey,
            "xp",
          ],
        ) ??
        0;

      const calculated =
        calculateSlayerLevel(
          xp,
          maxLevel,
        );

      return {
        key,
        maxLevel,
        xp,

        level: calculated.level,
        progress:
          calculated.progress,
      };
    },
  );
}

function calculateSlayerLevel(
  xp: number,
  maxLevel: number,
): {
  level: number;
  progress: number;
} {
  let level = 0;

  for (
    let candidate = 1;
    candidate <= maxLevel;
    candidate += 1
  ) {
    const threshold =
      SLAYER_XP_THRESHOLDS[
        candidate
      ] ??
      Number.POSITIVE_INFINITY;

    if (xp >= threshold) {
      level = candidate;
      continue;
    }

    const previousThreshold =
      SLAYER_XP_THRESHOLDS[
        candidate - 1
      ] ?? 0;

    return {
      level,

      progress: clamp01(
        (
          xp -
          previousThreshold
        ) /
        (
          threshold -
          previousThreshold
        ),
      ),
    };
  }

  return {
    level: maxLevel,
    progress: 1,
  };
}

export function readActivePet(
  member: Record<string, unknown>,
): PetCardData | null {
  const pets =
    readArray(
      member,
      [
        "pets_data",
        "pets",
      ],
    ) ??
    readArray(
      member,
      ["pets"],
    ) ??
    [];

  const active =
    pets.find(
      (candidate) =>
        readObjectBoolean(
          candidate,
          "active",
        ),
    );

  if (
    !active ||
    typeof active !== "object"
  ) {
    return null;
  }

  const pet =
    active as Record<string, unknown>;

  const type =
    typeof pet.type === "string"
      ? pet.type
      : "UNKNOWN_PET";

  const exp =
    typeof pet.exp === "number"
      ? pet.exp
      : 0;

  const tier =
    typeof pet.tier === "string"
      ? pet.tier
      : "COMMON";

  const level =
    typeof pet.level === "number"
      ? Math.floor(pet.level)
      : calculatePetLevel(
          type,
          tier,
          exp,
        );

  return {
    level,
    name:
      titleCaseIdentifier(type),
    type,
    tier,
    skin:
      typeof pet.skin === "string"
        ? pet.skin
        : null,
    headDataUri: null,
  };
}

function getDefaultSkillCap(
  key: SkillKey,
): number {
  if (key === "fishing") {
    return 50;
  }

  return 60;
}

function readNumber(
  source: Record<string, unknown>,
  path: string[],
): number | null {
  let current: unknown = source;

  for (const segment of path) {
    if (
      current == null ||
      typeof current !== "object"
    ) {
      return null;
    }

    current =
      (
        current as Record<
          string,
          unknown
        >
      )[segment];
  }

  return (
    typeof current === "number" &&
    Number.isFinite(current)
  )
    ? current
    : null;
}

function readArray(
  source: Record<string, unknown>,
  path: string[],
): unknown[] | null {
  let current: unknown = source;

  for (const segment of path) {
    if (
      current == null ||
      typeof current !== "object"
    ) {
      return null;
    }

    current =
      (
        current as Record<
          string,
          unknown
        >
      )[segment];
  }

  return Array.isArray(current)
    ? current
    : null;
}

function readObjectBoolean(
  value: unknown,
  key: string,
): boolean {
  if (
    value == null ||
    typeof value !== "object"
  ) {
    return false;
  }

  return Boolean(
    (
      value as Record<
        string,
        unknown
      >
    )[key],
  );
}
