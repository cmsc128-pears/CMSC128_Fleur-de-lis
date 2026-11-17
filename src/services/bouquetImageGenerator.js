// ------------------------------------------------------------------
// bouquetImageGenerator.js — Free AI bouquet image generator
// Uses Pollinations.ai to generate a bouquet preview image URL from
// `draftBouquet` selections without requiring an API key or billing.
// ------------------------------------------------------------------

// Builds a descriptive florist prompt from the user's current bouquet items.
// TODO: Verify property names (`flowers`, `fillers`, `wrapper`, `ribbon`, `addOns`)
// match the shared `draftBouquet` state once all 4 customization steps are wired.
export function buildBouquetImagePrompt(draftBouquet = {}) {
  const items = draftBouquet?.items || {};

  const flowers = (items.flowers || [])
    .map((f) => `${f.quantity || 1} ${f.color ? `${f.color} ` : ""}${f.name}`)
    .join(", ");

  const fillers = (items.fillers || [])
    .map((f) => f.name)
    .join(", ");

  const wrapper = items.wrapper
    ? `${items.wrapper.color || ""} ${items.wrapper.name || items.wrapper.type || "paper"} wrapper`.trim()
    : "cream kraft paper wrapper";

  const ribbon = items.ribbon
    ? `tied with a ${items.ribbon.color || ""} ${items.ribbon.name || "satin"} ribbon`.trim()
    : "tied with a soft satin ribbon";

  const addOns = (items.addOns || [])
    .map((a) => a.selectedOption || a.name)
    .join(", ");

  const mainSubject = flowers
    ? `A realistic florist hand-tied bouquet featuring ${flowers}`
    : "A realistic florist hand-tied mixed flower bouquet";

  const fillerPhrase = fillers ? `, accented with ${fillers} fillers` : "";
  const addOnPhrase = addOns ? `, accompanied by ${addOns}` : "";

  return `${mainSubject}${fillerPhrase}, wrapped in ${wrapper}, ${ribbon}${addOnPhrase}, centered product photography on a soft warm cream background, natural studio lighting, high detail`;
}

// Returns a direct image URL that can be passed into `<img src={...} />`.
export function generateBouquetImageUrl(
  draftBouquet = {},
  { width = 512, height = 512, seed = 42 } = {}
) {
  const prompt = buildBouquetImagePrompt(draftBouquet);
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}
