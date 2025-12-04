// export componants div effect-card
export const EffectCard = () => {
  return (
    <div className="group">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-size-[20px_20px]" />

      <div className="absolute inset-0 bg-linear-to-b from-emerald-500/30 via-emerald-600/5 to-transparent opacity-50 group-hover:opacity-40 transition-opacity duration-500" />

      <div className="absolute top-0 right-0 w-4 h-9 border-t border-r border-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 255, 0.9))' }} />
      <div className="absolute bottom-0 left-0 w-4 h-8 border-b border-l border-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 255, 0.9))' }} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] bg-linear-to-l from-emerald-500 to-lime-500 shadow-[0_0_10px_rgba(0,242,255,0.8)] z-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/5 h-[2px] bg-linear-to-l from-lime-500 to-emerald-500 shadow-[0_0_10px_rgba(0,242,255,0.8)] z-20" />

    </div>
  );
}
