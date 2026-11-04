import {
  costOf,
  createColony,
  grow,
  sporesPerScatter,
  spreadPerSecond,
  tryBuy,
} from "./game.ts";
import { purchases } from "./cultivations.ts";

const packet = purchases[0];
const mulch = purchases[1];

Deno.test("prices escalate with owned copies", () => {
  const colony = createColony();
  colony.owned[packet.id] = 3;
  // Cost growth is per-owned-copy, so the fourth copy is dearer than the first.
  const escalated = Math.ceil(10 * Math.pow(1.15, 3));
  if (costOf(colony, packet) !== escalated) {
    throw new Error(`expected ${escalated}, got ${costOf(colony, packet)}`);
  }
});

Deno.test("buying is blocked while unaffordable", () => {
  const colony = createColony();
  colony.spores = costOf(colony, packet) - 0.5;
  if (tryBuy(colony, packet)) {
    throw new Error("a half-price colony should not afford a packet");
  }
});

Deno.test("a valid purchase deducts its cost and grows its count", () => {
  const colony = createColony();
  const cost = costOf(colony, packet);
  colony.spores = cost;
  if (!tryBuy(colony, packet)) throw new Error("affordable buy was refused");
  if (colony.spores !== 0) {
    throw new Error(`expected the cost deducted, got ${colony.spores}`);
  }
  if (sporesPerScatter(colony, purchases) !== 2) {
    throw new Error("one packet should double the first scatter");
  }
});

Deno.test("rate bonuses persist in the spread and in later growth", () => {
  const colony = createColony();
  colony.spores = 25;
  if (!tryBuy(colony, mulch)) {
    throw new Error("could not afford the first mulch bed");
  }
  if (spreadPerSecond(colony, purchases) !== 1) {
    throw new Error(
      `one mulch bed should give 1 spores/s, got ${
        spreadPerSecond(colony, purchases)
      }`,
    );
  }
  grow(colony, 2, spreadPerSecond(colony, purchases));
  if (Math.abs(colony.spores - 2) > 1e-9) {
    throw new Error(`two seconds of growth expected 2, got ${colony.spores}`);
  }
});
