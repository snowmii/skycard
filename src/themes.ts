import themesJson from "../data/themes.json" with { type: "json" };

import colorsJson from "../data/colors.json" with { type: "json" };

const MINECRAFT_COLORS = [
  "black",
  "darkBlue",
  "darkGreen",
  "darkAqua",
  "darkRed",
  "darkPurple",
  "gold",
  "gray",
  "darkGray",
  "blue",
  "green",
  "aqua",
  "red",
  "lightPurple",
  "yellow",
  "white",
] as const;

export type MinecraftColor = (typeof MINECRAFT_COLORS)[number];

const VALID_MINECRAFT_COLORS = new Set<string>(MINECRAFT_COLORS);

export interface CardTheme {
  template: {
    backgroundStart: string;
    backgroundMiddle: string;
    backgroundEnd: string;
    railStart: string;
    railEnd: string;
    rankGradientStart: string;
    rankGradientEnd: string;
    goldGradientStart: string;
    goldGradientEnd: string;
    greenGradientStart: string;
    greenGradientEnd: string;
    redGradientStart: string;
    redGradientEnd: string;
    divider: string;
    levelRingTrack: string;
    levelAccent: string;
    levelLabel: string;
    skinPanel: string;
    skinPlaceholder: string;
    label: string;
    networth: string;
    networthMuted: string;
    value: string;
    sectionTitle: string;
    primaryText: string;
    secondaryText: string;
    mutedText: string;
    progressTrack: string;
    goldProgressText: string;
    greenProgressText: string;
    slayerText: string;
    petBackdrop: string;
    petLevel: string;
    footerDivider: string;
    footerText: string;
  };
  minecraft: Record<MinecraftColor, string>;
  emblem: {
    normal: string;
    gold: string;
    diamond: string;
    pink: string;
    purple: string;
  };
}

export interface HypixelRankData {
  rank?: string;
  packageRank?: string;
  newPackageRank?: string;
  monthlyPackageRank?: string;
}

/**
 * Theme data lives in `../data/themes.json` — see `../data/themes.md`
 * for how to edit and add themes.
 */
export const themes = themesJson.themes;

export type ThemeName = keyof typeof themes;

/**
 * The theme whose colors are baked into `template.svg`. Those hex values act
 * as placeholders: `applyThemeToTemplate` swaps each of them for the matching
 * slot color of the requested theme. Change this in `data/themes.json` only
 * if you re-author the template's placeholder colors.
 */
export const templateBase = themesJson.templateBase as ThemeName;

if (!(templateBase in themes)) {
  throw new Error(
    `data/themes.json: "templateBase" refers to unknown theme "${templateBase}"`,
  );
}

/**
 * Maps a placeholder hex color (from the base template theme) to the template
 * slot it stands for. Derived from the data so it can never drift from the
 * theme definitions.
 */
export const TEMPLATE_COLOR_SLOTS: Record<string, keyof CardTheme["template"]> =
  (() => {
    const slots: Record<string, keyof CardTheme["template"]> = {};

    for (const [slot, color] of Object.entries(themes[templateBase].template)) {
      slots[color.toLowerCase()] = slot as keyof CardTheme["template"];
    }

    // Legacy placeholder used by template.svg for primary text.
    slots["#ffffff"] = "primaryText";

    return slots;
  })();

export function resolveTheme(name: string | undefined): {
  name: ThemeName;
  theme: CardTheme;
} {
  const normalized = (name ?? "twilight").toLowerCase();

  if (normalized in themes) {
    const themeName = normalized as ThemeName;

    return {
      name: themeName,
      theme: themes[themeName],
    };
  }

  throw new Error(
    `Unknown theme "${name}". Available themes: ${Object.keys(themes).join(", ")}`,
  );
}

export function applyThemeToTemplate(source: string, theme: CardTheme): string {
  return source.replace(/#[0-9a-f]{6}/gi, (color) => {
    const slot = TEMPLATE_COLOR_SLOTS[color.toLowerCase()];
    return slot ? theme.template[slot] : color;
  });
}

/**
 * SkyBlock level → Minecraft color thresholds and Hypixel rank → color
 * mapping, loaded from `../data/colors.json` (validated at load).
 */
const SKYBLOCK_LEVEL_COLORS: readonly {
  minLevel: number;
  color: MinecraftColor;
}[] = colorsJson.skyblockLevel.map((entry) => {
  if (!VALID_MINECRAFT_COLORS.has(entry.color)) {
    throw new Error(
      `data/colors.json: unknown Minecraft color "${entry.color}"`,
    );
  }

  return {
    minLevel: entry.minLevel,
    color: entry.color as MinecraftColor,
  };
});

const RANK_COLORS: Record<string, MinecraftColor> = Object.fromEntries(
  Object.entries(colorsJson.rankColors).map(([rank, color]) => {
    if (!VALID_MINECRAFT_COLORS.has(color)) {
      throw new Error(
        `data/colors.json: unknown Minecraft color "${color}" for rank "${rank}"`,
      );
    }

    return [rank, color as MinecraftColor] as const;
  }),
);

export function getSkyBlockLevelColor(level: number): MinecraftColor {
  for (const entry of SKYBLOCK_LEVEL_COLORS) {
    if (level >= entry.minLevel) {
      return entry.color;
    }
  }

  return "gray";
}

export function getHypixelRankColor(
  player: HypixelRankData | null,
): MinecraftColor {
  if (!player) return "gray";

  const specialRank =
    player.rank && player.rank !== "NORMAL" ? player.rank : null;

  const rank =
    specialRank ??
    (player.monthlyPackageRank !== "NONE" ? player.monthlyPackageRank : null) ??
    player.newPackageRank ??
    player.packageRank ??
    "NORMAL";

  return RANK_COLORS[rank] ?? "gray";
}
