export type MinecraftColor =
  | "black"
  | "darkBlue"
  | "darkGreen"
  | "darkAqua"
  | "darkRed"
  | "darkPurple"
  | "gold"
  | "gray"
  | "darkGray"
  | "blue"
  | "green"
  | "aqua"
  | "red"
  | "lightPurple"
  | "yellow"
  | "white";

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

interface CatppuccinPalette {
  rosewater: string;
  pink: string;
  mauve: string;
  red: string;
  maroon: string;
  peach: string;
  yellow: string;
  green: string;
  teal: string;
  sky: string;
  sapphire: string;
  blue: string;
  lavender: string;
  text: string;
  subtext0: string;
  subtext1: string;
  overlay0: string;
  overlay1: string;
  overlay2: string;
  surface0: string;
  surface1: string;
  surface2: string;
  base: string;
  mantle: string;
  crust: string;
}

function createCatppuccinTheme(
  palette: CatppuccinPalette,
): CardTheme {
  return {
    template: {
      backgroundStart: palette.base,
      backgroundMiddle: palette.mantle,
      backgroundEnd: palette.crust,
      railStart: palette.surface0,
      railEnd: palette.mantle,
      rankGradientStart: palette.sky,
      rankGradientEnd: palette.mauve,
      goldGradientStart: palette.yellow,
      goldGradientEnd: palette.peach,
      greenGradientStart: palette.green,
      greenGradientEnd: palette.teal,
      redGradientStart: palette.red,
      redGradientEnd: palette.maroon,
      divider: palette.surface1,
      levelRingTrack: palette.surface0,
      levelAccent: palette.red,
      levelLabel: palette.subtext0,
      skinPanel: palette.surface0,
      skinPlaceholder: palette.overlay0,
      label: palette.overlay1,
      networth: palette.green,
      networthMuted: palette.teal,
      value: palette.text,
      sectionTitle: palette.lavender,
      primaryText: palette.text,
      secondaryText: palette.subtext0,
      mutedText: palette.lavender,
      progressTrack: palette.crust,
      goldProgressText: palette.crust,
      greenProgressText: palette.text,
      slayerText: palette.text,
      petBackdrop: palette.crust,
      petLevel: palette.overlay2,
      footerDivider: palette.surface0,
      footerText: palette.overlay1,
    },
    minecraft: {
      black: palette.crust,
      darkBlue: palette.sapphire,
      darkGreen: palette.teal,
      darkAqua: palette.teal,
      darkRed: palette.maroon,
      darkPurple: palette.mauve,
      gold: palette.peach,
      gray: palette.overlay2,
      darkGray: palette.overlay0,
      blue: palette.blue,
      green: palette.green,
      aqua: palette.sky,
      red: palette.red,
      lightPurple: palette.pink,
      yellow: palette.yellow,
      white: palette.text,
    },
    emblem: {
      normal: palette.text,
      gold: palette.yellow,
      diamond: palette.sky,
      pink: palette.pink,
      purple: palette.mauve,
    },
  };
}

