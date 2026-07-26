import {
  ProfileNetworthCalculator,
} from "skyhelper-networth";

import type {
  HypixelProfile,
} from "./hypixel.js";

export async function calculateNetworth(
  member: Record<string, unknown>,
  profile: HypixelProfile,
): Promise<number | null> {
  try {
    const calculator =
      new ProfileNetworthCalculator(
        member,
        undefined,
        profile.banking?.balance ?? 0,
      );

    const result =
      await calculator.getNetworth({
        onlyNetworth: true,
      });

    return typeof result.networth === "number" &&
      Number.isFinite(result.networth)
      ? result.networth
      : null;
  } catch {
    return null;
  }
}
