import "dotenv/config";

import path from "node:path";
import { access, mkdir, writeFile } from "node:fs/promises";

import sharp from "sharp";

import { generateCard } from "../generator.js";
import { themes } from "../themes.js";

/**
 * The card themes blended into the showcase, lightest first so the
 * diagonal slashes read as a light → dark sweep.
 */
const SHOWCASE_THEMES = ["latte", "frappe", "macchiato", "mocha"] as const;

type RGB = readonly [number, number, number];

const SETTINGS = {
  /**
   * Positive values make the separators lean like:
   *
   *     /
   *    /
   *   /
   *
   * This value is the horizontal shift across the full image height,
   * expressed as a fraction of the image width.
   */
  diagonalShift: 0.18,

  /**
   * Width of the crossfade around each slash.
   * Expressed as a fraction of the image width.
   */
  feather: 0.003,

  /**
   * Draw a narrow luminous edge over each transition.
   */
  glow: false,
  glowWidth: 0.004,
  glowStrength: 0.42,

  /**
   * Slash colors between images 1–2, 2–3 and 3–4.
   */
  glowColors: ["#8ea2ff", "#e8a0ff", "#a9c6ff"] as const,

  outputScale: 1,
  svgDensity: 144,

  /**
   * Where the three separators appear across the normalized canvas.
   */
  splits: [0.25, 0.5, 0.75] as const,
};

/**
 * Path of the generated SVG card for a themed card set, matching the naming
 * used by `npm run generate -- <username> --theme all`.
 */
function cardPath(dir: string, username: string, themeName: string): string {
  return path.join(dir, `${username}-${themeName}.svg`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));

  return t * t * (3 - 2 * t);
}

function parseHexColor(hex: string): RGB {
  const normalized = hex.replace(/^#/, "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid color: ${hex}`);
  }

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

async function loadImage(
  path: string,
  width: number,
  height: number,
): Promise<Buffer> {
  return sharp(path, { density: SETTINGS.svgDensity })
    .resize(width, height, {
      fit: "cover",
      position: "centre",
    })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function blendImages(
  inputPaths: readonly [string, string, string, string],
  outputPath: string,
): Promise<void> {
  const metadata = await sharp(inputPaths[0], {
    density: SETTINGS.svgDensity,
  }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions from ${inputPaths[0]}`);
  }

  const baseWidth = metadata.width;
  const baseHeight = metadata.height;

  const width = Math.round(baseWidth * SETTINGS.outputScale);
  const height = Math.round(baseHeight * SETTINGS.outputScale);

  const images = await Promise.all(
    inputPaths.map((path) => loadImage(path, width, height)),
  );

  const output = Buffer.alloc(width * height * 4);

  const { diagonalShift, feather, splits, glow, glowWidth, glowStrength } =
    SETTINGS;

  const glowColors = SETTINGS.glowColors.map(parseHexColor);

  for (let y = 0; y < height; y++) {
    const normalizedY = y / Math.max(1, height - 1);

    for (let x = 0; x < width; x++) {
      const normalizedX = x / Math.max(1, width - 1);

      /**
       * Coordinate perpendicular to the slash.
       *
       * Subtracting the vertical contribution makes the boundary move
       * left as it travels downward, creating a "/" separator.
       */
      const slashCoordinate = normalizedX + diagonalShift * (normalizedY - 0.5);

      const transition1 = smoothstep(
        splits[0] - feather,
        splits[0] + feather,
        slashCoordinate,
      );

      const transition2 = smoothstep(
        splits[1] - feather,
        splits[1] + feather,
        slashCoordinate,
      );

      const transition3 = smoothstep(
        splits[2] - feather,
        splits[2] + feather,
        slashCoordinate,
      );

      /**
       * These weights always add up to 1:
       *
       * image 1: 1 - transition1
       * image 2: transition1 - transition2
       * image 3: transition2 - transition3
       * image 4: transition3
       */
      const weights = [
        1 - transition1,
        transition1 - transition2,
        transition2 - transition3,
        transition3,
      ];

      const offset = (y * width + x) * 4;

      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;

      for (let imageIndex = 0; imageIndex < 4; imageIndex++) {
        const image = images[imageIndex]!;
        const weight = weights[imageIndex]!;

        red += image[offset]! * weight;
        green += image[offset + 1]! * weight;
        blue += image[offset + 2]! * weight;
        alpha += image[offset + 3]! * weight;
      }

      if (glow) {
        for (let splitIndex = 0; splitIndex < splits.length; splitIndex++) {
          const distance = Math.abs(slashCoordinate - splits[splitIndex]!);

          /**
           * Gaussian-shaped glow around the separator.
           */
          const intensity =
            Math.exp(-(distance * distance) / (2 * glowWidth * glowWidth)) *
            glowStrength;

          const glowColor = glowColors[splitIndex]!;
          const visibleGlow = intensity * (alpha / 255);

          red = red * (1 - visibleGlow) + glowColor[0] * visibleGlow;
          green = green * (1 - visibleGlow) + glowColor[1] * visibleGlow;
          blue = blue * (1 - visibleGlow) + glowColor[2] * visibleGlow;
        }
      }

      output[offset] = clampByte(red);
      output[offset + 1] = clampByte(green);
      output[offset + 2] = clampByte(blue);
      output[offset + 3] = clampByte(alpha);
    }
  }

  await sharp(output, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png({
      compressionLevel: 9,
    })
    .toFile(outputPath);

  console.log(`Created ${outputPath} (${width}×${height})`);
}

/**
 * Usage: `npm run showcase <cardname> <location>`
 *
 *   npm run showcase m1uki output
 *
 * `<cardname>` is the Minecraft username, `<location>` the directory that
 * holds (or will hold) the card set. Cards are picked up from
 * `<location>/<cardname>-<theme>.svg`; if any of the four Catppuccin cards
 * is missing, every theme is generated first (`--theme all` semantics).
 * The four Catppuccin cards are then blended into
 * `<location>/<cardname>-showcase.png`.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error(
      [
        "Usage:",
        "  npm run showcase <cardname> <location>",
        "",
        "Example:",
        "  npm run showcase m1uki output",
        "",
        "Generates <location>/<cardname>-<theme>.svg for every theme if the",
        "four Catppuccin cards are missing, then blends latte, frappe,",
        "macchiato and mocha into <location>/<cardname>-showcase.png.",
      ].join("\n"),
    );

    process.exitCode = 1;
    return;
  }

  const [username = "", locationArg = ""] = args;

  const location = path.resolve(locationArg);

  const cardPaths = SHOWCASE_THEMES.map((themeName) =>
    cardPath(location, username, themeName),
  ) as [string, string, string, string];

  const allCardsPresent = (
    await Promise.all(
      cardPaths.map(async (cardFilePath) => fileExists(cardFilePath)),
    )
  ).every(Boolean);

  if (!allCardsPresent) {
    await mkdir(location, { recursive: true });

    console.log(
      `Missing Catppuccin cards — generating ${username} for every theme…`,
    );

    for (const themeName of Object.keys(themes)) {
      const outputPath = cardPath(location, username, themeName);

      const svg = await generateCard(username, undefined, themeName);

      await writeFile(outputPath, svg, "utf8");
      console.log(`Generated ${outputPath}`);
    }
  } else {
    console.log(`Using existing cards in ${location}`);
  }

  const outputPath = path.join(location, `${username}-showcase.png`);

  await blendImages(cardPaths, outputPath);

  // Dependencies (canvas, sharp) keep background handles alive after the
  // image is written; exit explicitly like the CLI does.
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
