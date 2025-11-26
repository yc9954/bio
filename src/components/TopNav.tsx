import { useState, FormEvent } from "react";
import { Search, FileText, Code, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TopNavProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
}

export function TopNav({ onNavigate, currentRoute }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate?.("/search");
      // The search will be handled by SearchResults component
      // In a real app, you might want to pass the query as a prop or use context
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-20">
        {/* Left: Brand */}
        <button
          onClick={() => onNavigate?.("/")}
          className="font-mono text-[15px] tracking-tight text-[#0C1B2A] hover:text-[#2563EB] transition-colors"
        >
          BioScope
        </button>

        {/* Center: Global Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-[480px] mx-12">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <Input
            type="text"
            placeholder="genes, diseases, accession IDs..."
            className="h-9 pl-9 pr-3 border-[#E5E7EB] bg-white text-sm placeholder:text-[#6B7280] focus-visible:ring-[#2563EB]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSelect={(e) => {
              // Prevent text selection highlighting issue
              e.currentTarget.setSelectionRange(e.currentTarget.selectionStart, e.currentTarget.selectionEnd);
            }}
          />
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-[#1F2A37] hover:text-[#2563EB] hover:bg-[#F3F4F6]"
            onClick={() => onNavigate?.("/docs")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Docs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-[#1F2A37] hover:text-[#2563EB] hover:bg-[#F3F4F6]"
            onClick={() => onNavigate?.("/api")}
          >
            <Code className="mr-2 h-4 w-4" />
            API
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-[#E5E7EB] text-[#1F2A37] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </Button>
        </div>
      </div>
    </nav>
  );
}
