import emblemsJson from "../data/emblems.json" with { type: "json" };

import type { EmblemColor, PlayerEmblem } from "./types.js";

const EMBLEM_COLORS = new Set<EmblemColor>([
  "normal",
  "gold",
  "diamond",
  "pink",
  "purple",
]);

/**
 * Emblem symbols live in `../data/emblems.json` — a plain map of
 * Hypixel profile emblem ids to `{ symbol, color }` entries.
 */
const EMBLEM_MAP = emblemsJson as Record<
  string,
  { symbol: string; color: string }
>;

export function loadEmblem(id: string | null): PlayerEmblem | null {
  if (!id) {
    return null;
  }

  const value = EMBLEM_MAP[id];

  if (!value) {
    return null;
  }

  if (
    typeof value.symbol !== "string" ||
    !EMBLEM_COLORS.has(value.color as EmblemColor)
  ) {
    throw new Error(`Invalid emblem map entry: ${id}`);
  }

  return {
    symbol: value.symbol,
    color: value.color as EmblemColor,
  };
}
