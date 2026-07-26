import assert from "node:assert/strict";
import test from "node:test";

import {
  calculatePetLevel,
} from "./pet-xp.js";

test("calculates standard pet levels using rarity offsets", () => {
  assert.equal(
    calculatePetLevel(
      "SHEEP",
      "COMMON",
      0,
    ),
    1,
  );

  assert.equal(
    calculatePetLevel(
      "SHEEP",
      "LEGENDARY",
      660,
    ),
    2,
  );
});

test("calculates level-200 dragon pets from their XP table", () => {
  assert.equal(
    calculatePetLevel(
      "ROSE_DRAGON",
      "LEGENDARY",
      185_682_785.34198198,
    ),
    186,
  );

  assert.equal(
    calculatePetLevel(
      "GOLDEN_DRAGON",
      "LEGENDARY",
      210_255_385,
    ),
    200,
  );
});

test("handles pets with special fixed leveling", () => {
  assert.equal(
    calculatePetLevel(
      "FRACTURED_MONTEZUMA_SOUL",
      "EPIC",
      0,
    ),
    100,
  );
});
