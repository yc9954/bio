import { useState, useEffect } from "react";
import { ArrowLeft, BookmarkPlus, Share2, Download, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { api, type StudyDetail as StudyDetailType, type Sample, type File } from "../lib/api";

interface StudyDetailProps {
  studyId: string;
  onBack: () => void;
  onOpenAssistant: () => void;
}

export function StudyDetail({ studyId, onBack, onOpenAssistant }: StudyDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [study, setStudy] = useState<StudyDetailType | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [sampleFilter, setSampleFilter] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const [studyData, samplesData, filesData] = await Promise.all([
          api.getStudy(studyId, true), // Always use NCBI
          api.getSamples(studyId),
          api.getFiles(studyId),
        ]);
        setStudy(studyData);
        setSamples(samplesData.samples);
        setFiles(filesData.files);
      } catch (error) {
        console.error("Error loading study:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [studyId]);

  const filteredSamples = samples.filter(sample => 
    sample.id.toLowerCase().includes(sampleFilter.toLowerCase()) ||
    sample.condition.toLowerCase().includes(sampleFilter.toLowerCase()) ||
    sample.tissue.toLowerCase().includes(sampleFilter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-sm text-[#6B7280]">Loading study details...</p>
        </div>
      </div>
    );
  }

  if (hasError || !study) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#6B7280] mb-4">Error loading study details</p>
          <Button onClick={onBack} variant="outline">Back to results</Button>
        </div>
      </div>
    );
  }

  const aiSummary = `This study investigates ${study.disease || study.tissue} using ${study.expType}. ${study.abstract}`;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-16 z-10 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-[1440px] px-20 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 h-8 text-[#6B7280] hover:text-[#2563EB]"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to results
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <h1 className="font-mono text-[20px] text-[#2563EB]">{study.id}</h1>
                <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280]">
                  {study.organism}
                </Badge>
                <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280]">
                  {study.expType}
                </Badge>
                <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280]">
                  {study.year}
                </Badge>
              </div>
              <h2 className="text-[19px] text-[#0C1B2A] mb-4 max-w-4xl">
                {study.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 border-[#E5E7EB]">
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="h-9 border-[#E5E7EB]">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="h-9 border-[#E5E7EB]">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Sticky Sub-nav */}
          <div className="mt-4 flex gap-6 border-t border-[#E5E7EB] pt-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-[#2563EB] text-[#2563EB]"
                  : "text-[#6B7280] hover:text-[#1F2A37]"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("samples")}
              className={`pb-3 text-sm transition-colors ${
                activeTab === "samples"
                  ? "border-b-2 border-[#2563EB] text-[#2563EB]"
                  : "text-[#6B7280] hover:text-[#1F2A37]"
              }`}
            >
              Samples
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`pb-3 text-sm transition-colors ${
                activeTab === "files"
                  ? "border-b-2 border-[#2563EB] text-[#2563EB]"
                  : "text-[#6B7280] hover:text-[#1F2A37]"
              }`}
            >
              Files
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1440px] px-20 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* AI Summary */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] text-[#0C1B2A]">AI-Generated Summary</h3>
                    <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280] text-xs">
                      AI
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                    <p className="text-sm text-[#1F2A37] leading-[1.6]">{aiSummary}</p>
                  </div>
                </section>

                {/* Metadata Table */}
                <section>
                  <h3 className="mb-4 text-[15px] text-[#0C1B2A]">Metadata</h3>
                  <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                            Organism
                          </TableCell>
                          <TableCell className="text-sm text-[#1F2A37]">
                            {study.organism}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                            Tissue / Cell Line
                          </TableCell>
                          <TableCell className="text-sm text-[#1F2A37]">
                            {study.tissue}
                          </TableCell>
                        </TableRow>
                        {study.disease && (
                          <TableRow>
                            <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                              Disease / Condition
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {study.disease}
                            </TableCell>
                          </TableRow>
                        )}
                        {study.conditions && (
                          <TableRow>
                            <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                              Experimental Conditions
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {study.conditions}
                            </TableCell>
                          </TableRow>
                        )}
                        {study.replicates && (
                          <TableRow>
                            <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                              Replicates
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {study.replicates}
                            </TableCell>
                          </TableRow>
                        )}
                        {study.instrument && (
                          <TableRow>
                            <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                              Instrument
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {study.instrument}
                            </TableCell>
                          </TableRow>
                        )}
                        {study.libraryStrategy && (
                          <TableRow>
                            <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                              Library Strategy
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {study.libraryStrategy}
                            </TableCell>
                          </TableRow>
                        )}
                        {study.submitter && (
                          <TableRow>
                            <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                              Submitter
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {study.submitter}
                            </TableCell>
                          </TableRow>
                        )}
                        {study.journal && (
                          <TableRow>
                            <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                              Journal
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {study.journal}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell className="w-48 bg-[#F9FAFB] text-sm text-[#6B7280]">
                            Year
                          </TableCell>
                          <TableCell className="text-sm text-[#1F2A37]">
                            {study.year}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "samples" && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[15px] text-[#0C1B2A]">
                    Samples ({study.samples})
                  </h3>
                  <Input
                    type="text"
                    placeholder="Filter samples..."
                    className="h-8 w-64 text-sm border-[#E5E7EB]"
                    value={sampleFilter}
                    onChange={(e) => setSampleFilter(e.target.value)}
                  />
                </div>
                <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F9FAFB]">
                        <TableHead className="text-xs text-[#6B7280]">Sample ID</TableHead>
                        <TableHead className="text-xs text-[#6B7280]">Condition</TableHead>
                        <TableHead className="text-xs text-[#6B7280]">Tissue</TableHead>
                        <TableHead className="text-xs text-[#6B7280]">Reads</TableHead>
                        <TableHead className="text-xs text-[#6B7280]">Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSamples.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-[#6B7280] py-8">
                            No samples found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSamples.map((sample) => (
                          <TableRow key={sample.id}>
                            <TableCell className="font-mono text-sm text-[#2563EB]">
                              {sample.id}
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {sample.condition}
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2A37]">
                              {sample.tissue}
                            </TableCell>
                            <TableCell className="text-sm text-[#6B7280]">
                              {sample.reads}
                            </TableCell>
                            <TableCell className="text-sm text-[#6B7280]">
                              {sample.size}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {activeTab === "files" && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[15px] text-[#0C1B2A]">Data Files</h3>
                  <Button size="sm" variant="outline" className="h-8 border-[#E5E7EB]">
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Download all
                  </Button>
                </div>
                <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F9FAFB]">
                        <TableHead className="text-xs text-[#6B7280]">File Name</TableHead>
                        <TableHead className="text-xs text-[#6B7280]">Type</TableHead>
                        <TableHead className="text-xs text-[#6B7280]">Size</TableHead>
                        <TableHead className="text-xs text-[#6B7280]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-sm text-[#1F2A37]">
                            {file.name}
                          </TableCell>
                          <TableCell className="text-sm text-[#6B7280]">
                            {file.type}
                          </TableCell>
                          <TableCell className="text-sm text-[#6B7280]">
                            {file.size}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-[#2563EB] hover:text-[#1d4ed8]"
                              disabled
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-4 text-xs text-[#6B7280]">
                  File downloads require authentication. Sign in to access data files.
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            {/* AI Q&A */}
            <div className="mb-6 rounded-lg border border-[#E5E7EB] p-4">
              <h3 className="mb-3 text-sm text-[#0C1B2A]">AI Q&A</h3>
              <p className="mb-3 text-xs text-[#6B7280] leading-[1.5]">
                Ask questions about this study and get instant answers.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
                onClick={onOpenAssistant}
              >
                Ask a question
              </Button>
              <div className="mt-3 space-y-2">
                <button className="block w-full rounded-md bg-[#F9FAFB] px-3 py-2 text-left text-xs text-[#1F2A37] hover:bg-[#F3F4F6] transition-colors">
                  Explain this study in simple terms
                </button>
                <button className="block w-full rounded-md bg-[#F9FAFB] px-3 py-2 text-left text-xs text-[#1F2A37] hover:bg-[#F3F4F6] transition-colors">
                  What are the key findings?
                </button>
                <button className="block w-full rounded-md bg-[#F9FAFB] px-3 py-2 text-left text-xs text-[#1F2A37] hover:bg-[#F3F4F6] transition-colors">
                  Suggest related datasets
                </button>
              </div>
            </div>

            {/* Similar Studies */}
            {study.similarStudies && study.similarStudies.length > 0 && (
              <div className="rounded-lg border border-[#E5E7EB] p-4">
                <h3 className="mb-3 text-sm text-[#0C1B2A]">Similar Studies</h3>
                <div className="space-y-3">
                  {study.similarStudies.map((s) => (
                    <button
                      key={s.id}
                      className="block w-full rounded-lg border border-[#E5E7EB] bg-white p-3 text-left hover:border-[#2563EB] transition-colors"
                      onClick={() => window.location.reload()} // In a real app, this would navigate
                    >
                      <div className="mb-2 font-mono text-xs text-[#2563EB]">{s.id}</div>
                      <p className="text-xs text-[#1F2A37] leading-[1.5] line-clamp-2">
                        {s.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
