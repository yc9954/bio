import { MoreVertical, BookmarkPlus, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Study {
  id: string;
  title: string;
  abstract: string;
  organism: string;
  expType: string;
  platform: string;
  year: number;
  samples: number;
  disease?: string;
  tissue?: string;
}

interface ResultCardProps {
  study: Study;
  onViewDetails: (id: string) => void;
}

export function ResultCard({ study, onViewDetails }: ResultCardProps) {
  return (
    <div className="border border-[#E5E7EB] rounded-lg bg-white p-4 hover:border-[#2563EB] transition-colors">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-sm text-[#2563EB]">{study.id}</span>
            <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280] text-xs">
              {study.organism}
            </Badge>
            <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280] text-xs">
              {study.expType}
            </Badge>
            <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280] text-xs">
              {study.year}
            </Badge>
          </div>
          <h3 className="text-[15px] text-[#0C1B2A] mb-2 line-clamp-2">
            {study.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4 text-[#6B7280]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="text-sm">Export metadata</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">Copy ID</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">Report issue</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Abstract */}
      <p className="mb-3 text-sm text-[#6B7280] line-clamp-2 leading-[1.6]">
        {study.abstract}
      </p>

      {/* Metadata */}
      <div className="mb-4 flex items-center gap-4 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1">
          <span className="text-[#1F2A37]">Samples:</span> {study.samples}
        </span>
        {study.disease && (
          <span className="flex items-center gap-1">
            <span className="text-[#1F2A37]">Disease:</span> {study.disease}
          </span>
        )}
        {study.tissue && (
          <span className="flex items-center gap-1">
            <span className="text-[#1F2A37]">Tissue:</span> {study.tissue}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="text-[#1F2A37]">Platform:</span> {study.platform}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-sm border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
          onClick={() => onViewDetails(study.id)}
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          View details
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-sm text-[#6B7280] hover:text-[#2563EB]"
        >
          <BookmarkPlus className="mr-2 h-3.5 w-3.5" />
          Save
        </Button>
      </div>
    </div>
  );
}
