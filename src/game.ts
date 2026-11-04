/** What one kind of cultivation does to the colony. */
export interface Purchase {
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

/** The saved, changing numbers of the game, with no display attached. */
export interface Colony {
  /** Fractional spores are valid in state; the view floors them. */
  spores: number;
  readonly owned: Record<string, number>;
}

export function createColony(): Colony {
  return { spores: 0, owned: {} };
}

export function copiesOf(colony: Colony, purchase: Purchase): number {
  return colony.owned[purchase.id] ?? 0;
}

/** Price of the next copy, escalating with how many are already grown. */
export function costOf(colony: Colony, purchase: Purchase): number {
  return Math.ceil(
    purchase.baseCost *
      Math.pow(purchase.costGrowth, copiesOf(colony, purchase)),
  );
}

export function sporesPerScatter(
  colony: Colony,
  purchases: readonly Purchase[],
): number {
  return 1 + purchases.reduce(
    (total, purchase) =>
      total + purchase.clickBonus * copiesOf(colony, purchase),
    0,
  );
}

export function spreadPerSecond(
  colony: Colony,
  purchases: readonly Purchase[],
): number {
  return 0.5 + purchases.reduce(
    (total, purchase) =>
      total + purchase.rateBonus * copiesOf(colony, purchase),
    0,
  );
}

/** The manual action: one scatter, paying the current click yield. */
export function scatter(
  colony: Colony,
  purchases: readonly Purchase[],
): void {
  colony.spores += sporesPerScatter(colony, purchases);
}

/**
 * Attempts one purchase; the colony decides affordability itself, so no
 * display has to duplicate the rule. Returns whether it went through.
 */
export function tryBuy(
  colony: Colony,
  purchase: Purchase,
): boolean {
  const cost = costOf(colony, purchase);
  if (colony.spores < cost) return false;
  colony.spores -= cost;
  colony.owned[purchase.id] = copiesOf(colony, purchase) + 1;
  return true;
}

/** Column-spread growth: the change scales by real elapsed seconds. */
export function grow(
  colony: Colony,
  elapsedSeconds: number,
  rate: number,
): void {
  colony.spores += rate * elapsedSeconds;
}
