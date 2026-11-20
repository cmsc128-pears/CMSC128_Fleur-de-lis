// -------------------------------------------------------------------------
//  fillerCatalog.js
//  Reads fillers.json for the "Pick your fillers" step. The work is done in catalog.js.
// -------------------------------------------------------------------------
import fillersData from "./fillers.json";
import { buildCatalog } from "./catalog";

// "Most common first". fillers.json has no family or popularity, so this list sets the
// order of the cards by name. Fillers not listed here go last, in JSON order.
// Edit this list to reorder, or swap it for a real sales number later.
const NAME_ORDER = [
    "Gypso",
    "Eucalyptus",
    "Statice",
    "Chamomile",
    "Rice Flower",
    "Aster",
    "Goldenrod",
    "Yucca",
    "Misty",
];

// other names customers use, so searching them finds the filler
const KEYWORDS = {
    Gypso: ["jepsu", "gypsophila", "babys breath"],
};

const catalog = buildCatalog(fillersData.items, {
    sortKey: (f) => f.name,
    order: NAME_ORDER,
    keywords: KEYWORDS,
});

export const FILLERS = catalog.items;
export const FILLER_FILTER_GROUPS = catalog.filterGroups;
export const FILLER_QUICK_TAGS = catalog.quickTags;
export const filterFillers = catalog.filter;