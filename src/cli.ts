import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";

import path from "node:path";

import { Command } from "commander";

import { generateCard } from "./generator.js";

import { themes } from "./themes.js";

interface CliOptions {
  profile?: string;
  output: string;
  theme?: string;
}

const program = new Command();

program
  .name("skyblock-card")
  .description("Generate a Hypixel SkyBlock profile SVG.")
  .argument("<username>", "Minecraft username")
  .option("-p, --profile <name>", "SkyBlock profile cute name")
  .option("-o, --output <path>", "Output SVG path", "output/card.svg")
  .option("-t, --theme <name>", 'Card theme, or "all" for every theme')
  .action(async (username: string, options: CliOptions) => {
    const requestedOutputPath = path.resolve(options.output);

    await mkdir(path.dirname(requestedOutputPath), {
      recursive: true,
    });

    if (options.theme?.toLowerCase() === "all") {
      const parsedOutput = path.parse(requestedOutputPath);

      await Promise.all(
        Object.keys(themes).map(async (themeName) => {
          const outputPath = path.join(
            parsedOutput.dir,
            `${parsedOutput.name}-${themeName}.svg`,
          );

          const svg = await generateCard(username, options.profile, themeName);

          await writeFile(outputPath, svg, "utf8");

          console.log(`Generated ${outputPath}`);
        }),
      );

      return;
    }

    const svg = await generateCard(username, options.profile, options.theme);

    await writeFile(requestedOutputPath, svg, "utf8");

    console.log(`Generated ${requestedOutputPath}`);
  });

await program.parseAsync();

// Some dependencies keep background refresh handles alive after generation.
// All output writes are complete by this point, so exit explicitly.
process.exit(0);
