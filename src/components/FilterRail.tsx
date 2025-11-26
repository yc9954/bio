import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { ScrollArea } from "./ui/scroll-area";
import { api } from "../lib/api";

interface FilterRailProps {
  onApplyFilters?: (filters: any) => void;
  appliedFilters?: any;
}

export function FilterRail({ onApplyFilters, appliedFilters }: FilterRailProps) {
  const [yearRange, setYearRange] = useState([2005, 2025]);
  const [selectedOrganisms, setSelectedOrganisms] = useState<string[]>([]);
  const [selectedExpTypes, setSelectedExpTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [author, setAuthor] = useState("");
  const [journal, setJournal] = useState("");
  const [selectedStudyTypes, setSelectedStudyTypes] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    organisms: string[];
    expTypes: string[];
    platforms: string[];
    years: { min: number; max: number };
    studyTypes: string[];
  } | null>(null);

  useEffect(() => {
    api.getFilterOptions().then(options => {
      setFilterOptions(options);
      setYearRange([options.years.min, options.years.max]);
    });
  }, []);

  useEffect(() => {
    if (appliedFilters) {
      if (appliedFilters.organisms) setSelectedOrganisms(appliedFilters.organisms);
      if (appliedFilters.expTypes) setSelectedExpTypes(appliedFilters.expTypes);
      if (appliedFilters.platforms) setSelectedPlatforms(appliedFilters.platforms);
      if (appliedFilters.yearMin && appliedFilters.yearMax) {
        setYearRange([appliedFilters.yearMin, appliedFilters.yearMax]);
      }
      if (appliedFilters.author) setAuthor(appliedFilters.author);
      if (appliedFilters.journal) setJournal(appliedFilters.journal);
      if (appliedFilters.studyTypes) setSelectedStudyTypes(appliedFilters.studyTypes);
    }
  }, [appliedFilters]);

  const toggleSelection = (array: string[], setArray: (arr: string[]) => void, value: string) => {
    if (array.includes(value)) {
      setArray(array.filter((item) => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        organisms: selectedOrganisms,
        expTypes: selectedExpTypes,
        platforms: selectedPlatforms,
        yearRange,
        author,
        journal,
        studyTypes: selectedStudyTypes,
      });
    }
  };

  const handleReset = () => {
    setSelectedOrganisms([]);
    setSelectedExpTypes([]);
    setSelectedPlatforms([]);
    setYearRange(filterOptions ? [filterOptions.years.min, filterOptions.years.max] : [2005, 2025]);
    setAuthor("");
    setJournal("");
    setSelectedStudyTypes([]);
  };

  return (
    <div className="w-[280px] border-r border-[#E5E7EB] bg-white sticky top-16 h-[calc(100vh-64px)]">
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm text-[#0C1B2A]">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-[#6B7280] hover:text-[#2563EB]"
              onClick={handleReset}
            >
              Reset all
            </Button>
          </div>

          {/* Organism */}
          <div className="mb-6">
            <Label className="mb-3 block text-sm text-[#1F2A37]">Organism</Label>
            <div className="space-y-3">
              {(filterOptions?.organisms || []).map((org) => (
                <div key={org} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`org-${org}`} 
                    className="border-[#E5E7EB]"
                    checked={selectedOrganisms.includes(org)}
                    onCheckedChange={() => toggleSelection(selectedOrganisms, setSelectedOrganisms, org)}
                  />
                  <label
                    htmlFor={`org-${org}`}
                    className="text-sm text-[#1F2A37] cursor-pointer"
                  >
                    {org}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Experiment Type */}
          <div className="mb-6">
            <Label className="mb-3 block text-sm text-[#1F2A37]">Experiment Type</Label>
            <div className="space-y-3">
              {(filterOptions?.expTypes || []).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`exp-${type}`} 
                    className="border-[#E5E7EB]"
                    checked={selectedExpTypes.includes(type)}
                    onCheckedChange={() => toggleSelection(selectedExpTypes, setSelectedExpTypes, type)}
                  />
                  <label
                    htmlFor={`exp-${type}`}
                    className="text-sm text-[#1F2A37] cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="mb-6">
            <Label className="mb-3 block text-sm text-[#1F2A37]">Platform</Label>
            <div className="space-y-3">
              {(filterOptions?.platforms || []).map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`plat-${platform}`} 
                    className="border-[#E5E7EB]"
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => toggleSelection(selectedPlatforms, setSelectedPlatforms, platform)}
                  />
                  <label
                    htmlFor={`plat-${platform}`}
                    className="text-sm text-[#1F2A37] cursor-pointer"
                  >
                    {platform}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div className="mb-6">
            <Label className="mb-3 block text-sm text-[#1F2A37]">Year</Label>
            <div className="space-y-4">
              <Slider
                min={filterOptions?.years.min || 2005}
                max={filterOptions?.years.max || 2025}
                step={1}
                value={yearRange}
                onValueChange={setYearRange}
                className="w-full"
              />
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value) || filterOptions?.years.min || 2005, yearRange[1]])}
                  className="h-8 w-full text-sm border-[#E5E7EB]"
                />
                <span className="text-sm text-[#6B7280]">–</span>
                <Input
                  type="number"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value) || filterOptions?.years.max || 2025])}
                  className="h-8 w-full text-sm border-[#E5E7EB]"
                />
              </div>
            </div>
          </div>

          {/* Author */}
          <div className="mb-6">
            <Label className="mb-3 block text-sm text-[#1F2A37]">Author</Label>
            <Input
              type="text"
              placeholder="Search authors..."
              className="h-9 text-sm border-[#E5E7EB]"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          {/* Journal */}
          <div className="mb-6">
            <Label className="mb-3 block text-sm text-[#1F2A37]">Journal</Label>
            <Input
              type="text"
              placeholder="Search journals..."
              className="h-9 text-sm border-[#E5E7EB]"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
            />
          </div>

          {/* Study Type */}
          <div className="mb-6">
            <Label className="mb-3 block text-sm text-[#1F2A37]">Study Type</Label>
            <div className="space-y-3">
              {(filterOptions?.studyTypes || []).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`study-${type}`} 
                    className="border-[#E5E7EB]"
                    checked={selectedStudyTypes.includes(type)}
                    onCheckedChange={() => toggleSelection(selectedStudyTypes, setSelectedStudyTypes, type)}
                  />
                  <label
                    htmlFor={`study-${type}`}
                    className="text-sm text-[#1F2A37] cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <Button 
            className="w-full h-9 bg-[#2563EB] hover:bg-[#1d4ed8]"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
