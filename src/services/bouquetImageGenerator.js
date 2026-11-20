// bouquetImageGenerator.js — builds a free AI bouquet image URL from user picks

// ---------- prompt builder ----------
// Formats selected flowers, fillers, wrapper, ribbon, and add-ons into an image prompt
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

// ---------- URL generator ----------
// Returns a Pollinations image URL ready for <img src={...} />
export function generateBouquetImageUrl(
  draftBouquet = {},
  { width = 512, height = 512, seed = 42 } = {}
) {
  const prompt = buildBouquetImagePrompt(draftBouquet);
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}
