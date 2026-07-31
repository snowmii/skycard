<h1 align="center"> Skycard </h1>


<p align="center">
<img src=https://github.com/snowmii/skycard/blob/generated/generated/card-showcase.png>
</p>

   
A simple skyblock stat display inspired by [github-stats](https://github.com/jstrieb/github-stats)

Also comes with [catppuccin](https://github.com/catppuccin/catppuccin) flavors

## Use this as a template

1. Click **Use this template** on GitHub and create your own repository.
2. Add a repository secret named `HYPIXEL_API_KEY`.
3. Add repository variables:
   - `PLAYER_NAME` - Minecraft username
   - `PROFILE_NAME` - optional SkyBlock profile name
4. Open **Actions > Generate themes > Run workflow**.

The workflow runs hourly and stores the generated SVG files on the `generated` branch.

## Show the card

Add the generated file to a README:

```md
![SkyBlock](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/blob/generated/generated/card-THEME.svg)
```

## Run locally

```bash
npm install
npm run generate -- YOUR_USERNAME --theme all --output generated/card.svg
```

Requires Node.js 20+ and `HYPIXEL_API_KEY` in your environment or `.env` file.
