const Wordmark = () => {
  return (
    <p
      className="text-xs italic opacity-70 pointer-events-none select-none"
      style={{ color: "var(--primary-green)", fontFamily: "EB Garamond, serif" }}>
      Wiener
      <br /> Grünflächen <br />
      <span className="font-mono font-semibold not-italic text-[0.8em] uppercase">Index</span>
    </p>
  );
};

export default Wordmark;
