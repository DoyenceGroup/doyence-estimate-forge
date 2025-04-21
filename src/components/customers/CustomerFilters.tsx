
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { leadSourceOptions } from "./leadSourceOptions";

interface CustomerFiltersProps {
  hasActiveFilters: boolean;
  selectedLeadSources: string[];
  toggleLeadSourceFilter: (source: string) => void;
  filterDateAdded: [Date | undefined, Date | undefined];
  setFilterDateAdded: (range: [Date | undefined, Date | undefined]) => void;
  filterDateModified: [Date | undefined, Date | undefined];
  setFilterDateModified: (range: [Date | undefined, Date | undefined]) => void;
  resetFilters: () => void;
  renderDateLabel: (range: [Date | undefined, Date | undefined]) => string;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  hasActiveFilters,
  selectedLeadSources,
  toggleLeadSourceFilter,
  filterDateAdded,
  setFilterDateAdded,
  filterDateModified,
  setFilterDateModified,
  resetFilters,
  renderDateLabel
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Filter className="w-4 h-4 mr-2" /> 
          Filters
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 bg-background">
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="font-medium mb-2">Lead Sources</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {leadSourceOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`lead-source-${option.value}`} 
                    checked={selectedLeadSources.includes(option.value)}
                    onCheckedChange={() => toggleLeadSourceFilter(option.value)}
                  />
                  <label 
                    htmlFor={`lead-source-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1 text-muted-foreground">Date Added</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  {renderDateLabel(filterDateAdded)}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0 bg-background">
                <Calendar
                  mode="range"
                  selected={{
                    from: filterDateAdded[0],
                    to: filterDateAdded[1],
                  }}
                  onSelect={(range) => setFilterDateAdded([range?.from, range?.to])}
                  className={cn("p-3 pointer-events-auto")}
                />
                {(filterDateAdded[0] || filterDateAdded[1]) && (
                  <Button type="button" size="sm" variant="link" onClick={() => setFilterDateAdded([undefined, undefined])}>
                    Clear
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-xs mb-1 text-muted-foreground">Last Modified</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  {renderDateLabel(filterDateModified)}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0 bg-background">
                <Calendar
                  mode="range"
                  selected={{
                    from: filterDateModified[0],
                    to: filterDateModified[1],
                  }}
                  onSelect={(range) => setFilterDateModified([range?.from, range?.to])}
                  className={cn("p-3 pointer-events-auto")}
                />
                {(filterDateModified[0] || filterDateModified[1]) && (
                  <Button type="button" size="sm" variant="link" onClick={() => setFilterDateModified([undefined, undefined])}>
                    Clear
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={resetFilters}
              className="mt-2"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
