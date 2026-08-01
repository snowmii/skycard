import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import { readFile } from "node:fs/promises";

import type { SkyBlockCardData } from "../types.js";

import {
  clamp01,
  formatCompact,
  formatInteger,
  formatProfileAge,
  formatXp,
} from "../util/format.js";

import { applyThemeToTemplate, getSkyBlockLevelColor } from "../themes.js";

import type { CardTheme } from "../themes.js";

const SKILL_BAR_WIDTH = 270;
const SLAYER_BAR_WIDTH = 272;

const LEVEL_RING_RADIUS = 36;

const LEVEL_RING_CIRCUMFERENCE = 2 * Math.PI * LEVEL_RING_RADIUS;

import { createCanvas } from "canvas";

function measureText(text: string, font: string): number {
  const context = createCanvas(1, 1).getContext("2d");

  context.font = font;

  return context.measureText(text).width;
}

function measureNametagText(text: string): number {
  return measureText(text, "700 18px Consolas, monospace");
}

export async function renderSkyBlockCard(
  data: SkyBlockCardData,
  templatePath: string,
  theme: CardTheme,
): Promise<string> {
  const source = applyThemeToTemplate(
    await readFile(templatePath, "utf8"),
    theme,
  );

  const document = new DOMParser().parseFromString(source, "image/svg+xml");

  setText(document, "player-name", data.username);

  setFill(document, "player-name", theme.minecraft[data.rankColor]);

  setFill(document, "player-nametag-background", theme.template.skinPanel);

  const nameWidth = measureNametagText(data.username);

  const emblemText = data.emblem?.symbol ?? "";

  const gap = emblemText ? measureNametagText(" ") / 3 : 0;

  const emblemWidth = measureNametagText(emblemText);

  const nametagWidth =
    gap + emblemWidth + gap + nameWidth + gap + emblemWidth + gap;
  const nametagX = 106 - nametagWidth / 2 + gap;

  setX(document, "player-nametag-background", nametagX);

  setWidth(document, "player-nametag-background", nametagWidth);

  setX(document, "player-name", 106);

  setX(document, "player-emblem", 106 + nameWidth / 2 + gap);
  setText(document, "player-emblem", emblemText);

  setFill(
    document,
    "player-emblem",
    theme.emblem[data.emblem?.color ?? "normal"],
  );
  animateNumber(document, "player-section", 0.15);

  setText(document, "skyblock-level", String(data.skyblockLevel));

  const levelColor = theme.minecraft[getSkyBlockLevelColor(data.skyblockLevel)];

  setFill(document, "skyblock-level", levelColor);

  setStroke(document, "skyblock-level-progress", levelColor);

  setRingProgress(
    document,
    "skyblock-level-progress",
    data.skyblockLevelProgress,
  );
  animateRing(
    document,
    "skyblock-level-progress",
    data.skyblockLevelProgress,
    0.1,
  );
  animateNumber(document, "skyblock-level", 0.15);

  if (data.networth == null) {
    setText(document, "networth-full", "Unavailable");

    setText(document, "networth-short", "—");
  } else {
    const fullNetworth = formatInteger(data.networth);

    setText(document, "networth-full", fullNetworth);

    setText(document, "networth-short", formatCompact(data.networth));

    setX(
      document,
      "networth-short",
      232 + measureText(fullNetworth, "700 25px Consolas, monospace") + 10,
    );
  }

  setText(
    document,
    "playtime",
    data.profileAgeDays == null
      ? "Unavailable"
      : formatProfileAge(data.profileAgeDays),
  );

  setText(document, "purse", formatInteger(data.purse));

  setText(document, "bank", formatInteger(data.bank));

  ["networth-full", "networth-short", "playtime", "purse", "bank"].forEach(
    (id, index) => animateNumber(document, id, 0.18 + index * 0.06),
  );

  for (const [skillIndex, skill] of data.skills.entries()) {
    setText(document, `${skill.key}-level`, String(skill.level));

    setText(document, `${skill.key}-max-level`, String(skill.maxLevel));

    setFill(
      document,
      `${skill.key}-level`,
      skill.isMaxed
        ? theme.template.goldGradientStart
        : theme.template.greenGradientStart,
    );

    const xpText = skill.isMaxed
      ? `${formatXp(skill.overflowXp)} XP`
      : `${formatXp(skill.currentLevelXp)} / ` +
        `${formatXp(skill.nextLevelXp ?? 0)} XP`;

    setText(document, `${skill.key}-xp`, xpText);

    setFill(
      document,
      `${skill.key}-xp`,
      skill.isMaxed
        ? theme.template.goldProgressText
        : theme.template.greenProgressText,
    );

    const progressWidth = SKILL_BAR_WIDTH * clamp01(skill.progress);

    setWidth(document, `${skill.key}-progress`, progressWidth);

    setFill(
      document,
      `${skill.key}-progress`,
      skill.isMaxed ? "url(#gold)" : "url(#green)",
    );

    const delay = 0.35 + skillIndex * 0.08;

    animateBar(document, `${skill.key}-progress`, progressWidth, delay);
    animateNumber(document, `${skill.key}-level`, delay);
    animateNumber(document, `${skill.key}-max-level`, delay + 0.03);
    animateNumber(document, `${skill.key}-xp`, delay + 0.06);
  }

  for (const [slayerIndex, slayer] of data.slayers.entries()) {
    setText(
      document,
      `${slayer.key}-level`,
      `${slayer.level} / ${slayer.maxLevel}`,
    );

    setFill(
      document,
      `${slayer.key}-level`,
      slayer.level >= slayer.maxLevel
        ? theme.template.redGradientStart
        : theme.template.slayerText,
    );

    const progressWidth = SLAYER_BAR_WIDTH * clamp01(slayer.progress);

    setWidth(document, `${slayer.key}-progress`, progressWidth);

    setFill(
      document,
      `${slayer.key}-progress`,
      slayer.level >= slayer.maxLevel ? "url(#red)" : "url(#green)",
    );

    const delay = 0.42 + slayerIndex * 0.07;

    animateBar(document, `${slayer.key}-progress`, progressWidth, delay);
    animateNumber(document, `${slayer.key}-level`, delay);
  }

  setFill(document, "pet-card", theme.template.skinPanel);

  if (data.activePet) {
    setText(document, "pet-level", `[Lv${data.activePet.level}]`);

    setText(document, "pet-name", data.activePet.name);
    animateNumber(document, "pet-level", 0.85);
    applyPetHead(document, data.activePet.headDataUri, true);
  } else {
    setText(document, "pet-level", "");

    setText(document, "pet-name", "No active pet");

    setX(document, "pet-name", 653);

    applyPetHead(document, null, false);
  }
  animateNumber(document, "pet-name", 0.85);
  animateNumber(document, "pet-head", 0.85);
  animateNumber(document, "pet-head-placeholder", 0.85);

  setText(document, "profile-url", data.profileUrl);

  setText(
    document,
    "generated-date",
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(data.generatedAt),
  );

  applySkin(document, data.skinDataUri);
  animateNumber(document, "skin-section", 0.2);

  return new XMLSerializer().serializeToString(document);
}

