import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { LandingPage } from "./components/LandingPage";
import { SearchResults } from "./components/SearchResults";
import { StudyDetail } from "./components/StudyDetail";
import { AssistantDrawer } from "./components/AssistantDrawer";
import { FilterModal } from "./components/FilterModal";
import { DownloadModal } from "./components/DownloadModal";

type Route = "/" | "/search" | "/study" | "/docs" | "/api";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>("/");
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadStudyIds, setDownloadStudyIds] = useState<string[]>([]);
  const [filterCallback, setFilterCallback] = useState<((filters: any) => void) | null>(null);

  const handleNavigate = (route: string) => {
    if (route === "/search") {
      setCurrentRoute("/search");
      setCurrentStudyId(null);
    } else if (route === "/") {
      setCurrentRoute("/");
      setCurrentStudyId(null);
    } else if (route === "/docs" || route === "/api") {
      // For demo purposes, these routes show the landing page
      setCurrentRoute("/");
    } else {
      setCurrentRoute(route as Route);
    }
  };

  const handleViewDetails = (studyId: string) => {
    setCurrentStudyId(studyId);
    setCurrentRoute("/study");
  };

  const handleBackToResults = () => {
    setCurrentRoute("/search");
    setCurrentStudyId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav onNavigate={handleNavigate} currentRoute={currentRoute} />

      {currentRoute === "/" && <LandingPage onNavigate={handleNavigate} />}

      {currentRoute === "/search" && (
        <SearchResults
          onViewDetails={handleViewDetails}
          onOpenAssistant={() => setAssistantOpen(true)}
          onOpenDownload={(studyIds) => {
            setDownloadStudyIds(studyIds);
            setDownloadModalOpen(true);
          }}
          onOpenFilterModal={() => setFilterModalOpen(true)}
          onFilterCallbackReady={(callback) => setFilterCallback(() => callback)}
        />
      )}

      {currentRoute === "/study" && currentStudyId && (
        <StudyDetail
          studyId={currentStudyId}
          onBack={handleBackToResults}
          onOpenAssistant={() => setAssistantOpen(true)}
        />
      )}

      {/* Overlays */}
      <AssistantDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        contextStudy={currentStudyId || undefined}
      />

      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => {
          if (filterCallback) {
            filterCallback(filters);
          }
          setFilterModalOpen(false);
        }}
      />

      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        resultCount={downloadStudyIds.length || 312}
        studyIds={downloadStudyIds}
      />
    </div>
  );
}
