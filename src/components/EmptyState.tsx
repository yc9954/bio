import { SearchX } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  onClearFilters?: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#F3F4F6]">
        <SearchX className="h-8 w-8 text-[#6B7280]" />
      </div>
      <h3 className="mb-2 text-[17px] text-[#0C1B2A]">No results found</h3>
      <p className="mb-6 text-sm text-[#6B7280] max-w-md text-center">
        No studies match your current filters. Try broadening your search criteria or clearing some filters.
      </p>
      <Button
        variant="outline"
        className="border-[#E5E7EB] hover:bg-[#F3F4F6]"
        onClick={onClearFilters}
      >
        Clear filters
      </Button>
    </div>
  );
}
