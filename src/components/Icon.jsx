import "./Icon.css";

export default function Icon({ src, size = 22 }) {
  return (
    <span
      className="icon"
      aria-hidden="true"
      style={{ "--icon-src": `url("${src}")`, width: size, height: size }}
    />
  );
}