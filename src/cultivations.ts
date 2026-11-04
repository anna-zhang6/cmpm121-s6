import type { Purchase } from "./game.ts";

/** The colony's offerings. Content lives here as data; shared code in
 * main.ts interprets it, so adding an entry needs no new logic. */
export const purchases: readonly Purchase[] = [
  {
    id: "packet",
    name: "Spore Packet",
    detail: "Escape the wind: scatter denser clusters.",
    baseCost: 10,
    costGrowth: 1.15,
    clickBonus: 1,
    rateBonus: 0,
  },
  {
    id: "mulch",
    name: "Mulch Bed",
    detail: "Fallen nutrients feed the mycelium.",
    baseCost: 25,
    costGrowth: 1.2,
    clickBonus: 0,
    rateBonus: 0.5,
  },
  {
    id: "fan",
    name: "Breeze Fan",
    detail: "Slow drafts carry spores far and wide.",
    baseCost: 60,
    costGrowth: 1.25,
    clickBonus: 3,
    rateBonus: 0,
  },
  {
    id: "dome",
    name: "Humidity Dome",
    detail: "Steady moisture keeps the hyphae reaching.",
    baseCost: 120,
    costGrowth: 1.3,
    clickBonus: 0,
    rateBonus: 2,
  },
];
