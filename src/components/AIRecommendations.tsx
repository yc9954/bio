import { useState, useEffect } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "../lib/api";

interface SimilarStudy {
  id: string;
  title: string;
}

interface AIRecommendationsProps {
  onOpenAssistant?: () => void;
  studyId?: string;
}

export function AIRecommendations({ onOpenAssistant, studyId }: AIRecommendationsProps) {
  const [similarStudies, setSimilarStudies] = useState<SimilarStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await api.getRecommendations(studyId);
        setSimilarStudies(response.recommendations);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecommendations();
  }, [studyId]);

  return (
    <div className="w-[320px] border-l border-[#E5E7EB] bg-white sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-4">
        {/* AI Chat Preview */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm text-[#0C1B2A]">AI Assistant</h3>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="mb-3 text-xs text-[#6B7280] leading-[1.5]">
              Ask me to explain studies, suggest similar datasets, or help refine your search.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs border-[#E5E7EB] hover:bg-white hover:text-[#2563EB]"
              onClick={onOpenAssistant}
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              Ask a question
            </Button>
          </div>
        </div>

        {/* Similar Studies */}
        <div>
          <h3 className="mb-3 text-sm text-[#0C1B2A]">Similar Studies</h3>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2563EB] mx-auto"></div>
            </div>
          ) : similarStudies.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-4">No recommendations available</p>
          ) : (
            <div className="space-y-3">
              {similarStudies.map((study) => (
                <button
                  key={study.id}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white p-3 text-left hover:border-[#2563EB] transition-colors"
                >
                  <div className="mb-2 font-mono text-xs text-[#2563EB]">{study.id}</div>
                  <p className="text-xs text-[#1F2A37] leading-[1.5] line-clamp-3">
                    {study.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
