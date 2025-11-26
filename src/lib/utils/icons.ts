// src/lib/utils/icons.ts
import {
  AlertTriangle,
  AlertTriangleIcon,
  DatabaseIcon,
  FileChartColumn,
  FileText,
  KeyRound,
  LayoutDashboard,
  type LucideIcon,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const ICON_MAP = {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  ScrollText,
  AlertTriangleIcon,
  FileText,
  DatabaseIcon,
  FileChartColumn,
  Settings,
} as const;

export type IconName = keyof typeof ICON_MAP;
export function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName as IconName] || LayoutDashboard;
}
