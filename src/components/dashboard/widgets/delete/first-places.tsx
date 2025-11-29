"use client";

const places = [
  { name: "Офисы", value: 605.51, percent: 30.5 },
  { name: "Дома", value: 113.96, percent: 10.2 },
  { name: "Рестораны", value: 781.24, percent: 5.2 },
  { name: "Общественный транспорт", value: 642.33, percent: 4.8 },
  { name: "Магазины", value: 311.25, percent: 5.7 },
];

export function FirstPlaces() {
  return (
    <div className="scifi-card rounded-lg p-0 h-full overflow-hidden flex flex-col relative">
      <div className="p-4 pb-2 border-b border-[#00f2ff]/10 bg-linear-to-r from-[#00f2ff]/5 to-transparent">
        <h3 className="text-sm font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">First Places</h3>
      </div>
      <div className="flex-1 overflow-auto p-2 custom-scrollbar">
        <div className="space-y-1">
          {places.map((place) => (
            <div
              key={place.name}
              className="flex items-center justify-between p-2 rounded hover:bg-linear-to-r hover:from-[#00f2ff]/10 hover:to-transparent transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#00f2ff]/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[#111c2a] flex items-center justify-center text-[10px] font-bold text-[#00f2ff] border border-[#00f2ff]/20 group-hover:border-[#00f2ff] group-hover:shadow-[0_0_10px_rgba(0,242,255,0.4)] transition-all">
                  {places.indexOf(place) + 1}
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors font-medium">{place.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#00f2ff] drop-shadow-[0_0_3px_rgba(0,242,255,0.5)]">{place.value}</span>
                <span className="text-[10px] text-slate-400 bg-[#111c2a] px-1.5 py-0.5 rounded border border-white/5">{place.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
