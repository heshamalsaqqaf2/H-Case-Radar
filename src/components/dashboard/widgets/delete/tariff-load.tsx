"use client";

const tariffs = [
  { label: "Основной тариф", subLabel: "повышение цен", value: 1341, max: 2000, color: "bg-[#00f2ff]" },
  { label: "Основной NEW тариф", subLabel: "повышение цен", value: 23, max: 100, color: "bg-[#00f2ff]" },
  { label: "WEB_Мир 10%", subLabel: "", value: 314, max: 500, color: "bg-[#10b981]" },
  { label: "WEB_Card 5%", subLabel: "", value: 835, max: 1000, color: "bg-[#10b981]" },
];

export function TariffLoad() {
  return (
    <div className="scifi-card rounded-lg p-4 h-full flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Tariff Load</h3>
        <span className="text-xs text-[#00f2ff] bg-[#00f2ff]/10 px-2 py-0.5 rounded border border-[#00f2ff]/30 shadow-[0_0_10px_rgba(0,242,255,0.2)]">Monthly</span>
      </div>

      <div className="space-y-5 relative z-10">
        {tariffs.map((tariff, index) => (
          <div key={tariff.label} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">{tariff.label}</span>
              <span className="text-white font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{tariff.value}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b] shadow-inner">
              <div
                className="h-full rounded-full relative transition-all duration-1000 ease-out"
                style={{
                  width: `${(tariff.value / tariff.max) * 100}%`,
                  background: index % 2 === 0
                    ? 'linear-gradient(90deg, #00f2ff 0%, #2dd4bf 100%)'
                    : 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  boxShadow: index % 2 === 0
                    ? '0 0 12px rgba(0, 242, 255, 0.5)'
                    : '0 0 12px rgba(16, 185, 129, 0.5)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2ff]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#10b981]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
    </div>
  );
}
