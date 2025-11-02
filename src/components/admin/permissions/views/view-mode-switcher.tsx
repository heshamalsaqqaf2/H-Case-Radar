// src/components/admin/permissions/view-mode-switcher.tsx
"use client";

import { Layers, LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types/permission";

interface ViewModeSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const viewModes: {
  value: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "table", label: "Table", icon: Table },
  { value: "card", label: "Card", icon: LayoutGrid },
  { value: "group", label: "Grouped", icon: Layers },
];

export function ViewModeSwitcher({
  viewMode,
  onViewModeChange,
}: ViewModeSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-slate-700/50 p-1 backdrop-blur-sm">
      {viewModes.map((mode) => {
        const Icon = mode.icon;
        return (
          <Button
            key={mode.value}
            variant={viewMode === mode.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange(mode.value)}
            className={cn(
              "h-7 gap-1.5 px-2.5 text-xs font-medium text-slate-300 transition-all",
              viewMode === mode.value && "bg-slate-600 text-white shadow-sm",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{mode.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
