const integerFormatter = new Intl.NumberFormat(
  "en-US",
  {
    maximumFractionDigits: 0,
  },
);

const compactFormatter = new Intl.NumberFormat(
  "en-US",
  {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  },
);

export function formatInteger(
  value: number,
): string {
  return integerFormatter.format(
    Math.round(value),
  );
}

export function formatCompact(
  value: number,
): string {
  return compactFormatter.format(value);
}

export function formatXp(
  value: number,
): string {
  if (value >= 1_000_000_000) {
    return `${trimNumber(value / 1_000_000_000)}B`;
  }

  if (value >= 1_000_000) {
    return `${trimNumber(value / 1_000_000)}M`;
  }

  if (value >= 1_000) {
    return `${trimNumber(value / 1_000)}K`;
  }

  return formatInteger(value);
}

export function clamp01(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

export function titleCaseIdentifier(
  value: string,
): string {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function trimNumber(
  value: number,
): string {
  return value
    .toFixed(value >= 100 ? 1 : 2)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
}
