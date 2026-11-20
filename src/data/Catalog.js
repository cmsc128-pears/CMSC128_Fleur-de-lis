// -------------------------------------------------------------------------
//  catalog.js
//  Shared by flowerCatalog.js and fillerCatalog.js. Turns a list of JSON records
//  into what a "Pick your ..." step needs:
//    items           the cards, shaped like the old CATALOG items, most common first
//    filterGroups    the sections + options in the Filter dropdown (built from the JSON)
//    quickTags       the swipeable tag pills under the search bar (built from the JSON)
//    filter()        applies the search text + selected filters to the cards
//
//  Add or edit a record in the JSON and everything here updates by itself.
// -------------------------------------------------------------------------

// nicer names for occasion values. anything not listed falls back to Title Case.
const OCCASION_LABELS = {
    "just-because": "Just Because",
    birthday: "Birthdays",
    anniversary: "Anniversary",
    valentines: "Valentine's Day",
    "mothers-day": "Mother's Day",
    wedding: "Weddings",
    graduation: "Graduation",
    "get-well": "Get Well",
    congratulations: "Congratulations",
    housewarming: "Housewarming",
    undas: "Undas",
    funeral: "Funeral",
};

// extra words people might type that the JSON doesn't contain
const SEARCH_ALIASES = {
    romantic: ["romance"],
    loving: ["love"],
};

const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const titleCase = (value) => value.split(/[-\s]+/).map(cap).join(" ");
const occasionLabel = (value) => OCCASION_LABELS[value] ?? titleCase(value);

// lowercase, no apostrophes, punctuation turned into spaces ("mother's day" -> "mothers day")
const normalize = (text) =>
    text.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// which JSON field feeds each filter section. a section with no values in the JSON is left out
// (for example Type in fillers.json, where every `type` is still null).
const GROUPS = [
    { key: "occasion", title: "Occasion", values: (f) => f.occasion ?? [],              label: occasionLabel },
    { key: "mood",     title: "Mood",     values: (f) => f.mood ?? [],                  label: titleCase },
    { key: "color",    title: "Color",    values: (f) => f.colors,                      label: titleCase },
    { key: "type",     title: "Type",     values: (f) => (f.type ? [f.type] : []),      label: titleCase },
    { key: "origin",   title: "Origin",   values: (f) => (f.origin ? [f.origin] : []),  label: titleCase },
];

const valuesOf = Object.fromEntries(GROUPS.map((g) => [g.key, g.values]));

// the first tag pills, matching the wireframe. the rest are every other occasion in the JSON.
const FIRST_TAGS = [
    { group: "occasion", value: "just-because", label: "Just Because" },
    { group: "mood",     value: "romantic",     label: "Romance" },
    { group: "occasion", value: "birthday",     label: "Birthdays" },
];

export const EMPTY_FILTERS = Object.fromEntries(GROUPS.map((g) => [g.key, []]));
export const EMPTY_SEARCH = { query: "", filters: EMPTY_FILTERS };

// a typed word matches if a word of the item starts with it. "roses" also matches "rose".
const wordMatches = (words, term) =>
    words.some((w) => w.startsWith(term)) ||
    (term.length > 3 && term.endsWith("s") && words.some((w) => w.startsWith(term.slice(0, -1))));

/*
    rawItems   the `items` array from a JSON file
    sortKey    (record) => text used to rank the cards, e.g. (f) => f.family
    order      list of those texts, most common first. anything not listed goes last,
               and records with the same rank keep their order in the JSON
    keywords   optional { "Name": ["other", "words"] } people may type that the JSON lacks
*/
export function buildCatalog(rawItems, { sortKey, order = [], keywords = {} }) {
    const searchIndex = new Map(); // id -> list of searchable words

    const toCatalogItem = (f) => {
        const colors = f.color ?? [];
        const moods = f.mood ?? [];
        const occasions = f.occasion ?? [];

        searchIndex.set(
            f.id,
            normalize(
                [
                    f.name,
                    ...(keywords[f.name] ?? []),
                    f.family?.replace(/-/g, " "),
                    ...colors,
                    ...moods,
                    ...moods.flatMap((m) => SEARCH_ALIASES[m] ?? []),
                    ...occasions,
                    ...occasions.map(occasionLabel),
                    f.type,
                    f.origin,
                    f.description,
                ]
                    .filter(Boolean)
                    .join(" ")
            ).split(" ")
        );

        return {
            ...f,                                         // keeps every JSON field (stock, bundlePrice, ...)
            color: colors.map(cap).join(", "),            // old shape: one display string, e.g. "Red, Pink"
            colors,                                       // the raw array, used for filtering
            tags: [...moods, ...colors].map(titleCase),   // old shape: array of tag labels
        };
    };

    const rank = (f) => {
        const i = order.indexOf(sortKey(f));
        return i === -1 ? order.length : i;
    };

    const items = rawItems
        .filter((f) => f.active && f.stock !== 0)         // hides inactive entries and out-of-stock ones
        .map((f, index) => ({ f, index }))
        .sort((a, b) => rank(a.f) - rank(b.f) || a.index - b.index)
        .map(({ f }) => toCatalogItem(f));

    // options per section, most used first, only values that exist in the JSON
    const filterGroups = GROUPS.map(({ key, title, values, label }) => {
        const counts = new Map();
        items.forEach((f) => values(f).forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1)));
        const options = [...counts.entries()]
            .sort((a, b) => b[1] - a[1] || label(a[0]).localeCompare(label(b[0])))
            .map(([value]) => ({ value, label: label(value) }));
        return { key, title, options };
    }).filter((g) => g.options.length > 0);

    const occasionOptions = filterGroups.find((g) => g.key === "occasion")?.options ?? [];

    const quickTags = [
        ...FIRST_TAGS,
        ...occasionOptions
            .filter((o) => !FIRST_TAGS.some((t) => t.group === "occasion" && t.value === o.value))
            .map((o) => ({ group: "occasion", value: o.value, label: o.label })),
    ].filter((tag) => items.some((f) => valuesOf[tag.group](f).includes(tag.value))); // drop tags nothing uses

    // within one section the picks are OR (red OR pink); between sections and the search box they are AND
    const filter = (list, { query, filters }) => {
        const terms = normalize(query).split(" ").filter(Boolean);

        return list.filter((f) => {
            for (const { key } of GROUPS) {
                const picked = filters[key];
                if (picked.length && !valuesOf[key](f).some((v) => picked.includes(v))) return false;
            }
            const words = searchIndex.get(f.id) ?? [];
            return terms.every((term) => wordMatches(words, term));
        });
    };

    return { items, filterGroups, quickTags, filter };
}