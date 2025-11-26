import { X } from "lucide-react";
import { Badge } from "./ui/badge";

interface AppliedFilter {
  key: string;
  label: string;
  value: string;
}

interface AppliedChipsProps {
  filters: AppliedFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function AppliedChips({ filters, onRemove, onClearAll }: AppliedChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-[#6B7280]">Applied filters:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="h-7 px-2 bg-[#F3F4F6] text-[#1F2A37] border border-[#E5E7EB] hover:bg-[#E5E7EB]"
        >
          <span className="text-xs">
            {filter.label}: {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-2 hover:text-[#2563EB]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-[#6B7280] hover:text-[#2563EB] underline"
      >
        Clear all
      </button>
    </div>
  );
}