function applyPetHead(
  document: Document,
  dataUri: string | null,
  hasActivePet: boolean,
): void {
  const image = requireElement(document, "pet-head");

  const placeholder = requireElement(document, "pet-head-placeholder");

  if (!hasActivePet) {
    image.setAttribute("display", "none");
    placeholder.setAttribute("display", "none");
    return;
  }

  if (!dataUri) {
    image.setAttribute("display", "none");
    placeholder.removeAttribute("display");
    return;
  }

  placeholder.setAttribute("display", "none");

  image.removeAttribute("display");
  image.setAttribute("href", dataUri);
  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", dataUri);
}

function setX(document: Document, id: string, x: number): void {
  const element = requireElement(document, id);
  element.setAttribute("x", Math.max(0, x).toFixed(2));
}
function setText(document: Document, id: string, value: string): void {
  const element = requireElement(document, id);

  element.textContent = value;
}

function setWidth(document: Document, id: string, width: number): void {
  const element = requireElement(document, id);

  element.setAttribute("width", Math.max(0, width).toFixed(2));
}

function setFill(document: Document, id: string, fill: string): void {
  requireElement(document, id).setAttribute("fill", fill);
}

function setStroke(document: Document, id: string, stroke: string): void {
  requireElement(document, id).setAttribute("stroke", stroke);
}

