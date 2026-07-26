import {
  readFile,
} from "node:fs/promises";

import type {
  EmblemColor,
  PlayerEmblem,
} from "./types.js";

type EmblemMap =
  Record<string, PlayerEmblem>;

const EMBLEM_COLORS =
  new Set<EmblemColor>([
    "normal",
    "gold",
    "diamond",
    "pink",
    "purple",
  ]);

export async function loadEmblem(
  mapPath: string,
  id: string | null,
): Promise<PlayerEmblem | null> {
  if (!id) {
    return null;
  }

  const source = await readFile(
    mapPath,
    "utf8",
  );

  const parsed =
    JSON.parse(source) as unknown;

  if (
    parsed == null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "The emblem map must be a JSON object.",
    );
  }

  const value =
    (parsed as EmblemMap)[id];

  if (!value) {
    return null;
  }

  if (
    typeof value.symbol !== "string" ||
    !EMBLEM_COLORS.has(value.color)
  ) {
    throw new Error(
      `Invalid emblem map entry: ${id}`,
    );
  }

  return value;
}
