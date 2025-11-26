import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Download, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FilterRail } from "./FilterRail";
import { ResultCard } from "./ResultCard";
import { AIRecommendations } from "./AIRecommendations";
import { AppliedChips } from "./AppliedChips";
import { SearchResultsLoading } from "./LoadingStates";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { api, type Study, type SearchParams } from "../lib/api";

interface SearchResultsProps {
  onViewDetails: (id: string) => void;
  onOpenAssistant: () => void;
  onOpenDownload: (studyIds: string[]) => void;
  onOpenFilterModal: () => void;
  onFilterCallbackReady?: (callback: (filters: any) => void) => void;
}

export function SearchResults({
  onViewDetails,
  onOpenAssistant,
  onOpenDownload,
  onOpenFilterModal,
  onFilterCallbackReady,
}: SearchResultsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevant" | "recent" | "samples">("relevant");
  const [appliedFilters, setAppliedFilters] = useState<Array<{ key: string; label: string; value: string }>>([]);
  const [filterParams, setFilterParams] = useState<SearchParams>({});
  // Always use NCBI API - no local data
  const useNCBI = true;

  const loadStudies = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const params: SearchParams = {
        page: currentPage,
        limit: 10,
        sort: sortBy,
        ...filterParams,
      };
      
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const response = await api.searchStudies(params, useNCBI);
      setStudies(response.studies);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading studies:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, searchQuery, filterParams]);

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  // Expose filter callback to parent
  useEffect(() => {
    if (onFilterCallbackReady) {
      onFilterCallbackReady((filters: any) => {
        const newParams: SearchParams = {};
        const newAppliedFilters: Array<{ key: string; label: string; value: string }> = [];

        if (filters.organisms && filters.organisms.length > 0) {
          newParams.organisms = filters.organisms;
          filters.organisms.forEach((org: string) => {
            newAppliedFilters.push({ key: `organism-${org}`, label: "Organism", value: org });
          });
        }
        if (filters.expTypes && filters.expTypes.length > 0) {
          newParams.expTypes = filters.expTypes;
          filters.expTypes.forEach((type: string) => {
            newAppliedFilters.push({ key: `expType-${type}`, label: "Experiment Type", value: type });
          });
        }
        if (filters.platforms && filters.platforms.length > 0) {
          newParams.platforms = filters.platforms;
          filters.platforms.forEach((plat: string) => {
            newAppliedFilters.push({ key: `platform-${plat}`, label: "Platform", value: plat });
          });
        }
        if (filters.yearRange && filters.yearRange.length === 2) {
          newParams.yearMin = filters.yearRange[0];
          newParams.yearMax = filters.yearRange[1];
          newAppliedFilters.push({ 
            key: `year-${filters.yearRange[0]}-${filters.yearRange[1]}`, 
            label: "Year", 
            value: `${filters.yearRange[0]}-${filters.yearRange[1]}` 
          });
        }
        if (filters.author) {
          newParams.author = filters.author;
          newAppliedFilters.push({ key: `author-${filters.author}`, label: "Author", value: filters.author });
        }
        if (filters.journal) {
          newParams.journal = filters.journal;
          newAppliedFilters.push({ key: `journal-${filters.journal}`, label: "Journal", value: filters.journal });
        }
        if (filters.studyTypes && filters.studyTypes.length > 0) {
          newParams.studyTypes = filters.studyTypes;
          filters.studyTypes.forEach((type: string) => {
            newAppliedFilters.push({ key: `studyType-${type}`, label: "Study Type", value: type });
          });
        }

        setFilterParams(newParams);
        setAppliedFilters(newAppliedFilters);
        setCurrentPage(1);
      });
    }
  }, [onFilterCallbackReady]);

  const handleRemoveFilter = (key: string) => {
    const newFilters = appliedFilters.filter((f) => f.key !== key);
    setAppliedFilters(newFilters);
    
    // Update filter params
    const newParams = { ...filterParams };
    if (key.startsWith("organism-")) {
      newParams.organisms = newFilters
        .filter(f => f.key.startsWith("organism-"))
        .map(f => f.value);
      if (newParams.organisms?.length === 0) delete newParams.organisms;
    } else if (key.startsWith("expType-")) {
      newParams.expTypes = newFilters
        .filter(f => f.key.startsWith("expType-"))
        .map(f => f.value);
      if (newParams.expTypes?.length === 0) delete newParams.expTypes;
    } else if (key.startsWith("platform-")) {
      newParams.platforms = newFilters
        .filter(f => f.key.startsWith("platform-"))
        .map(f => f.value);
      if (newParams.platforms?.length === 0) delete newParams.platforms;
    } else if (key.startsWith("year-")) {
      delete newParams.yearMin;
      delete newParams.yearMax;
    } else if (key.startsWith("author-")) {
      delete newParams.author;
    } else if (key.startsWith("journal-")) {
      delete newParams.journal;
    } else if (key.startsWith("studyType-")) {
      newParams.studyTypes = newFilters
        .filter(f => f.key.startsWith("studyType-"))
        .map(f => f.value);
      if (newParams.studyTypes?.length === 0) delete newParams.studyTypes;
    }
    setFilterParams(newParams);
  };

  const handleClearAll = () => {
    setAppliedFilters([]);
    setFilterParams({});
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadStudies();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex bg-white">
      {/* Left: Filter Rail */}
      <FilterRail 
        onApplyFilters={(filters) => {
          const newParams: SearchParams = {};
          const newAppliedFilters: Array<{ key: string; label: string; value: string }> = [];

          if (filters.organisms && filters.organisms.length > 0) {
            newParams.organisms = filters.organisms;
            filters.organisms.forEach(org => {
              newAppliedFilters.push({ key: `organism-${org}`, label: "Organism", value: org });
            });
          }
          if (filters.expTypes && filters.expTypes.length > 0) {
            newParams.expTypes = filters.expTypes;
            filters.expTypes.forEach(type => {
              newAppliedFilters.push({ key: `expType-${type}`, label: "Experiment Type", value: type });
            });
          }
          if (filters.platforms && filters.platforms.length > 0) {
            newParams.platforms = filters.platforms;
            filters.platforms.forEach(plat => {
              newAppliedFilters.push({ key: `platform-${plat}`, label: "Platform", value: plat });
            });
          }
          if (filters.yearRange && filters.yearRange.length === 2) {
            newParams.yearMin = filters.yearRange[0];
            newParams.yearMax = filters.yearRange[1];
            newAppliedFilters.push({ 
              key: `year-${filters.yearRange[0]}-${filters.yearRange[1]}`, 
              label: "Year", 
              value: `${filters.yearRange[0]}-${filters.yearRange[1]}` 
            });
          }
          if (filters.author) {
            newParams.author = filters.author;
            newAppliedFilters.push({ key: `author-${filters.author}`, label: "Author", value: filters.author });
          }
          if (filters.journal) {
            newParams.journal = filters.journal;
            newAppliedFilters.push({ key: `journal-${filters.journal}`, label: "Journal", value: filters.journal });
          }
          if (filters.studyTypes && filters.studyTypes.length > 0) {
            newParams.studyTypes = filters.studyTypes;
            filters.studyTypes.forEach(type => {
              newAppliedFilters.push({ key: `studyType-${type}`, label: "Study Type", value: type });
            });
          }

          setFilterParams(newParams);
          setAppliedFilters(newAppliedFilters);
          setCurrentPage(1);
        }}
        appliedFilters={filterParams}
      />

      {/* Center: Results */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="sticky top-16 z-10 border-b border-[#E5E7EB] bg-white px-6 py-4">
          <form onSubmit={handleSearch} className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <Input
                type="text"
                placeholder="Search NCBI databases (GEO, SRA)..."
                className="h-9 pl-9 pr-3 border-[#E5E7EB] text-sm selection:bg-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  // Prevent selection highlighting on typing
                  if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                    const input = e.currentTarget;
                    setTimeout(() => {
                      const start = input.selectionStart;
                      const end = input.selectionEnd;
                      if (start !== end) {
                        input.setSelectionRange(start, start);
                      }
                    }, 0);
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-9 border-[#E5E7EB] hover:bg-[#F3F4F6]"
            >
              Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-[#E5E7EB] hover:bg-[#F3F4F6]"
              onClick={onOpenFilterModal}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Refine
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-[#E5E7EB] hover:bg-[#F3F4F6]"
              onClick={() => onOpenDownload(studies.map(s => s.id))}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </form>

          <div className="flex items-center justify-between">
            <AppliedChips
              filters={appliedFilters}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAll}
            />
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: "relevant" | "recent" | "samples") => setSortBy(value)}>
                <SelectTrigger className="h-8 w-[160px] border-[#E5E7EB] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Most relevant</SelectItem>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="samples">Most samples</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="p-6">
          {hasError && <ErrorState onRetry={loadStudies} />}
          
          {!hasError && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">
                  <span className="font-mono text-[#1F2A37]">{total}</span> results found
                </p>
              </div>

              {isLoading ? (
                <SearchResultsLoading />
              ) : studies.length === 0 ? (
                <EmptyState onClearFilters={handleClearAll} />
              ) : (
                <div className="space-y-4">
                  {studies.map((study) => (
                    <ResultCard
                      key={study.id}
                      study={study}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          className="border-[#E5E7EB]"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === pageNum}
                              className={currentPage === pageNum 
                                ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" 
                                : "border-[#E5E7EB]"
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNum);
                              }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          className="border-[#E5E7EB]"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right: AI Recommendations */}
      <AIRecommendations onOpenAssistant={onOpenAssistant} />
    </div>
  );
}
