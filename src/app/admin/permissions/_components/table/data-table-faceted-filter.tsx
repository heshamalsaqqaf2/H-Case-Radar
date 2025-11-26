"use client";

import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import type { Column } from "@tanstack/react-table";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  // إحصائيات الخيارات
  const optionsWithCounts = useMemo(() => {
    return options
      .map((option) => ({
        ...option,
        count: facets?.get(option.value) || 0,
      }))
      .filter((option) => option.count > 0) // إخفاء الخيارات الفارغة
      .sort((a, b) => b.count - a.count); // ترتيب تنازلي حسب العدد
  }, [options, facets]);

  const hasSelections = selectedValues?.size > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed relative"
        >
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {hasSelections && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1 font-normal max-w-20 truncate"
                          title={option.label}
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title?.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {optionsWithCounts.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary shrink-0",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className={cn("h-4 w-4")} />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate flex-1" title={option.label}>
                        {option.label}
                      </span>
                    </div>
                    <span className="ml-2 flex h-4 w-4 items-center justify-center font-mono text-xs text-muted-foreground shrink-0">
                      {option.count}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {hasSelections && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center cursor-pointer"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
