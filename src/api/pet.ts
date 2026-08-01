import type { PetCardData } from "../types.js";

import petData from "../../data/pets.json" with { type: "json" };

import { TtlCache } from "../util/cache.js";

const cache = new TtlCache<string | null>(
  Number(process.env.CACHE_TTL_MS) || 300_000,
);

/** Rarity → NEU item id index, from `../../data/pets.json`. */
const PET_RARITY_INDEX: Record<string, number> = petData.rarityIndex;

export function fetchPetHeadDataUri(pet: PetCardData): Promise<string | null> {
  const itemId = pet.skin ?? `${pet.type};${PET_RARITY_INDEX[pet.tier] ?? 0}`;

  return cache.getOrCreate(itemId, () => fetchPetHead(itemId));
}

async function fetchPetHead(itemId: string): Promise<string | null> {
  try {
    const itemResponse = await fetch(
      "https://raw.githubusercontent.com/" +
        "NotEnoughUpdates/" +
        "NotEnoughUpdates-REPO/master/items/" +
        `${encodeURIComponent(itemId)}.json`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "skyblock-card-generator/0.1",
        },
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!itemResponse.ok) {
      return null;
    }

    const item = (await itemResponse.json()) as {
      nbttag?: string;
    };

    const encodedTexture = item.nbttag?.match(/Value:"([^"]+)"/)?.[1];

    if (!encodedTexture) {
      return null;
    }

    const textureData = JSON.parse(
      Buffer.from(encodedTexture, "base64").toString("utf8"),
    ) as {
      textures?: {
        SKIN?: {
          url?: string;
        };
      };
    };

    const textureUrl = textureData.textures?.SKIN?.url;

    const textureHash = textureUrl?.match(/\/texture\/([a-f0-9]+)$/i)?.[1];

    if (!textureHash) {
      return null;
    }

    const headResponse = await fetch(
      "https://mc-heads.net/head/" + `${textureHash}/64`,
      {
        headers: {
          Accept: "image/png",
          "User-Agent": "skyblock-card-generator/0.1",
        },
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!headResponse.ok) {
      return null;
    }

    const mime = headResponse.headers.get("content-type") ?? "image/png";

    if (!mime.startsWith("image/")) {
      return null;
    }

    const bytes = Buffer.from(await headResponse.arrayBuffer());

    return bytes.length === 0
      ? null
      : `data:${mime};base64,` + bytes.toString("base64");
  } catch {
    return null;
  }
}
