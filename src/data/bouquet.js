// Shared helpers so Preview and DownloadTemplate always agree on the numbers.

const KEYS = ["flowers", "fillers", "wrapper", "addOns"];

export const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

// wrapper is a single object (or null); the rest are arrays
export const itemsOf = (bouquet, key) => {
  const value = bouquet?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

// true once at least one item carries a price (real data may not have prices yet)
export const hasPrices = (bouquet) =>
  KEYS.some((key) => itemsOf(bouquet, key).some((item) => item.price != null));

// sum of every item's line-total price
export const totalOf = (bouquet) =>
  KEYS.reduce(
    (sum, key) => sum + itemsOf(bouquet, key).reduce((s, item) => s + (item.price ?? 0), 0),
    0
  );