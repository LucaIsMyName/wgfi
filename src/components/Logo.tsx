import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <div className="flex items-center px-4 py-4">
      <Link
        to="/"
        className="font-mono font-thin text-3xl font-serif italic"
        style={{ color: "var(--primary-green)" }}>
        <h1 aria-label="Wiener Parks Index">
          <span className="tracking-tight">wgf</span><span className="font-mono font-[300] not-italic text-2xl">index</span>
        </h1>
      </Link>
    </div>
  );
};

export default Logo;
