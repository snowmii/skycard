import path from "node:path";
import { writeFile } from "node:fs/promises";

import {
  fileURLToPath,
} from "node:url";

import {
  HypixelClient,
  selectProfile,
} from "./api/hypixel.js";

import {
  resolveMinecraftProfile,
} from "./api/minecraft.js";

import {
  fetchSkinDataUri,
} from "./api/skin.js";

import {
  fetchPetHeadDataUri,
} from "./api/pet.js";

import {
  fetchSkyCryptSummary,
} from "./api/skycrypt.js";

import {
  config,
} from "./config.js";

import {
  loadEmblem,
} from "./emblems.js";

import {
  renderSkyBlockCard,
} from "./render/svg.js";

import {
  getHypixelRankColor,
  resolveTheme,
} from "./themes.js";

import {
  buildSkills,
  buildSlayers,
  getMember,
  readActivePet,
  readPurse,
  readBank,
  readPlaytimeHours,
  readSelectedEmblemId,
  readSkyBlockLevel,
} from "./skyblock/normalize.js";

import type {
  SkyBlockCardData,
} from "./types.js";

import {
  TtlCache,
} from "./util/cache.js";

const currentDirectory =
  path.dirname(
    fileURLToPath(import.meta.url),
  );

const templatePath =
  path.resolve(
    currentDirectory,
    "../template.svg",
  );

const emblemMapPath =
  path.resolve(
    currentDirectory,
    "../src/emblems.json",
  );

const cardCache =
  new TtlCache<SkyBlockCardData>(
    config.cacheTtlMs,
  );

export async function generateCard(
  username: string,
  profileName?: string,
  themeName: string = config.defaultTheme,
): Promise<string> {
  const resolvedTheme =
    resolveTheme(themeName);

  const cacheKey =
    `${username.toLowerCase()}:` +
    (
      profileName?.toLowerCase() ??
      "selected"
    );

  const cardData =
    await cardCache.getOrCreate(
    cacheKey,
    async () => {
      const minecraft =
        await resolveMinecraftProfile(
          username,
        );

      const hypixel =
        new HypixelClient(
          config.hypixelApiKey,
        );

      const [
        profiles,
        skillResources,
        player,
      ] = await Promise.all([
        hypixel.getProfiles(
          minecraft.uuid,
        ),

        hypixel.getSkillResources(),

        hypixel.getPlayer(
          minecraft.uuid,
        ),
      ]);

      const profile =
        selectProfile(
          profiles,
          profileName,
        );

      const member =
        getMember(
          profile,
          minecraft.uuid,
        );

      const activePet =
        readActivePet(member);

      const [
        skyCrypt,
        skinDataUri,
        petHeadDataUri,
      ] = await Promise.all([
        fetchSkyCryptSummary(
          minecraft.username,
          profile.cute_name,
          config.skyCryptBrowserFallback,
        ),

        fetchSkinDataUri(
          minecraft.uuid,
          minecraft.username,
        ),

        activePet
          ? fetchPetHeadDataUri(activePet)
          : Promise.resolve(null),
      ]);

      const level =
        readSkyBlockLevel(member);

      const emblem =
        await loadEmblem(
          emblemMapPath,
          readSelectedEmblemId(member),
        );

      const cardData:
        SkyBlockCardData = {
        username:
          minecraft.username,

        uuid:
          minecraft.uuid,

        profileName:
          profile.cute_name,

        profileUrl:
          "cupcake.shiiyu.moe/stats/" +
          `${minecraft.username}/` +
          profile.cute_name,

        generatedAt:
          new Date(),

        rankColor:
          getHypixelRankColor(player),

        skyblockLevel:
          level.level,

        skyblockLevelProgress:
          level.progress,

        networth:
          skyCrypt.networth,

        playtimeHours:
          skyCrypt.playtimeHours ??
          readPlaytimeHours(member),

        purse:
          readPurse(member),

        bank:
          readBank(member),

        skills:
          buildSkills(
            member,
            skillResources,
          ),

        slayers:
          buildSlayers(member),

        activePet:
          activePet
            ? {
                ...activePet,
                headDataUri:
                  petHeadDataUri,
              }
            : null,

        emblem,

        skinDataUri,
      };

      return cardData;
    },
  );

  return renderSkyBlockCard(
    cardData,
    templatePath,
    resolvedTheme.theme,
  );
}
