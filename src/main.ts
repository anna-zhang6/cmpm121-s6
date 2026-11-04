// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app: HTMLElement = document.querySelector("#app")!;

/** What one kind of cultivation does to the colony. */
interface Purchase {
  readonly id: string;
  readonly name: string;
  /** Flavor line tying the effect to the mushroom theme. */
  readonly detail: string;
  readonly baseCost: number;
  /** Each owned copy multiplies this purchase's next price. */
  readonly costGrowth: number;
  /** Added spores per scatter, per owned copy. */
  readonly clickBonus: number;
  /** Added colony spread per second, per owned copy. */
  readonly rateBonus: number;
}

/** The colony's offerings. Content lives here as data; shared code below
 * interprets it, so adding an entry needs no new logic. */
const purchases: readonly Purchase[] = [
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

/** One unit of resource stored by the colony. */
let spores = 0;

/** Copies owned of each purchase, keyed by purchase id. */
const owned: Record<string, number> = {};

function copiesOf(purchase: Purchase): number {
  return owned[purchase.id] ?? 0;
}

/** Price of the next copy, escalating with how many are already grown. */
function costOf(purchase: Purchase): number {
  return Math.ceil(
    purchase.baseCost * Math.pow(purchase.costGrowth, copiesOf(purchase)),
  );
}

function sporesPerScatter(): number {
  return 1 + purchases.reduce(
    (total, purchase) => total + purchase.clickBonus * copiesOf(purchase),
    0,
  );
}

function spreadPerSecond(): number {
  return 0.5 + purchases.reduce(
    (total, purchase) => total + purchase.rateBonus * copiesOf(purchase),
    0,
  );
}

/** Spends the stored spores; blocked while unaffordable. */
function buy(purchase: Purchase): void {
  const cost = costOf(purchase);
  if (spores < cost) return;
  spores -= cost;
  owned[purchase.id] = copiesOf(purchase) + 1;
}

function createHeading(): HTMLHeadingElement {
  const heading = document.createElement("h1");
  heading.textContent = "Mushroom Colony";
  return heading;
}

function createBadge(): HTMLImageElement {
  const image = document.createElement("img");
  image.src = tileUrl;
  image.alt = "A spore tile";
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
    paragraph.textContent = `Spores: ${Math.floor(spores).toLocaleString()}`;
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
  detail.textContent = purchase.detail;

  const stats = document.createElement("span");

  const cultivate = document.createElement("button");
  cultivate.textContent = "Cultivate";
  cultivate.addEventListener("click", () => buy(purchase));

  const root = document.createElement("div");
  root.append(
    name,
    document.createElement("br"),
    detail,
    document.createElement("br"),
    stats,
    cultivate,
  );

  const update = () => {
    stats.textContent = `Owned: ${copiesOf(purchase)} · Price: ${
      costOf(purchase).toLocaleString()
    } spores`;
    cultivate.disabled = spores < costOf(purchase);
  };
  update();
  return { root, update };
}

const heading = createHeading();
const badge = createBadge();
const button = createScatterButton(() => {
  spores += sporesPerScatter();
});
const counter = createSporeCounter();
const rateSummary = document.createElement("p");
const purchaseRows: PurchaseRow[] = purchases.map(createPurchaseRow);

function updateRateSummary(): void {
  rateSummary.textContent =
    `Per scatter: ${sporesPerScatter()} spores · Spread: ${
      spreadPerSecond().toFixed(1)
    } spores/s`;
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
 * frame is spreadPerSecond scaled by the real elapsed time. Clicking keeps
 * adding whole spores at the scatters themselves.
 */
let lastFrame: number = performance.now();

function frame(now: number): void {
  const elapsedSeconds = (now - lastFrame) / 1000;
  lastFrame = now;
  spores += spreadPerSecond() * elapsedSeconds;
  counter.update();
  updateRateSummary();
  for (const row of purchaseRows) row.update();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
