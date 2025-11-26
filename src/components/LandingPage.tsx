import { Search, Filter, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1440px] px-20 py-24">
          <div className="max-w-[760px] mx-auto text-center">
            <h1 className="mb-6 text-[40px] leading-[1.2] tracking-tight text-[#0C1B2A]">
              Search, Filter, and Understand Public Omics Data
            </h1>
            <p className="mb-12 text-[17px] leading-[1.6] text-[#6B7280]">
              Unified search across GEO, SRA, ENA, BioProject. Summaries and recommendations by AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-11 bg-[#2563EB] px-8 text-white hover:bg-[#1d4ed8]"
                onClick={() => onNavigate("/search")}
              >
                Start Searching
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 border-[#E5E7EB] px-8 text-[#1F2A37] hover:bg-[#F3F4F6]"
                onClick={() => onNavigate("/api")}
              >
                View API
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1440px] px-20 py-16">
          <div className="grid grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6]">
                <Search className="h-6 w-6 text-[#2563EB]" />
              </div>
              <h3 className="mb-3 text-[17px] text-[#0C1B2A]">Unified Search</h3>
              <p className="text-[15px] leading-[1.6] text-[#6B7280]">
                Query across GEO / SRA / ENA with natural language or structured filters.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6]">
                <Filter className="h-6 w-6 text-[#2563EB]" />
              </div>
              <h3 className="mb-3 text-[17px] text-[#0C1B2A]">Expert Filters</h3>
              <p className="text-[15px] leading-[1.6] text-[#6B7280]">
                Organism, experiment type, platform, year, author, journal.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6]">
                <Sparkles className="h-6 w-6 text-[#2563EB]" />
              </div>
              <h3 className="mb-3 text-[17px] text-[#0C1B2A]">AI Summaries</h3>
              <p className="text-[15px] leading-[1.6] text-[#6B7280]">
                Readable descriptions, similar studies, and guided exploration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F9FAFB]">
        <div className="mx-auto max-w-[1440px] px-20 py-12">
          <div className="flex items-center justify-between text-sm text-[#6B7280]">
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#2563EB] transition-colors">
                About
              </a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">
                API Reference
              </a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">
                Privacy
              </a>
            </div>
            <div className="font-mono text-xs">
              © 2025 BioScope
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
