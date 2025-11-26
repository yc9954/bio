import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [selectedOrganisms, setSelectedOrganisms] = useState<string[]>([]);
  const [selectedExpTypes, setSelectedExpTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState([2005, 2025]);
  const [author, setAuthor] = useState("");
  const [journal, setJournal] = useState("");
  const [studyTypes, setStudyTypes] = useState<string[]>([]);

  const organisms = ["Human", "Mouse", "Rat", "Zebrafish", "C. elegans", "Drosophila"];
  const expTypes = ["RNA-seq", "ChIP-seq", "ATAC-seq", "scRNA-seq", "WGS", "Exome-seq"];
  const platforms = ["Illumina", "Nanopore", "PacBio", "Ion Torrent"];

  const toggleSelection = (array: string[], setArray: (arr: string[]) => void, value: string) => {
    if (array.includes(value)) {
      setArray(array.filter((item) => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  const selectedCount = 
    selectedOrganisms.length + 
    selectedExpTypes.length + 
    selectedPlatforms.length + 
    studyTypes.length +
    (author ? 1 : 0) +
    (journal ? 1 : 0);

  const handleReset = () => {
    setSelectedOrganisms([]);
    setSelectedExpTypes([]);
    setSelectedPlatforms([]);
    setYearRange([2005, 2025]);
    setAuthor("");
    setJournal("");
    setStudyTypes([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[720px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[17px] text-[#0C1B2A]">Refine Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Organism Pills */}
          <div>
            <Label className="mb-3 block text-sm text-[#1F2A37]">Organism</Label>
            <div className="flex flex-wrap gap-2">
              {organisms.map((org) => (
                <Badge
                  key={org}
                  variant={selectedOrganisms.includes(org) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 ${
                    selectedOrganisms.includes(org)
                      ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                      : "border-[#E5E7EB] text-[#1F2A37] hover:border-[#2563EB]"
                  }`}
                  onClick={() => toggleSelection(selectedOrganisms, setSelectedOrganisms, org)}
                >
                  {org}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experiment Type Pills */}
          <div>
            <Label className="mb-3 block text-sm text-[#1F2A37]">Experiment Type</Label>
            <div className="flex flex-wrap gap-2">
              {expTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedExpTypes.includes(type) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 ${
                    selectedExpTypes.includes(type)
                      ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                      : "border-[#E5E7EB] text-[#1F2A37] hover:border-[#2563EB]"
                  }`}
                  onClick={() => toggleSelection(selectedExpTypes, setSelectedExpTypes, type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Platform Pills */}
          <div>
            <Label className="mb-3 block text-sm text-[#1F2A37]">Platform</Label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 ${
                    selectedPlatforms.includes(platform)
                      ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                      : "border-[#E5E7EB] text-[#1F2A37] hover:border-[#2563EB]"
                  }`}
                  onClick={() => toggleSelection(selectedPlatforms, setSelectedPlatforms, platform)}
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div>
            <Label className="mb-3 block text-sm text-[#1F2A37]">Year Range</Label>
            <div className="space-y-4">
              <Slider
                min={2005}
                max={2025}
                step={1}
                value={yearRange}
                onValueChange={setYearRange}
                className="w-full"
              />
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                  className="h-9 w-full text-sm border-[#E5E7EB]"
                />
                <span className="text-sm text-[#6B7280]">–</span>
                <Input
                  type="number"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="h-9 w-full text-sm border-[#E5E7EB]"
                />
              </div>
            </div>
          </div>

          {/* Author & Journal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-3 block text-sm text-[#1F2A37]">Author</Label>
              <Input
                type="text"
                placeholder="Search authors..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="h-9 text-sm border-[#E5E7EB]"
              />
            </div>
            <div>
              <Label className="mb-3 block text-sm text-[#1F2A37]">Journal</Label>
              <Input
                type="text"
                placeholder="Search journals..."
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className="h-9 text-sm border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Study Type */}
          <div>
            <Label className="mb-3 block text-sm text-[#1F2A37]">Study Type</Label>
            <div className="space-y-3">
              {["In vivo", "In vitro", "In silico"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`study-${type}`}
                    checked={studyTypes.includes(type)}
                    onCheckedChange={() => toggleSelection(studyTypes, setStudyTypes, type)}
                    className="border-[#E5E7EB]"
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

          {/* Preview */}
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">
                {selectedCount} filter{selectedCount !== 1 ? "s" : ""} selected
              </span>
              <span className="text-[#1F2A37]">~312 results</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-[#6B7280] hover:text-[#2563EB]"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E5E7EB] hover:bg-[#F3F4F6]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onApply({
                organisms: selectedOrganisms,
                expTypes: selectedExpTypes,
                platforms: selectedPlatforms,
                yearRange,
                author,
                journal,
                studyTypes,
              });
              onClose();
            }}
            className="bg-[#2563EB] hover:bg-[#1d4ed8]"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
