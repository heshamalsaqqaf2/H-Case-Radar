// src/app/admin/audit-logs/components/audit-logs-filters.tsx
/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuditLogFilters } from "@/lib/authorization/types/audit-log";
import { cn } from "@/lib/utils";

interface AuditLogsFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: Partial<AuditLogFilters>) => void;
  isLoading?: boolean;
}

const ENTITY_OPTIONS = [
  { value: "user", label: "المستخدمين" },
  { value: "role", label: "الأدوار" },
  { value: "permission", label: "الصلاحيات" },
  { value: "auth", label: "المصادقة" },
  { value: "system", label: "النظام" },
  { value: "security", label: "الأمان" },
];

const ACTION_OPTIONS = [
  { value: "auth.login.success", label: "تسجيل دخول ناجح" },
  { value: "auth.login.failed", label: "تسجيل دخول فاشل" },
  { value: "user.create", label: "إنشاء مستخدم" },
  { value: "user.update", label: "تحديث مستخدم" },
  { value: "user.delete", label: "حذف مستخدم" },
  { value: "role.create", label: "إنشاء دور" },
  { value: "role.update", label: "تحديث دور" },
];

const SEVERITY_OPTIONS = [
  { value: "info", label: "معلومات" },
  { value: "low", label: "منخفض" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "عالي" },
  { value: "critical", label: "حرج" },
];

const STATUS_OPTIONS = [
  { value: "success", label: "ناجح" },
  { value: "failure", label: "فاشل" },
  { value: "warning", label: "تحذير" },
];

export function AuditLogsFilters({ filters, onFiltersChange, isLoading }: AuditLogsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      key !== "page" && key !== "perPage" && key !== "filterMode" && filters[key as keyof AuditLogFilters],
  ).length;

  const handleSearch = (value: string) => {
    setSearchInput(value);
    onFiltersChange({ search: value });
  };

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    onFiltersChange({ [field]: date ? date.toISOString() : undefined });
  };

  const clearFilter = (field: keyof AuditLogFilters) => {
    onFiltersChange({ [field]: undefined });

    if (field === "search") {
      setSearchInput("");
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: undefined,
      entity: undefined,
      action: undefined,
      userId: undefined,
      severity: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    setSearchInput("");
  };

  return (
    <div className="space-y-4">
      {/* البحث السريع */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في السجلات (الكيان، النشاط، الوصف)..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pr-10"
            disabled={isLoading}
          />
        </div>

        <Button
          variant={isExpanded ? "default" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          الفلترة
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* الفلترة المتقدمة */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          {/* الكيان */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الكيان</label>
            <Select
              value={filters.entity || ""}
              onValueChange={(value) => onFiltersChange({ entity: value || undefined })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع الكيانات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الكيانات</SelectItem>
                {ENTITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* النشاط */}
          <div className="space-y-2">
            <label className="text-sm font-medium">النشاط</label>
            <Select
              value={filters.action || ""}
              onValueChange={(value) => onFiltersChange({ action: value || undefined })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع الأنشطة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنشطة</SelectItem>
                {ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* مستوى الخطورة */}
          <div className="space-y-2">
            <label className="text-sm font-medium">مستوى الخطورة</label>
            <Select
              value={filters.severity || ""}
              onValueChange={(value) => onFiltersChange({ severity: value || undefined })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع المستويات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                {SEVERITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الحالة */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الحالة</label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) => onFiltersChange({ status: value || undefined })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* تاريخ البدء */}
          <div className="space-y-2">
            <label className="text-sm font-medium">من تاريخ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground",
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    format(new Date(filters.startDate), "yyyy-MM-dd", { locale: ar })
                  ) : (
                    <span>اختر التاريخ</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(date) => handleDateChange("startDate", date)}
                  disabled={isLoading}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* تاريخ الانتهاء */}
          <div className="space-y-2">
            <label className="text-sm font-medium">إلى تاريخ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground",
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(new Date(filters.endDate), "yyyy-MM-dd", { locale: ar })
                  ) : (
                    <span>اختر التاريخ</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(date) => handleDateChange("endDate", date)}
                  disabled={isLoading}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* المستخدم */}
          <div className="space-y-2">
            <label className="text-sm font-medium">معرف المستخدم</label>
            <Input
              placeholder="أدخل معرف المستخدم"
              value={filters.userId || ""}
              onChange={(e) => onFiltersChange({ userId: e.target.value || undefined })}
              disabled={isLoading}
            />
          </div>

          {/* الإجراءات */}
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={isLoading || activeFiltersCount === 0}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              مسح الكل
            </Button>
          </div>
        </div>
      )}

      {/* الفلاتر النشطة */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.entity && filters.entity !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              الكيان: {ENTITY_OPTIONS.find((e) => e.value === filters.entity)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("entity")} />
            </Badge>
          )}

          {filters.action && filters.action !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              النشاط: {ACTION_OPTIONS.find((a) => a.value === filters.action)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("action")} />
            </Badge>
          )}

          {filters.severity && filters.severity !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              الخطورة: {SEVERITY_OPTIONS.find((s) => s.value === filters.severity)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("severity")} />
            </Badge>
          )}

          {filters.status && filters.status !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              الحالة: {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("status")} />
            </Badge>
          )}

          {filters.startDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              من: {format(new Date(filters.startDate), "yyyy-MM-dd", { locale: ar })}
              <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("startDate")} />
            </Badge>
          )}

          {filters.endDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              إلى: {format(new Date(filters.endDate), "yyyy-MM-dd", { locale: ar })}
              <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("endDate")} />
            </Badge>
          )}

          {filters.userId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              المستخدم: {filters.userId}
              <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("userId")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
