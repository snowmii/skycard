# Card themes

All theme colours live in [`./themes.json`](./themes.json) — a plain data
file, with no code to touch when you want to restyle the card. `themes.ts`
only loads the data and resolves it onto the SVG template.

## File layout

```jsonc
{
  // The theme whose colours are baked into `template.svg` as placeholders.
  // See "Placeholder theme" below. (JSON has no comments — this is just
  // shown here for explanation.)
  "templateBase": "twilight",

  "themes": {
    "twilight":  { "template": { ... }, "minecraft": { ... }, "emblem": { ... } },
    "midnight":  { "template": { ... }, "minecraft": { ... }, "emblem": { ... } },
    "latte":     { "template": { ... }, "minecraft": { ... }, "emblem": { ... } },
    "frappe":    { "template": { ... }, "minecraft": { ... }, "emblem": { ... } },
    "macchiato": { "template": { ... }, "minecraft": { ... }, "emblem": { ... } },
    "mocha":     { "template": { ... }, "minecraft": { ... }, "emblem": { ... } }
  }
}
```

Every theme has three sections:

| Section     | Purpose                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `template`  | The card layout colours: backgrounds, gradients, panel fills, text colours, dividers.                                                                                               |
| `minecraft` | The 16 [Minecraft chat colours](https://minecraft.wiki/w/Formatting_codes) — used for rank badges, SkyBlock level colour, skill/slayer text that is normally shown in chat colours. |
| `emblem`    | The 5 emblem (profile icon) colour variants.                                                                                                                                        |

## Editing an existing theme

Open `themes.json`, find the theme, change any hex value. All values are
`#rrggbb`. Adding a new theme is the same shape:

1. Copy a whole theme block (`{ "template": ..., "minecraft": ..., "emblem": ... }`),
2. paste it into `"themes"` with a new lowercase key (e.g. `"sunset"`),
3. tweak the colours to taste.

It becomes available everywhere automatically: CLI `--theme sunset`, the
`?theme=` query parameter on the server, and `--theme all`.

| `template` slot                           | Where it shows up on the card                                  |
| ----------------------------------------- | -------------------------------------------------------------- |
| `backgroundStart/Middle/End`              | Card backdrop vertical gradient                                |
| `railStart` / `railEnd`                   | Side rail gradient                                             |
| `rankGradientStart` / `rankGradientEnd`   | Rank badge gradient                                            |
| `goldGradientStart` / `goldGradientEnd`   | Gold-themed progress bars                                      |
| `greenGradientStart` / `greenGradientEnd` | Green-themed progress bars                                     |
| `redGradientStart` / `redGradientEnd`     | Red-themed progress bars (e.g. slayers)                        |
| `divider`                                 | Thin section divider lines                                     |
| `levelRingTrack`                          | SkyBlock level ring track                                      |
| `levelAccent`                             | SkyBlock level ring accent / number                            |
| `levelLabel`                              | Small "SKYBLOCK LEVEL" label                                   |
| `skinPanel`                               | Skin preview panel fill                                        |
| `skinPlaceholder`                         | Skin preview placeholder tint                                  |
| `label`                                   | Small uppercase captions above values (NETWORTH, ACTIVE PET …) |
| `networth`                                | Net worth value                                                |
| `networthMuted`                           | Muted net worth shading                                        |
| `value`                                   | Large stat values                                              |
| `sectionTitle`                            | Section headers (CORE, SLAYERS …)                              |
| `primaryText`                             | Main body text                                                 |
| `secondaryText`                           | Secondary body text                                            |
| `mutedText`                               | De-emphasised text                                             |
| `progressTrack`                           | Progress bar track fill                                        |
| `goldProgressText`                        | Text on gold progress bars                                     |
| `greenProgressText`                       | Text on green progress bars                                    |
| `slayerText`                              | Slayer row text                                                |
| `petBackdrop`                             | Behind the active pet icon                                     |
| `petLevel`                                | Pet level text                                                 |
| `footerDivider`                           | Footer row divider strokes                                     |
| `footerText`                              | Footer text                                                    |

## Placeholder theme (`templateBase`)

`template.svg` is hand-authored with one theme's colours baked in. When a
card is rendered, `applyThemeToTemplate` scans the SVG and swaps every hex
that matches a `template` colour of the **placeholder theme** for the
corresponding colour of the requested theme.

Consequences:

- If you edit a colour of the placeholder theme in `themes.json`, that slot
  stops being themed — the old colour still lives inside `template.svg`.
  Either keep the placeholder theme's colours stable, or re-author
  `template.svg` to use your new colours and update `templateBase`.
- The mapping is derived from the data, not duplicated in code, so it can't
  drift silently.

## Catppuccin flavours

`latte`, `frappe`, `macchiato` and `mocha` follow the project's
[official style guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md):
background panes use `base`, secondary panes `mantle`/`crust`, surface
elements `surface0-2`, labels/sub-headlines `subtext0/1`, body text `text`,
"subtle" `overlay1`, and text sitting on a coloured accent uses `base`
("On Accent" rule).

To hand-derive a new flavour (or re-derive one after an upstream palette
change), map the palette names onto the slots like this:

| Palette key | `template` slot(s)                                                                            |
| ----------- | --------------------------------------------------------------------------------------------- |
| `base`      | `backgroundStart`, `goldProgressText` (dark flavours)                                         |
| `mantle`    | `backgroundMiddle`, `railEnd`                                                                 |
| `crust`     | `backgroundEnd`, `progressTrack`, `petBackdrop`                                               |
| `surface0`  | `railStart`, `levelRingTrack`, `skinPanel`, `footerDivider`, the two dark panels*             |
| `surface1`  | `divider`                                                                                     |
| `subtext1`  | `label`, `petLevel`                                                                           |
| `subtext0`  | `levelLabel`, `secondaryText`                                                                 |
| `overlay0`  | `skinPlaceholder`, minecraft `darkGray`                                                       |
| `overlay1`  | `footerText`                                                                                  |
| `overlay2`  | minecraft `gray`                                                                              |
| `text`      | `value`, `primaryText`, `slayerText`, `greenProgressText`, minecraft `white`, emblem `normal` |
| `lavender`  | `sectionTitle`, `mutedText` (dark flavours)                                                   |
| `sky`       | `rankGradientStart`, minecraft `aqua`, emblem `diamond`                                       |
| `mauve`     | `rankGradientEnd`, minecraft `darkPurple`, emblem `purple`                                    |
| `yellow`    | `goldGradientStart`, minecraft `yellow`, emblem `gold`                                        |
| `peach`     | `goldGradientEnd`, minecraft `gold`                                                           |
| `green`     | `greenGradientStart`, `networth`, minecraft `green`                                           |
| `teal`      | `greenGradientEnd`, `networthMuted` (dark flavours), minecraft `darkGreen`, `darkAqua`        |
| `red`       | `redGradientStart`, `levelAccent`, minecraft `red`                                            |
| `maroon`    | `redGradientEnd`, minecraft `darkRed`                                                         |
| `pink`      | minecraft `lightPurple`, emblem `pink`                                                        |
| `blue`      | minecraft `blue`                                                                              |
| `sapphire`  | minecraft `darkBlue`                                                                          |

\* `player-nametag-background` and `pet-card` are panels too — the renderer
paints them with `skinPanel` instead of the baked black they used to have.

### Latte is special

The style guide applies to all flavours, but `latte` is a light theme: its
pastel accents are too faint to sit on (or under) text, so several roles
**darken** in latte only. This mirrors Catppuccin's own behaviour (e.g. its
terminal `color0` is `subtext1` in latte but `surface1` in dark flavours).
Differences, all chosen to keep WCAG contrast ≥ 3.0 on the surfaces they
touch:

