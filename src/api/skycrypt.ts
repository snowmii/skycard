import {
  chromium,
  type Page,
} from "playwright";

import { TtlCache } from "../util/cache.js";

export interface SkyCryptSummary {
  networth: number | null;
  playtimeHours: number | null;
}

const cache =
  new TtlCache<SkyCryptSummary>(
    Number(
      process.env.CACHE_TTL_MS,
    ) || 300_000,
  );

export function fetchSkyCryptSummary(
  username: string,
  profileName: string,
  allowBrowserFallback: boolean,
): Promise<SkyCryptSummary> {
  const key =
    `${username.toLowerCase()}:` +
    profileName.toLowerCase();

  return cache.getOrCreate(
    key,
    async () => {
      const url =
        "https://sky.shiiyu.moe/stats/" +
        `${encodeURIComponent(username)}/` +
        encodeURIComponent(profileName);

      const direct =
        await fetchDirectly(url);

      if (
        direct.networth != null ||
        direct.playtimeHours != null
      ) {
        return direct;
      }

      if (!allowBrowserFallback) {
        return direct;
      }

      return fetchWithBrowser(url);
    },
  );
}

async function fetchDirectly(
  url: string,
): Promise<SkyCryptSummary> {
  try {
    const response = await fetch(url, {
      redirect: "follow",

      headers: {
        Accept:
          "text/html,application/xhtml+xml",

        "User-Agent":
          "Mozilla/5.0 " +
          "(Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 " +
          "Chrome/131 Safari/537.36",
      },

      signal:
        AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return emptySummary();
    }

    const html = await response.text();

    return parseSkyCryptText(html);
  } catch {
    return emptySummary();
  }
}

async function fetchWithBrowser(
  url: string,
): Promise<SkyCryptSummary> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 " +
        "(Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 " +
        "Chrome/131 Safari/537.36",
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 35_000,
    });

    await waitForSkyCrypt(page);

    const bodyText =
      await page.locator("body").innerText();

    return parseSkyCryptText(bodyText);
  } catch {
    return emptySummary();
  } finally {
    await browser.close();
  }
}

async function waitForSkyCrypt(
  page: Page,
): Promise<void> {
  try {
    await page.waitForFunction(
      () => {
        const text =
          document.body?.innerText ?? "";

        return /net\s*worth|networth|playtime/i
          .test(text);
      },
      undefined,
      {
        timeout: 15_000,
      },
    );
  } catch {
    // Parsing still runs on whatever loaded.
  }
}

export function parseSkyCryptText(
  text: string,
): SkyCryptSummary {
  const normalized = text
    .replaceAll("\u00a0", " ")
    .replace(/\s+/g, " ")
    .trim();

  const networth = findNumber(
    text,
    [
      /["\\]*networth["\\]*\s*:\s*\{[^{}]{0,200}?["\\]*normal["\\]*\s*:\s*([\d.]+)/i,
      /(?:estimated\s+)?net\s*worth\s*[:\-]?\s*\$?([\d,.]+)\s*([kmbtq]?)/i,
      /networth\s*[:\-]?\s*\$?([\d,.]+)\s*([kmbtq]?)/i,
    ],
  );

  const playtimeHours = findNumber(
    normalized,
    [
      /playtime\s*[:\-]?\s*([\d,.]+)\s*(?:hours?|hrs?|h)\b/i,
    ],
  );

  return {
    networth,
    playtimeHours,
  };
}

function findNumber(
  text: string,
  patterns: RegExp[],
): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match?.[1]) {
      continue;
    }

    const base = Number(
      match[1].replaceAll(",", ""),
    );

    if (!Number.isFinite(base)) {
      continue;
    }

    const suffix =
      match[2]?.toLowerCase();

    const multiplier =
      suffix === "k" ? 1e3 :
      suffix === "m" ? 1e6 :
      suffix === "b" ? 1e9 :
      suffix === "t" ? 1e12 :
      suffix === "q" ? 1e15 :
      1;

    return base * multiplier;
  }

  return null;
}

function emptySummary(): SkyCryptSummary {
  return {
    networth: null,
    playtimeHours: null,
  };
}
