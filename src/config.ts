function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  hypixelApiKey: process.env.HYPIXEL_API_KEY ?? "",

  port: readNumber(process.env.PORT, 3000),

  cacheTtlMs: readNumber(process.env.CACHE_TTL_MS, 300_000),

  defaultTheme: process.env.CARD_THEME ?? "twilight",
};
