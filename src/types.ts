export type SkillKey =
  | "combat"
  | "mining"
  | "farming"
  | "fishing"
  | "foraging";

export type SlayerKey =
  | "revenant"
  | "tarantula"
  | "sven"
  | "voidgloom"
  | "inferno"
  | "riftstalker";

export type EmblemColor =
  | "normal"
  | "gold"
  | "diamond"
  | "pink"
  | "purple";

export interface PlayerEmblem {
  symbol: string;
  color: EmblemColor;
}

  export interface SkillCardData {
    key: SkillKey;

    level: number;
    maxLevel: number;
    progress: number;

    totalXp: number;

    /**
     * XP earned since reaching the current level.
     *
     * For a maxed skill, this is the overflow XP.
     */
    currentLevelXp: number;

    /**
     * XP required to advance from the current level to the next.
     * Null when the skill is maxed.
     */
    nextLevelXp: number | null;

    overflowXp: number;
    isMaxed: boolean;
  }

export interface SlayerCardData {
  key: SlayerKey;

  level: number;
  maxLevel: number;
  progress: number;
  xp: number;
}

export interface PetCardData {
  level: number;
  name: string;
  type: string;
  tier: string;
  skin: string | null;
  headDataUri: string | null;
}

export interface SkyBlockCardData {
  username: string;
  uuid: string;
  profileName: string;
  profileUrl: string;

  generatedAt: Date;

  rankColor:
    import("./themes.js").MinecraftColor;

  skyblockLevel: number;
  skyblockLevelProgress: number;

  networth: number | null;
  playtimeHours: number | null;

  purse: number;
  bank: number;

  skills: SkillCardData[];
  slayers: SlayerCardData[];

  activePet: PetCardData | null;
  emblem: PlayerEmblem | null;

  skinDataUri: string | null;
}