export const themes = {
  twilight: {
    template: {
      backgroundStart: "#17142a",
      backgroundMiddle: "#1c1833",
      backgroundEnd: "#241a3a",
      railStart: "#2a2350",
      railEnd: "#141024",
      rankGradientStart: "#5ad1ff",
      rankGradientEnd: "#c98cff",
      goldGradientStart: "#ffb84d",
      goldGradientEnd: "#e59a2e",
      greenGradientStart: "#3ad18a",
      greenGradientEnd: "#2fb877",
      redGradientStart: "#e0554f",
      redGradientEnd: "#b83a35",
      divider: "#2f2a4d",
      levelRingTrack: "#332c56",
      levelAccent: "#ff7a7a",
      levelLabel: "#9a94c2",
      skinPanel: "#2c2450",
      skinPlaceholder: "#4a4477",
      label: "#8a86a8",
      networth: "#8df0bd",
      networthMuted: "#4f7f68",
      value: "#e8e6f2",
      sectionTitle: "#7d76a8",
      primaryText: "#ddd9f0",
      secondaryText: "#8a84b4",
      mutedText: "#a99fe0",
      progressTrack: "#141028",
      goldProgressText: "#4a3200",
      greenProgressText: "#cfe8dd",
      slayerText: "#cfc9e8",
      petBackdrop: "#000000",
      petLevel: "#a9a9a9",
      footerDivider: "#241f42",
      footerText: "#5c5680",
    },
    minecraft: {
      black: "#000000",
      darkBlue: "#0000aa",
      darkGreen: "#00aa00",
      darkAqua: "#00aaaa",
      darkRed: "#aa0000",
      darkPurple: "#aa00aa",
      gold: "#ffaa00",
      gray: "#aaaaaa",
      darkGray: "#555555",
      blue: "#5555ff",
      green: "#55ff55",
      aqua: "#55ffff",
      red: "#ff5555",
      lightPurple: "#ff55ff",
      yellow: "#ffff55",
      white: "#ffffff",
    },
    emblem: {
      normal: "#ffffff",
      gold: "#ffd700",
      diamond: "#00ffff",
      pink: "#ff55ff",
      purple: "#aa00aa",
    },
  },
  midnight: {
    template: {
      backgroundStart: "#071522",
      backgroundMiddle: "#0b1e2d",
      backgroundEnd: "#102b38",
      railStart: "#153948",
      railEnd: "#07141e",
      rankGradientStart: "#48d7ff",
      rankGradientEnd: "#7f8cff",
      goldGradientStart: "#ffc85a",
      goldGradientEnd: "#db8e28",
      greenGradientStart: "#4ee3a3",
      greenGradientEnd: "#27ae78",
      redGradientStart: "#ff6b68",
      redGradientEnd: "#b83d50",
      divider: "#214150",
      levelRingTrack: "#244959",
      levelAccent: "#ff8585",
      levelLabel: "#83a9b8",
      skinPanel: "#123445",
      skinPlaceholder: "#416878",
      label: "#7596a3",
      networth: "#8ef2c5",
      networthMuted: "#477b67",
      value: "#e5f1f5",
      sectionTitle: "#6f96a5",
      primaryText: "#d8e9ef",
      secondaryText: "#789baa",
      mutedText: "#91b9c8",
      progressTrack: "#06141d",
      goldProgressText: "#503600",
      greenProgressText: "#c9eee0",
      slayerText: "#c8e0e8",
      petBackdrop: "#000000",
      petLevel: "#9eb4bc",
      footerDivider: "#183746",
      footerText: "#527887",
    },
    minecraft: {
      black: "#000000",
      darkBlue: "#1e45a8",
      darkGreen: "#169c57",
      darkAqua: "#159ba7",
      darkRed: "#a82c3d",
      darkPurple: "#98349e",
      gold: "#f2a62b",
      gray: "#9eb4bc",
      darkGray: "#526b75",
      blue: "#6688ff",
      green: "#62ed91",
      aqua: "#63e9f2",
      red: "#ff6870",
      lightPurple: "#ed70e8",
      yellow: "#f4e56a",
      white: "#f3fbff",
    },
    emblem: {
      normal: "#f3fbff",
      gold: "#ffc83d",
      diamond: "#53e8ff",
      pink: "#ed70e8",
      purple: "#98349e",
    },
  },
  latte: createCatppuccinTheme({
    rosewater: "#dc8a78",
    pink: "#ea76cb",
    mauve: "#8839ef",
    red: "#d20f39",
    maroon: "#e64553",
    peach: "#fe640b",
    yellow: "#df8e1d",
    green: "#40a02b",
    teal: "#179299",
    sky: "#04a5e5",
    sapphire: "#209fb5",
    blue: "#1e66f5",
    lavender: "#7287fd",
    text: "#4c4f69",
    subtext0: "#6c6f85",
    subtext1: "#5c5f77",
    overlay0: "#9ca0b0",
    overlay1: "#8c8fa1",
    overlay2: "#7c7f93",
    surface0: "#ccd0da",
    surface1: "#bcc0cc",
    surface2: "#acb0be",
    base: "#eff1f5",
    mantle: "#e6e9ef",
    crust: "#dce0e8",
  }),
  frappe: createCatppuccinTheme({
    rosewater: "#f2d5cf",
    pink: "#f4b8e4",
    mauve: "#ca9ee6",
    red: "#e78284",
    maroon: "#ea999c",
    peach: "#ef9f76",
    yellow: "#e5c890",
    green: "#a6d189",
    teal: "#81c8be",
    sky: "#99d1db",
    sapphire: "#85c1dc",
    blue: "#8caaee",
    lavender: "#babbf1",
    text: "#c6d0f5",
    subtext0: "#a5adce",
    subtext1: "#b5bfe2",
    overlay0: "#737994",
    overlay1: "#838ba7",
    overlay2: "#949cbb",
    surface0: "#414559",
    surface1: "#51576d",
    surface2: "#626880",
    base: "#303446",
    mantle: "#292c3c",
    crust: "#232634",
  }),
  macchiato: createCatppuccinTheme({
    rosewater: "#f4dbd6",
    pink: "#f5bde6",
    mauve: "#c6a0f6",
    red: "#ed8796",
    maroon: "#ee99a0",
    peach: "#f5a97f",
    yellow: "#eed49f",
    green: "#a6da95",
    teal: "#8bd5ca",
    sky: "#91d7e3",
    sapphire: "#7dc4e4",
    blue: "#8aadf4",
    lavender: "#b7bdf8",
    text: "#cad3f5",
    subtext0: "#a5adcb",
    subtext1: "#b8c0e0",
    overlay0: "#6e738d",
    overlay1: "#8087a2",
    overlay2: "#939ab7",
    surface0: "#363a4f",
    surface1: "#494d64",
    surface2: "#5b6078",
    base: "#24273a",
    mantle: "#1e2030",
    crust: "#181926",
  }),
  mocha: createCatppuccinTheme({
    rosewater: "#f5e0dc",
    pink: "#f5c2e7",
    mauve: "#cba6f7",
    red: "#f38ba8",
    maroon: "#eba0ac",
    peach: "#fab387",
    yellow: "#f9e2af",
    green: "#a6e3a1",
    teal: "#94e2d5",
    sky: "#89dceb",
    sapphire: "#74c7ec",
    blue: "#89b4fa",
    lavender: "#b4befe",
    text: "#cdd6f4",
    subtext0: "#a6adc8",
    subtext1: "#bac2de",
    overlay0: "#6c7086",
    overlay1: "#7f849c",
    overlay2: "#9399b2",
    surface0: "#313244",
    surface1: "#45475a",
    surface2: "#585b70",
    base: "#1e1e2e",
    mantle: "#181825",
    crust: "#11111b",
  }),
} as const satisfies Record<string, CardTheme>;

