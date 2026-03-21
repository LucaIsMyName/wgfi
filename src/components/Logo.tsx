import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <div className="flex items-center px-4 py-4 select-none">
      <Link
        to="/"
        className="text-primary-green font-mono font-thin text-3xl font-serif italic"
      >
        <h1
          aria-label="Wiener Grünflächen Index"
          className="tracking-tight flex items-center"
        >
          <div className="tracking-tight translate-y-0.5">wgf</div>
          <div className="relative font-mono font-[300] not-italic text-2xl -ml-0.5">
            index
          </div>
        </h1>
      </Link>
    </div>
  );
};

export default Logo;
