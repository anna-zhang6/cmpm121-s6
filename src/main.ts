// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app: HTMLElement = document.querySelector("#app")!;

/** One unit of resource stored by the colony. */
let spores = 0;

/** Colony spread, in spores gained per elapsed second. */
const spreadPerSecond = 0.5;

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
    paragraph.textContent = `Spores: ${spores.toLocaleString()}`;
  };
  update();
  return { root: paragraph, update };
}

const heading = createHeading();
const badge = createBadge();
const button = createScatterButton(() => {
  spores += 1;
  counter.update();
});
const counter = createSporeCounter();

app.append(heading, badge, button, counter.root);

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
  spores += spreadPerSecond * elapsedSeconds;
  counter.update();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
