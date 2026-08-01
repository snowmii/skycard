import "dotenv/config";

import express from "express";

import { config } from "./config.js";

import { generateCard } from "./generator.js";

const app = express();

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
  });
});

app.get("/card/:username.svg", async (request, response) => {
  try {
    const username = request.params.username;

    const profile =
      typeof request.query.profile === "string"
        ? request.query.profile
        : undefined;

    const theme =
      typeof request.query.theme === "string" ? request.query.theme : undefined;

    const svg = await generateCard(username, profile, theme);

    response
      .status(200)
      .set({
        "Content-Type": "image/svg+xml; charset=utf-8",

        "Cache-Control": "public, max-age=300",

        "X-Content-Type-Options": "nosniff",
      })
      .send(svg);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown generator error";

    console.error(error);

    response.status(500).json({
      error: message,
    });
  }
});

app.listen(config.port, () => {
  console.log(
    "SkyBlock card server listening at " + `http://localhost:${config.port}`,
  );
});
