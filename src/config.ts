function readNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function readBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value == null) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on",
  ].includes(value.toLowerCase());
}

export const config = {
  hypixelApiKey: process.env.HYPIXEL_API_KEY ?? "",

  port: readNumber(
    process.env.PORT,
    3000,
  ),

  cacheTtlMs: readNumber(
    process.env.CACHE_TTL_MS,
    300_000,
  ),

  skyCryptBrowserFallback: readBoolean(
    process.env.SKYCRYPT_BROWSER_FALLBACK,
    true,
  ),

  defaultTheme:
    process.env.CARD_THEME ?? "twilight",
};
