const Wordmark = () => {
  return (
    <p
      className="text-[12px] leading-tight italic opacity-70 pointer-events-none select-none"
      style={{ color: "var(--primary-green)", fontFamily: " Instrument Serif, serif" }}>
      Wiener
      <br /> Grünflächen <br />
      <span className="font-mono font-semibold not-italic text-[0.8em] uppercase">Index</span>
    </p>
  );
};

export default Wordmark;
