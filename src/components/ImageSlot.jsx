// shows photo with `src`
// default is grey box with an X

export default function ImageSlot({ src, alt = "", className = "" }) {
    if (src) return < img className={`slot ${className}`} src={src} alt={alt} />;
    return < div className={`slot slot--empty ${className}`} role="img" aria-label={alt || "Image placeholder"} />;
}