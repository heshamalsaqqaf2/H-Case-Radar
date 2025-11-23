import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Shield,
} from "lucide-react";

export const COMPLAINT_CATEGORIES = [
  { id: "technical", name: "فنية", icon: "🔧" },
  { id: "administrative", name: "إدارية", icon: "📋" },
  { id: "financial", name: "مالية", icon: "💰" },
  { id: "customer_service", name: "خدمة عملاء", icon: "👥" },
  { id: "products", name: "منتجات", icon: "📦" },
  { id: "other", name: "أخرى", icon: "📌" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "low", label: "منخفضة", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "medium", label: "متوسطة", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "high", label: "عالية", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "critical", label: "حرجة", color: "bg-red-100 text-red-800 border-red-200" },
] as const;

export const STATUS_CONFIG = {
  open: {
    label: "مفتوحة",
    variant: "default" as const,
    icon: Clock,
    className: "bg-blue-500 hover:bg-blue-600"
  },
  in_progress: {
    label: "قيد التنفيذ",
    variant: "secondary" as const,
    icon: Activity,
    className: "bg-amber-500 hover:bg-amber-600 text-white"
  },
  resolved: {
    label: "تم الحل",
    variant: "default" as const,
    icon: CheckCircle2,
    className: "bg-green-500 hover:bg-green-600"
  },
  closed: {
    label: "مغلقة",
    variant: "outline" as const,
    icon: Shield,
    className: "border-gray-500 text-gray-500"
  },
  unresolved: {
    label: "لم تحل",
    variant: "destructive" as const,
    icon: AlertCircle,
    className: ""
  },
  escalated: {
    label: "مُصعّدة",
    variant: "secondary" as const,
    icon: AlertCircle,
    className: "bg-purple-500 hover:bg-purple-600 text-white"
  },
  on_hold: {
    label: "معلقة",
    variant: "outline" as const,
    icon: Clock,
    className: "border-yellow-500 text-yellow-600"
  },
  reopened: {
    label: "أُعيد فتحها",
    variant: "secondary" as const,
    icon: History,
    className: "bg-indigo-500 hover:bg-indigo-600 text-white"
  },
} as const;
