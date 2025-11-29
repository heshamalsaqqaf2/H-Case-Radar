"use client";

const metrics = [
  { id: "guests", label: "Гостей", value: "27 тыс.", subLabel: "Guests" },
  { id: "rooms", label: "Комнат", value: "10 тыс.", subLabel: "Rooms" },
  { id: "adults", label: "Взрослых", value: "23 тыс.", subLabel: "Adults" },
  { id: "children", label: "Детей", value: "21 тыс.", subLabel: "Children" },
  { id: "men", label: "Мужчин", value: "34 тыс.", subLabel: "Men" },
  { id: "avg_age_1", label: "Средний возраст", value: "31.9", subLabel: "Avg Age" },
  { id: "women", label: "Женщин", value: "5 959", subLabel: "Women" },
  { id: "avg_age_2", label: "Средний возраст", value: "31.9", subLabel: "Avg Age" },
  { id: "unspecified", label: "Не указан пол", value: "3 429", subLabel: "Unspecified" },
];

export function MetricsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="scifi-card rounded-xl p-3 flex flex-col justify-center items-center text-center h-[80px] relative overflow-hidden group hover:bg-[#0f766e]/10 transition-all"
        >
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 group-hover:text-white transition-colors">
            {metric.label}
          </div>
          <div className="text-xl font-bold bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(45,212,191,0.2)]">
            {metric.value}
          </div>

          {/* Bottom Gradient Line */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#00f2ff]/50 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />

          {/* Top Highlight */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
}
