// -------------------------------------------------------------------------
//  flowerCatalog.js
//  Reads flowers.json for the "Pick your flowers" step. The work is done in catalog.js.
// -------------------------------------------------------------------------
import flowersData from "./flowers.json";
import { buildCatalog, EMPTY_FILTERS, EMPTY_SEARCH } from "./Catalog";

// "Most common first". The JSON has no popularity number, so this list sets the
// order of the cards by `family`. Flowers in the same family keep their order in
// the JSON. Families not listed here go last, also in JSON order.
// Edit this list to reorder, or swap it for a real sales number later.
const FAMILY_ORDER = [
    "rose",
    "lily",
    "carnation",
    "sunflower",
    "tulip",
    "chrysanthemum",
    "gerbera",
    "hydrangea",
    "calla-lily",
    "anthurium",
];

const catalog = buildCatalog(flowersData.items, {
    sortKey: (f) => f.family,
    order: FAMILY_ORDER,
});

export const FLOWERS = catalog.items;
export const FILTER_GROUPS = catalog.filterGroups;
export const QUICK_TAGS = catalog.quickTags;
export const filterFlowers = catalog.filter;
export { EMPTY_FILTERS };
export const EMPTY_FLOWER_SEARCH = EMPTY_SEARCH;