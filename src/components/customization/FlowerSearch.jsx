import { useCallback, useEffect, useRef, useState } from "react";
import "./FlowerSearch.css";

/*
    Search bar + swipeable tag pills + Filter dropdown. Used on the flowers and fillers steps.

    It owns no results. The parent keeps `search` ({ query, filters }) and runs
    filterFlowers() on it, so the grid and this component always agree.
      search      { query: string, filters: { occasion: [], mood: [], color: [], type: [], origin: [] } }
      onChange    called with the next search object
      resultCount number of items matching right now (for the dropdown button)
      groups      the Filter dropdown sections, e.g. FILTER_GROUPS from flowerCatalog.js
      tags        the swipeable tag pills, e.g. QUICK_TAGS from flowerCatalog.js
      nounOne / nounMany   wording for the counts ("flower" / "flowers")
*/

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
    </svg>
);

const FilterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />
    </svg>
);

const ChevronIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
    </svg>
);

export default function FlowerSearch({ search, onChange, resultCount, groups, tags, nounOne = "flower", nounMany = "flowers" }) {
    const { query, filters } = search;

    const [draft, setDraft] = useState(query);           // what is typed, applied on Search / Enter
    const [open, setOpen]   = useState(false);           // filter dropdown
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [panelMax, setPanelMax] = useState(null);     // dropdown height that fits inside the drawer

    const wrapRef = useRef(null);
    const tagsRef = useRef(null);
    const filterBtnRef = useRef(null);

    // keep the text box in step when the parent changes the query (e.g. "Clear search and filters").
    // React's recommended way: compare with the previous value during render, no effect needed.
    const [prevQuery, setPrevQuery] = useState(query);
    if (query !== prevQuery) {
        setPrevQuery(query);
        setDraft(query);
    }

    // show the chevron only while there are more tags to swipe to
    useEffect(() => {
        const el = tagsRef.current;
        const update = () =>
            setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
        el.addEventListener("scroll", update, { passive: true });
        const ro = new ResizeObserver(update);   // also fires once when it starts watching
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", update);
            ro.disconnect();
        };
    }, []);

    // the drawer body clips anything that sticks out of it, so size the dropdown to the room
    // left below the tags. its own list scrolls and the footer button stays visible.
    const measurePanel = useCallback(() => {
        const wrap = wrapRef.current;
        const body = wrap?.closest(".drawer__body");
        if (!body) return setPanelMax(null);              // not inside the drawer: CSS max-height applies
        const room = body.getBoundingClientRect().bottom - wrap.getBoundingClientRect().bottom - 8;
        setPanelMax(Math.min(Math.max(room, 200), window.innerHeight * 0.6));
    }, []);

    const toggleOpen = () => {
        if (!open) measurePanel();                        // measured on the tap, before the dropdown shows
        setOpen((o) => !o);
    };

    // while open, measure again after the drawer's 0.25s slide and whenever the window resizes
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(measurePanel, 300);
        window.addEventListener("resize", measurePanel);
        return () => {
            clearTimeout(t);
            window.removeEventListener("resize", measurePanel);
        };
    }, [open, measurePanel]);

    // close the dropdown on outside tap or Escape
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => {
            if (!wrapRef.current?.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setOpen(false);
                filterBtnRef.current?.focus();
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        onChange({ ...search, query: draft.trim() });
    };

    // emptying the box (typing or the browser's clear button) resets the results right away
    const handleInput = (e) => {
        const value = e.target.value;
        setDraft(value);
        if (value === "" && query !== "") onChange({ ...search, query: "" });
    };

    const isOn = (group, value) => filters[group].includes(value);

    const toggle = (group, value) => {
        const current = filters[group];
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onChange({ ...search, filters: { ...filters, [group]: next } });
    };

    const clearFilters = () =>
        onChange({ ...search, filters: Object.fromEntries(Object.keys(filters).map((k) => [k, []])) });

    const activeCount = Object.values(filters).reduce((n, list) => n + list.length, 0);

    const swipeTags = () => {
        const el = tagsRef.current;
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollBy({ left: el.clientWidth * 0.7, behavior: calm ? "auto" : "smooth" });
    };

    return (
        <section className="fs" ref={wrapRef} aria-label={`Search and filter ${nounMany}`}>
            <form className="fs__search" role="search" onSubmit={submit}>
                <SearchIcon />
                <label className="sr-only" htmlFor="fs-query">Search {nounMany}</label>
                <input
                    id="fs-query"
                    className="fs__input"
                    type="search"
                    value={draft}
                    onChange={handleInput}
                    placeholder="Search by color, mood, or occasion"
                    enterKeyHint="search"
                    autoComplete="off"
                />
                <button type="submit" className="btn fs__search-btn">Search</button>
            </form>

            <div className="fs__row">
                <div
                    ref={tagsRef}
                    className={`fs__tags${canScrollRight ? " has-more" : ""}`}
                    role="group"
                    aria-label="Quick tags"
                >
                    {tags.map(({ group, value, label }) => (
                        <button
                            key={`${group}:${value}`}
                            type="button"
                            className="fs-chip"
                            aria-pressed={isOn(group, value)}
                            onClick={() => toggle(group, value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* hint that the tags swipe sideways. tapping it scrolls too */}
                <button
                    type="button"
                    className="fs__more"
                    aria-label="Show more tags"
                    aria-hidden={!canScrollRight}
                    tabIndex={canScrollRight ? 0 : -1}
                    onClick={swipeTags}
                >
                    <ChevronIcon />
                </button>

                <button
                    ref={filterBtnRef}
                    type="button"
                    className="btn btn--secondary fs__filter"
                    aria-expanded={open}
                    aria-controls="fs-panel"
                    onClick={toggleOpen}
                >
                    <FilterIcon />
                    Filter
                    {activeCount > 0 && (
                        <span className="fs__badge" aria-label={`${activeCount} selected`}>{activeCount}</span>
                    )}
                </button>
            </div>

            {open && (
                <div
                    id="fs-panel"
                    className="fs__panel"
                    role="group"
                    aria-label={`Filter ${nounMany}`}
                    style={panelMax ? { maxHeight: panelMax } : undefined}
                >
                    <div className="fs__panel-body">
                        {groups.map(({ key, title, options }) => (
                            <div key={key} role="group" aria-labelledby={`fs-group-${key}`}>
                                <h3 id={`fs-group-${key}`} className="fs__group-title">{title}</h3>
                                <div className="fs__pills">
                                    {options.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className="fs-chip"
                                            aria-pressed={isOn(key, value)}
                                            onClick={() => toggle(key, value)}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="fs__panel-foot">
                        <button type="button" className="link" disabled={activeCount === 0} onClick={clearFilters}>
                            Clear filters
                        </button>
                        <button type="button" className="btn" disabled={resultCount === 0} onClick={() => setOpen(false)}>
                            {resultCount === 0
                                ? "No matches"
                                : `Show ${resultCount} ${resultCount === 1 ? nounOne : nounMany}`}
                        </button>
                    </div>
                </div>
            )}

            <p className="sr-only" aria-live="polite">
                {resultCount} {resultCount === 1 ? nounOne : nounMany} shown
            </p>
        </section>
    );
}