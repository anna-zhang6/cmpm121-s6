// @deno-types="./asset-url.d.ts"
import mushroomUrl from "./assets/mushroom.svg?no-inline";
// Vite pulls the stylesheet into the bundle and hashes it for Pages, same
// as the SVG asset.
import "./style.css";
import {
  type Colony,
  copiesOf,
  costOf,
  createColony,
  grow,
  type Purchase,
  scatter,
  sporesPerScatter,
  spreadPerSecond,
  tryBuy,
} from "./game.ts";
import { purchases } from "./cultivations.ts";

const app: HTMLElement = document.querySelector("#app")!;

/** The state of the run; the view below reads it but never owns it. */
const colony: Colony = createColony();

function createHeading(): HTMLHeadingElement {
  const heading = document.createElement("h1");
  heading.textContent = "Mushroom Colony";
  return heading;
}

function createBadge(): HTMLImageElement {
  const image = document.createElement("img");
  image.src = mushroomUrl;
  image.alt = "A cluster of mushrooms on dark forest floor";
  image.width = 96;
  image.height = 96;
  return image;
}

/** The primary action: scatter spores into the counter. */
function createScatterButton(onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = "scatter";
  button.textContent = "Scatter Spores";
  button.addEventListener("click", onClick);
  return button;
}

/** View of the stored spores; must always agree with state. */
function createSporeCounter(): { root: HTMLElement; update: () => void } {
  const paragraph = document.createElement("p");
  paragraph.id = "spore-count";
  const update = () => {
    paragraph.textContent = `Spores: ${
      Math.floor(colony.spores).toLocaleString()
    }`;
  };
  update();
  return { root: paragraph, update };
}

interface PurchaseRow {
  readonly root: HTMLElement;
  /** Refresh price, owned count, and affordability from state. */
  update(): void;
}

/** One offering's view: same shape for every kind of purchase. */
function createPurchaseRow(purchase: Purchase): PurchaseRow {
  const name = document.createElement("strong");
  name.textContent = purchase.name;

  const detail = document.createElement("span");
  detail.className = "flavor";
  detail.textContent = purchase.detail;

  const stats = document.createElement("span");
  stats.className = "stats";

  const cultivate = document.createElement("button");
  cultivate.textContent = "Cultivate";
  cultivate.addEventListener("click", () => {
    if (tryBuy(colony, purchase)) rateSummaryDirty = true;
  });

  const info = document.createElement("div");
  info.append(name, detail, stats);

  const root = document.createElement("div");
  root.className = "purchase";
  root.append(info, cultivate);

  const update = () => {
    stats.textContent = `Owned: ${copiesOf(colony, purchase)} · Price: ${
      costOf(colony, purchase).toLocaleString()
    } spores`;
    cultivate.disabled = colony.spores < costOf(colony, purchase);
  };
  update();
  return { root, update };
}

const heading = createHeading();
const badge = createBadge();
const button = createScatterButton(() => {
  scatter(colony, purchases);
  counter.update();
  rateSummaryDirty = true;
});
const counter = createSporeCounter();
const rateSummary = document.createElement("p");
const purchaseRows: PurchaseRow[] = purchases.map(createPurchaseRow);

function updateRateSummary(): void {
  rateSummary.textContent = `Per scatter: ${
    sporesPerScatter(colony, purchases)
  } spores · Spread: ${spreadPerSecond(colony, purchases).toFixed(1)} spores/s`;
}
updateRateSummary();

app.append(
  heading,
  badge,
  button,
  counter.root,
  ...purchaseRows.map((row) => row.root),
  rateSummary,
);

/**
 * Colony growth runs on animation frames, but the rate depends on elapsed
 * seconds, not frame count: frames deliver now-epochs, and the change per
 * frame is the current rate scaled by real elapsed time. Clicking keeps
 * adding whole spores at the scatters themselves.
 */
let lastFrame: number = performance.now();
let rateSummaryDirty = true;

function frame(now: number): void {
  const elapsedSeconds = (now - lastFrame) / 1000;
  lastFrame = now;
  grow(colony, elapsedSeconds, spreadPerSecond(colony, purchases));
  counter.update();
  if (rateSummaryDirty) {
    updateRateSummary();
    rateSummaryDirty = false;
  }
  for (const row of purchaseRows) row.update();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
