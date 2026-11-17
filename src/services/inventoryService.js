import addonsData from "../data/addons.json";
import bouquetsData from "../data/bouquets.json";
import fillersData from "../data/fillers.json";
import flowersData from "../data/flowers.json";
import ribbonsData from "../data/ribbons.json";
import wrappersData from "../data/wrappers.json";

// Pulls the `items` array from a JSON file and hides inactive (`active: false`) or out-of-stock (`stock === 0`) entries.
function readItems(jsonData, { includeInactive = false, onlyInStock = false } = {}) {
  const list = Array.isArray(jsonData?.items) ? jsonData.items : [];
  return list.filter((item) => {
    if (!includeInactive && item.active === false) return false;
    if (onlyInStock && item.stock === 0) return false;
    return true;
  });
}

// Gets active main flowers from flowers.json (for bouquet designer / flower picker). Note: `price` or `stock` can be null.
export function getFlowers(options = {}) {
  return readItems(flowersData, options);
}

// Gets active filler flowers and greenery from fillers.json (for bouquet designer).
export function getFillers(options = {}) {
  return readItems(fillersData, options);
}

// Gets wrappers from wrappers.json (falls back to placeholders while all items have `active: false`).
export function getWrappers(options = { includeInactive: true }) {
  const activeWrappers = readItems(wrappersData, { ...options, includeInactive: false });
  if (activeWrappers.length > 0 || !options.includeInactive) {
    return activeWrappers;
  }
  return readItems(wrappersData, { ...options, includeInactive: true });
}

// Gets active ribbons from ribbons.json (plain, design, or sheer).
export function getRibbons(options = {}) {
  return readItems(ribbonsData, options);
}

// Gets active add-ons from addons.json (stuffed toys and chocolates).
export function getAddons(options = {}) {
  return readItems(addonsData, options);
}

// Gets active preset bouquets and their price tiers from bouquets.json (for Browse/Feed).
export function getPresetBouquets(options = {}) {
  return readItems(bouquetsData, options);
}

// Returns all 6 inventory arrays in one object: `{ flowers, fillers, wrappers, ribbons, addons, bouquets }`.
export function getAllInventory(options = {}) {
  return {
    flowers: getFlowers(options),
    fillers: getFillers(options),
    wrappers: getWrappers(options),
    ribbons: getRibbons(options),
    addons: getAddons(options),
    bouquets: getPresetBouquets(options),
  };
}
