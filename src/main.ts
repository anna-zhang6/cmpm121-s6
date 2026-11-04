// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app: HTMLElement = document.querySelector("#app")!;

/** One unit of resource stored by the colony. */
let spores = 0;

/** How many Spore Packets the colony has cultivated. */
let packets = 0;

/** Base package price, before escalation. */
const packetBaseCost = 10;

/** Each purchased packet makes the price 15 percent steeper. */
const packetCostGrowth = 1.15;

function packetCost(): number {
  return Math.ceil(packetBaseCost * Math.pow(packetCostGrowth, packets));
}

function sporesPerScatter(): number {
  return 1 + packets;
}

function spreadPerSecond(): number {
  return 0.5;
}

function buyPacket(): void {
  const cost = packetCost();
  if (spores < cost) return;
  spores -= cost;
  packets += 1;
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

const heading = createHeading();
const badge = createBadge();
const button = createScatterButton(() => {
  spores += sporesPerScatter();
});
const counter = createSporeCounter();
const rateSummary = document.createElement("p");
const packetName = document.createElement("strong");
packetName.textContent = "Spore Packet";
const packetDetail = document.createElement("span");
const packetCount = document.createElement("span");
const packetButton = document.createElement("button");
packetButton.textContent = "Cultivate";
packetButton.addEventListener("click", buyPacket);

function updatePacketView(): void {
  packetDetail.textContent =
    `Escape the wind: grow ${sporesPerScatter()} spores per scatter. `;
  packetCount.textContent = `Owned: ${packets}`;
  packetButton.disabled = spores < packetCost();
}
updatePacketView();

const packetRow = document.createElement("div");
packetRow.append(
  packetName,
  document.createElement("br"),
  packetDetail,
  packetCount,
  packetButton,
);

app.append(heading, badge, button, counter.root, packetRow, rateSummary);

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
  rateSummary.textContent = `Spread rate: ${
    spreadPerSecond().toFixed(1)
  } spores/s`;
  updatePacketView();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
