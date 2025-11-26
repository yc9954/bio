import { useState } from "react";
import { X, Send, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextStudy?: string;
}

export function AssistantDrawer({ isOpen, onClose, contextStudy }: AssistantDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I can help you understand studies, suggest similar datasets, or refine your search. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [contextExpanded, setContextExpanded] = useState(true);

  const examplePrompts = [
    "Explain this study in plain language.",
    "Suggest similar datasets for breast cancer RNA-seq.",
    "Convert my question to a structured search.",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages([...messages, { role: "user", content: userMessage }]);
    setInput("");
    
    try {
      const response = await api.chatAssistant(userMessage, contextStudy);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.response,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-[480px] border-l border-[#E5E7EB] bg-white shadow-lg z-40">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h2 className="text-[15px] text-[#0C1B2A]">Ask the Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Context */}
        {contextStudy && (
          <div className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <button
              onClick={() => setContextExpanded(!contextExpanded)}
              className="flex w-full items-center justify-between p-3 text-left hover:bg-[#F3F4F6]"
            >
              <span className="text-xs text-[#6B7280]">Context</span>
              {contextExpanded ? (
                <ChevronUp className="h-4 w-4 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              )}
            </button>
            {contextExpanded && (
              <div className="px-3 pb-3">
                <div className="rounded-lg border border-[#E5E7EB] bg-white p-2">
                  <p className="font-mono text-xs text-[#2563EB]">{contextStudy}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">Currently viewing</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    message.role === "user"
                      ? "bg-[#2563EB] text-white"
                      : "border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2A37]"
                  }`}
                >
                  <p className="text-sm leading-[1.6]">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Example Prompts */}
        {messages.length <= 1 && (
          <div className="border-t border-[#E5E7EB] p-3 bg-[#F9FAFB]">
            <p className="mb-2 text-xs text-[#6B7280]">Try asking:</p>
            <div className="space-y-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="block w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-left text-xs text-[#1F2A37] hover:border-[#2563EB] hover:bg-[#F9FAFB] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Safety Note */}
        <div className="border-t border-[#E5E7EB] bg-[#FEF3C7] px-3 py-2">
          <p className="text-xs text-[#92400E]">
            ⚠️ Summaries may contain errors. Verify with original records.
          </p>
        </div>

        {/* Input */}
        <div className="border-t border-[#E5E7EB] p-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="h-9 flex-1 border-[#E5E7EB] text-sm"
            />
            <Button
              size="sm"
              className="h-9 bg-[#2563EB] hover:bg-[#1d4ed8]"
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
