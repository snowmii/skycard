import sharp from "sharp";

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
  glowColors: [
    "#8ea2ff",
    "#e8a0ff",
    "#a9c6ff",
  ] as const,

  outputScale: 1,
  svgDensity: 144,

  /**
   * Where the three separators appear across the normalized canvas.
   */
  splits: [0.25, 0.5, 0.75] as const,
};

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = Math.max(
    0,
    Math.min(1, (value - edge0) / (edge1 - edge0)),
  );

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

  const {
    diagonalShift,
    feather,
    splits,
    glow,
    glowWidth,
    glowStrength,
  } = SETTINGS;

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
      const slashCoordinate =
        normalizedX + diagonalShift * (normalizedY - 0.5);

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
        const image = images[imageIndex];
        const weight = weights[imageIndex];

        red += image[offset] * weight;
        green += image[offset + 1] * weight;
        blue += image[offset + 2] * weight;
        alpha += image[offset + 3] * weight;
      }

      if (glow) {
        for (let splitIndex = 0; splitIndex < splits.length; splitIndex++) {
          const distance = Math.abs(
            slashCoordinate - splits[splitIndex],
          );

          /**
           * Gaussian-shaped glow around the separator.
           */
          const intensity =
            Math.exp(
              -(distance * distance) /
                (2 * glowWidth * glowWidth),
            ) * glowStrength;

          const glowColor = glowColors[splitIndex];
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length !== 5) {
    console.error(
      [
        "Usage:",
        "  npx tsx slash-blend.ts <image1> <image2> <image3> <image4> <output>",
        "",
        "Example:",
        "  npx tsx slash-blend.ts latte.png frappe.png macchiato.png mocha.png showcase.png",
      ].join("\n"),
    );

    process.exitCode = 1;
    return;
  }

  const [image1, image2, image3, image4, output] = args;

  await blendImages(
    [image1, image2, image3, image4],
    output,
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});
