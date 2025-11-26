import { useState } from "react";
import { Download, Check, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { api } from "../lib/api";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
  studyIds?: string[];
}

export function DownloadModal({ isOpen, onClose, resultCount, studyIds = [] }: DownloadModalProps) {
  const [selectedColumns, setSelectedColumns] = useState([
    "id",
    "title",
    "organism",
    "expType",
    "platform",
    "year",
  ]);
  const [format, setFormat] = useState("csv");
  const [exportState, setExportState] = useState<"idle" | "exporting" | "complete">("idle");
  const [progress, setProgress] = useState(0);

  const columns = [
    { id: "id", label: "Accession ID" },
    { id: "title", label: "Title" },
    { id: "organism", label: "Organism" },
    { id: "expType", label: "Experiment Type" },
    { id: "platform", label: "Platform" },
    { id: "year", label: "Year" },
    { id: "authors", label: "Authors" },
    { id: "journal", label: "Journal" },
    { id: "samples", label: "Sample Count" },
    { id: "disease", label: "Disease/Condition" },
    { id: "tissue", label: "Tissue/Cell Line" },
  ];

  const toggleColumn = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter((id) => id !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  const handleExport = async () => {
    setExportState("exporting");
    setProgress(0);
    
    try {
      // Use provided study IDs, or empty array to export all
      const idsToExport = studyIds.length > 0 ? studyIds : [];
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const blob = await api.exportStudies({
        studyIds: idsToExport,
        columns: selectedColumns,
        format: format as 'csv' | 'json',
      });

      clearInterval(progressInterval);
      setProgress(100);
      setExportState("complete");

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bioscope_results.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      setExportState("idle");
      setProgress(0);
      alert("Export failed. Please try again.");
    }
  };

  const handleReset = () => {
    setExportState("idle");
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] text-[#0C1B2A]">Download Results</DialogTitle>
        </DialogHeader>

        {exportState === "idle" && (
          <div className="space-y-6 py-4">
            {/* Summary */}
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <p className="text-sm text-[#1F2A37]">
                <span className="font-mono text-[#2563EB]">{resultCount}</span> results selected
              </p>
            </div>

            {/* Column Selection */}
            <div>
              <Label className="mb-3 block text-sm text-[#1F2A37]">Select Columns</Label>
              <div className="grid grid-cols-2 gap-3">
                {columns.map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${column.id}`}
                      checked={selectedColumns.includes(column.id)}
                      onCheckedChange={() => toggleColumn(column.id)}
                      className="border-[#E5E7EB]"
                    />
                    <label
                      htmlFor={`col-${column.id}`}
                      className="text-sm text-[#1F2A37] cursor-pointer"
                    >
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <Label className="mb-3 block text-sm text-[#1F2A37]">Format</Label>
              <RadioGroup value={format} onValueChange={setFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="format-csv" />
                  <Label htmlFor="format-csv" className="text-sm text-[#1F2A37] cursor-pointer">
                    CSV (default)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="format-json" />
                  <Label htmlFor="format-json" className="text-sm text-[#1F2A37] cursor-pointer">
                    JSON
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Note */}
            <div className="rounded-lg bg-[#F9FAFB] p-3">
              <p className="text-xs text-[#6B7280]">
                Export includes only visible columns. Large exports may take a few moments.
              </p>
            </div>
          </div>
        )}

        {exportState === "exporting" && (
          <div className="py-12">
            <div className="flex flex-col items-center">
              <Download className="h-12 w-12 text-[#2563EB] mb-4 animate-pulse" />
              <p className="mb-4 text-sm text-[#1F2A37]">Exporting results...</p>
              <Progress value={progress} className="w-full max-w-xs" />
            </div>
          </div>
        )}

        {exportState === "complete" && (
          <div className="py-12">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D1FAE5]">
                <Check className="h-6 w-6 text-[#059669]" />
              </div>
              <p className="mb-6 text-sm text-[#1F2A37]">Export complete!</p>
              <div className="space-y-3 w-full">
                <Button
                  className="w-full h-9 bg-[#2563EB] hover:bg-[#1d4ed8]"
                  onClick={async () => {
                    try {
                      const idsToExport = studyIds.length > 0 ? studyIds : [];
                      const blob = await api.exportStudies({
                        studyIds: idsToExport,
                        columns: selectedColumns,
                        format: format as 'csv' | 'json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `bioscope_results.${format}`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Download error:", error);
                      alert("Download failed. Please try again.");
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-9 border-[#E5E7EB] hover:bg-[#F3F4F6]"
                  onClick={() => {
                    navigator.clipboard.writeText("https://api.bioscope.io/export/abc123");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy API URL
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {exportState === "idle" && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#E5E7EB] hover:bg-[#F3F4F6]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                className="bg-[#2563EB] hover:bg-[#1d4ed8]"
                disabled={selectedColumns.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          )}
          {exportState === "complete" && (
            <Button
              variant="outline"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="border-[#E5E7EB] hover:bg-[#F3F4F6]"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
