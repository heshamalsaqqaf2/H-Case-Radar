"use client";

const visitors = [
  { id: "mace", name: "Группа MACE EVENT", year: 2022, count: 98, color: "bg-orange-500", initials: "ГМЕ", role: "Group" },
  { id: "individual", name: "Индивидуал ТА", year: 2022, count: 118, color: "bg-emerald-500", initials: "ИТ", role: "Individual" },
  { id: "service", name: "Служебная группа", year: 2022, count: 221, color: "bg-purple-500", initials: "СГ", role: "Group" },
];

export function MainVisitors() {
  return (
    <div className="scifi-card rounded-lg p-0 h-full overflow-hidden flex flex-col relative">
      <div className="p-4 pb-2 border-b border-[#00f2ff]/10 bg-linear-to-r from-[#00f2ff]/5 to-transparent">
        <h3 className="text-sm font-semibold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Main Visitors</h3>
      </div>
      <div className="flex-1 overflow-auto p-2 custom-scrollbar">
        <div className="space-y-2">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="flex items-center justify-between p-2 rounded hover:bg-linear-to-r hover:from-[#00f2ff]/10 hover:to-transparent transition-all duration-300 group border border-transparent hover:border-[#00f2ff]/20"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-[0_0_15px_rgba(0,0,0,0.3)] ring-2 ring-white/10 ${visitor.color}`}>
                  {visitor.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white group-hover:text-[#00f2ff] transition-colors drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">{visitor.name}</span>
                  <span className="text-[10px] text-slate-400">{visitor.role}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{visitor.count}</div>
                <div className="text-[10px] text-slate-500">{visitor.year}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
