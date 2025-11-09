// src/lib/utils/icons.ts
import {
  BarChart3,
  KeyRound,
  LayoutDashboard,
  type LucideIcon,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";

// تعريف خريطة الأيقونات
export const ICON_MAP = {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  ScrollText,
  BarChart3,
} as const;

// نوع لأسماء الأيقونات
export type IconName = keyof typeof ICON_MAP;

// دالة مساعدة للحصول على الأيقونة
export function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName as IconName] || LayoutDashboard;
}