- `sectionTitle` and `networthMuted` → `subtext1` (a neutral instead of
  `lavender`/`teal`).
- `mutedText` → a darkened `lavender` (`#5362b7`), not the palette value —
  the palette lavender is only 2.6:1 on latte's background, which fails for
  the inferno slayer text that uses it.
- `goldGradientStart` (the pet name and the gold-bar start) and `green`
  (`greenGradientStart`/`networth`) are darkened until text on them reaches
  the same ≥3.0:1 bar as the other latte accents.
- Minecraft `black`/`gray`/`darkGray` → `text`/`subtext1`/`subtext0`.
- The vivid accents (`yellow`, `aqua`, `lightPurple`, `green`, `darkGreen`,
  `darkAqua`, `darkBlue`, `gold`, and emblem `gold`/`diamond`/`pink`) are
  darkened within their own hue until they reach 3.0:1 against both the card
  background and the `skinPanel` surfaces. This is the same "darken the
  accents for a light theme" move midnight already does to its Minecraft
  colours, and it is why latte's numbers are not Catppuccin palette values.

### Known compromises

- The green/gold XP text floats on the progress-bar zone. Its colour is
  picked for the **track** background (where it sits while leveling); where
  it overlaps the filled bar it is dimmer — true for twilight too
  (`greenProgressText` is 1.5:1 on the bar there). Latte's gold bar is the
  only case below 3:1 on-bar.
- `footerText` is deliberately "subtle" (`overlay1`) — lower contrast by
  design, same as twilight. Latte's is darkened slightly (`#7b7e8e`) because
  light-on-light fades faster than light-on-dark.
