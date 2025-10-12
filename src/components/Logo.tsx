import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <div className="flex items-center px-4 py-4 select-none">
      <Link
        to="/"
        className="font-mono font-thin text-3xl font-serif italic"
        style={{ color: "var(--primary-green)" }}>
        <h1 aria-label="Wiener Grünflächen Index" className="tracking-tight">
          <span className="tracking-tight">wgf</span>
          <span className="relative font-mono font-[300] not-italic text-2xl -ml-0.5">index</span>
        </h1>
      </Link>
    </div>
  );
};

export default Logo;
