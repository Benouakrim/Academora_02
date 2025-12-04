import { ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSearchStore } from "@/store/useSearchStore";
import type { SortOption } from "@/store/useSearchStore";

interface SortConfig {
  value: SortOption;
  label: string;
  category: "relevance" | "cost" | "ranking" | "selectivity" | "name";
}

const SORT_OPTIONS: SortConfig[] = [
  { value: "matchPercentage", label: "Best Match", category: "relevance" },
  { value: "tuition_asc", label: "Tuition: Low to High", category: "cost" },
  { value: "tuition_desc", label: "Tuition: High to Low", category: "cost" },
  { value: "ranking_asc", label: "Ranking: Best First", category: "ranking" },
  { value: "ranking_desc", label: "Ranking: Lowest First", category: "ranking" },
  { value: "acceptanceRate_asc", label: "Most Selective", category: "selectivity" },
  { value: "acceptanceRate_desc", label: "Least Selective", category: "selectivity" },
  { value: "name_asc", label: "Name: A to Z", category: "name" },
  { value: "name_desc", label: "Name: Z to A", category: "name" },
];

const CATEGORY_LABELS = {
  relevance: "Relevance",
  cost: "Tuition",
  ranking: "Ranking",
  selectivity: "Selectivity",
  name: "Alphabetical",
};

const getSortIcon = (sortOption: SortOption) => {
  if (sortOption === "matchPercentage") {
    return <ArrowUpDown className="w-3 h-3 ml-1 inline" />;
  }
  if (sortOption.endsWith("_asc")) {
    return <ArrowUp className="w-3 h-3 ml-1 inline" />;
  }
  return <ArrowDown className="w-3 h-3 ml-1 inline" />;
};

export function SortDropdown() {
  const { criteria, setSortBy } = useSearchStore();
  const currentSort = criteria.sortBy;
  
  const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || "Best Match";

  const groupedOptions = SORT_OPTIONS.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, SortConfig[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-between">
          <span className="flex items-center">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {currentLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(groupedOptions).map(([category, options], idx) => (
          <div key={category}>
            {idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
            </DropdownMenuLabel>
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={currentSort === option.value ? "bg-accent" : ""}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    {option.label}
                    {getSortIcon(option.value)}
                  </span>
                  {currentSort === option.value && (
                    <Check className="w-4 h-4 ml-2 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
