// components/complaints/complaints-filters.tsx
"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ComplaintPriority, ComplaintStatus } from "@/lib/complaints/types/type-complaints";

interface ComplaintsFiltersProps {
  filters: {
    search: string;
    status: ComplaintStatus | undefined;
    priority: ComplaintPriority | undefined;
    category: string;
    tags: string[];
  };
  onFiltersChange: (filters: ComplaintsFiltersProps["filters"]) => void;
}

const statusOptions: { value: ComplaintStatus; label: string }[] = [
  { value: "open", label: "مفتوحة" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "resolved", label: "تم الحل" },
  { value: "closed", label: "مغلقة" },
  { value: "unresolved", label: "لم تحل" },
  { value: "escalated", label: "مُصعّدة" },
  { value: "on_hold", label: "معلقة" },
  { value: "reopened", label: "أُعيد فتحها" },
];

const priorityOptions: { value: ComplaintPriority; label: string }[] = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "critical", label: "حرجة" },
];

const categoryOptions = ["فنية", "إدارية", "مالية", "خدمة عملاء", "منتجات", "أخرى"];

export function ComplaintsFilters({ filters, onFiltersChange }: ComplaintsFiltersProps) {
  const [tagInput, setTagInput] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : (value as ComplaintStatus),
    });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === "all" ? undefined : (value as ComplaintPriority),
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value === "all" ? "" : value });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      onFiltersChange({
        ...filters,
        tags: [...filters.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      status: undefined,
      priority: undefined,
      category: "",
      tags: [],
    });
  };

  const hasActiveFilters =
    filters.search || filters.status || filters.priority || filters.category || filters.tags.length > 0;

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">الفلاتر</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            مسح الكل
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">البحث</Label>
          <Input
            id="search"
            placeholder="ابحث عن شكوى..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">الأولوية</Label>
          <Select value={filters.priority || "all"} onValueChange={handlePriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأولويات</SelectItem>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">الفئة</Label>
          <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">الوسوم</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="أضف وسماً..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" onClick={handleAddTag}>
            إضافة
          </Button>
        </div>

        {filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