function setRingProgress(
  document: Document,
  id: string,
  progress: number,
): void {
  const normalized = clamp01(progress);

  const filled = LEVEL_RING_CIRCUMFERENCE * normalized;

  const empty = LEVEL_RING_CIRCUMFERENCE - filled;

  const element = requireElement(document, id);

  element.setAttribute(
    "stroke-dasharray",
    `${filled.toFixed(2)} ${empty.toFixed(2)}`,
  );
}

function animateRing(
  document: Document,
  id: string,
  progress: number,
  delay: number,
): void {
  const filled = LEVEL_RING_CIRCUMFERENCE * clamp01(progress);
  const empty = LEVEL_RING_CIRCUMFERENCE - filled;
  const duration = delay + 1.1;
  const start = delay / duration;

  appendAnimation(document, "animate", id, {
    attributeName: "stroke-dasharray",
    begin: "0s",
    dur: `${duration}s`,
    values:
      `0 ${LEVEL_RING_CIRCUMFERENCE.toFixed(2)};` +
      `0 ${LEVEL_RING_CIRCUMFERENCE.toFixed(2)};` +
      `${filled.toFixed(2)} ${empty.toFixed(2)}`,
    keyTimes: `0;${start.toFixed(3)};1`,
    fill: "freeze",
    calcMode: "spline",
    keySplines: "0 0 1 1;0.22 1 0.36 1",
  });
}

function animateBar(
  document: Document,
  id: string,
  width: number,
  delay: number,
): void {
  const duration = delay + 0.9;
  const start = delay / duration;

  appendAnimation(document, "animate", id, {
    attributeName: "width",
    begin: "0s",
    dur: `${duration}s`,
    values: `0;0;${Math.max(0, width).toFixed(2)}`,
    keyTimes: `0;${start.toFixed(3)};1`,
    fill: "freeze",
    calcMode: "spline",
    keySplines: "0 0 1 1;0.22 1 0.36 1",
  });
}

function animateNumber(document: Document, id: string, delay: number): void {
  const fadeDuration = delay + 0.45;
  const fadeStart = delay / fadeDuration;

  appendAnimation(document, "animate", id, {
    attributeName: "opacity",
    begin: "0s",
    dur: `${fadeDuration}s`,
    values: "0;0;1",
    keyTimes: `0;${fadeStart.toFixed(3)};1`,
    fill: "freeze",
  });

  appendAnimation(document, "animateTransform", id, {
    attributeName: "transform",
    type: "translate",
    begin: `${delay}s`,
    dur: "0.55s",
    values: "0 8;0 -2;0 0",
    keyTimes: "0;0.72;1",
    fill: "freeze",
  });
}

function appendAnimation(
  document: Document,
  tagName: "animate" | "animateTransform",
  targetId: string,
  attributes: Record<string, string>,
): void {
  const animation = document.createElementNS(
    "http://www.w3.org/2000/svg",
    tagName,
  );

  animation.setAttribute("href", `#${targetId}`);
  animation.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    `#${targetId}`,
  );

  for (const [name, value] of Object.entries(attributes)) {
    animation.setAttribute(name, value);
  }

  document.documentElement.appendChild(animation);
}

function applySkin(document: Document, dataUri: string | null): void {
  const placeholder = requireElement(document, "skin-placeholder");

  if (!dataUri) {
    placeholder.removeAttribute("display");

    return;
  }

  placeholder.setAttribute("display", "none");

  const image = requireElement(document, "skin-image");

  image.setAttribute("href", dataUri);

  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", dataUri);
}

function requireElement(document: Document, id: string): Element {
  const element = findElementById(document.documentElement, id);

  if (!element) {
    throw new Error(`SVG template is missing #${id}`);
  }

  return element;
}

function findElementById(root: Element, id: string): Element | null {
  if (root.getAttribute("id") === id) {
    return root;
  }

  for (let index = 0; index < root.childNodes.length; index += 1) {
    const child = root.childNodes.item(index);

    if (child?.nodeType !== 1) {
      continue;
    }

    const found = findElementById(child as Element, id);

    if (found) {
      return found;
    }
  }

  return null;
}