export type ThemeName = keyof typeof themes;

const TEMPLATE_COLOR_SLOTS:
  Record<string, keyof CardTheme["template"]> = {
    "#17142a": "backgroundStart",
    "#1c1833": "backgroundMiddle",
    "#241a3a": "backgroundEnd",
    "#2a2350": "railStart",
    "#141024": "railEnd",
    "#5ad1ff": "rankGradientStart",
    "#c98cff": "rankGradientEnd",
    "#ffb84d": "goldGradientStart",
    "#e59a2e": "goldGradientEnd",
    "#3ad18a": "greenGradientStart",
    "#2fb877": "greenGradientEnd",
    "#e0554f": "redGradientStart",
    "#b83a35": "redGradientEnd",
    "#2f2a4d": "divider",
    "#332c56": "levelRingTrack",
    "#ff7a7a": "levelAccent",
    "#9a94c2": "levelLabel",
    "#2c2450": "skinPanel",
    "#4a4477": "skinPlaceholder",
    "#8a86a8": "label",
    "#8df0bd": "networth",
    "#4f7f68": "networthMuted",
    "#e8e6f2": "value",
    "#7d76a8": "sectionTitle",
    "#ddd9f0": "primaryText",
    "#8a84b4": "secondaryText",
    "#a99fe0": "mutedText",
    "#141028": "progressTrack",
    "#4a3200": "goldProgressText",
    "#cfe8dd": "greenProgressText",
    "#cfc9e8": "slayerText",
    "#000000": "petBackdrop",
    "#a9a9a9": "petLevel",
    "#241f42": "footerDivider",
    "#5c5680": "footerText",
    "#ffffff": "primaryText",
  };

export function resolveTheme(
  name: string | undefined,
): { name: ThemeName; theme: CardTheme } {
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

export function applyThemeToTemplate(
  source: string,
  theme: CardTheme,
): string {
  return source.replace(
    /#[0-9a-f]{6}/gi,
    (color) => {
      const slot =
        TEMPLATE_COLOR_SLOTS[color.toLowerCase()];
      return slot ? theme.template[slot] : color;
    },
  );
}

export function getSkyBlockLevelColor(
  level: number,
): MinecraftColor {
  if (level >= 480) return "darkRed";
  if (level >= 440) return "red";
  if (level >= 400) return "gold";
  if (level >= 360) return "darkPurple";
  if (level >= 320) return "lightPurple";
  if (level >= 280) return "blue";
  if (level >= 240) return "darkAqua";
  if (level >= 200) return "aqua";
  if (level >= 160) return "darkGreen";
  if (level >= 120) return "green";
  if (level >= 80) return "yellow";
  if (level >= 40) return "white";
  return "gray";
}

export function getHypixelRankColor(
  player: HypixelRankData | null,
): MinecraftColor {
  if (!player) return "gray";

  const specialRank =
    player.rank && player.rank !== "NORMAL"
      ? player.rank
      : null;

  const rank =
    specialRank ??
    (
      player.monthlyPackageRank !== "NONE"
        ? player.monthlyPackageRank
        : null
    ) ??
    player.newPackageRank ??
    player.packageRank ??
    "NORMAL";

  switch (rank) {
    case "ADMIN":
    case "YOUTUBER":
      return "red";
    case "GAME_MASTER":
    case "MODERATOR":
      return "darkGreen";
    case "HELPER":
      return "blue";
    case "BUILD_TEAM":
      return "darkAqua";
    case "SUPERSTAR":
      return "gold";
    case "MVP_PLUS":
    case "MVP":
      return "aqua";
    case "VIP_PLUS":
    case "VIP":
      return "green";
    default:
      return "gray";
  }
}

export interface HypixelRankData {
  rank?: string;
  packageRank?: string;
  newPackageRank?: string;
  monthlyPackageRank?: string;
}
