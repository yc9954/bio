import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

interface ErrorStateProps {
  onRetry?: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="border-[#DC2626]/20 bg-[#FEF2F2]">
      <AlertCircle className="h-4 w-4 text-[#DC2626]" />
      <AlertDescription className="ml-2 flex items-center justify-between">
        <span className="text-sm text-[#DC2626]">
          Couldn't fetch data from source APIs. Please try again.
        </span>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 ml-4 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
            onClick={onRetry}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
