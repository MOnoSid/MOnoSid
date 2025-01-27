import React, { useState } from "react";
import VideoFeed from "@/components/VideoFeed";
import TherapyChat from "@/components/TherapyChat";
import VoiceInput from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm Dr. Sky, your professional AI therapist. I'm here to provide a safe, confidential space for you to share your thoughts and feelings. How are you feeling today?",
      isUser: false,
    },
  ]);
  const [viewMode, setViewMode] = useState<"full" | "video" | "chat">("full");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscript = async (text: string) => {
    if (text.trim() && !isProcessing) {
      setIsProcessing(true);
      setMessages((prev) => [...prev, { text, isUser: true }]);
      
      // Simulate AI response delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I understand how you're feeling. Would you like to tell me more about that?",
            isUser: false,
          },
        ]);
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1520]">
      <div className="max-w-[1400px] mx-auto p-4">
        {/* View Mode Controls */}
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant={viewMode === "full" ? "secondary" : "ghost"}
            onClick={() => setViewMode("full")}
            className="text-white"
          >
            <Layout className="w-4 h-4 mr-2" />
            Full View
          </Button>
          <Button
            variant={viewMode === "video" ? "secondary" : "ghost"}
            onClick={() => setViewMode("video")}
            className="text-white"
          >
            Video Only
          </Button>
          <Button
            variant={viewMode === "chat" ? "secondary" : "ghost"}
            onClick={() => setViewMode("chat")}
            className="text-white"
          >
            Chat Only
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(viewMode === "full" || viewMode === "video") && (
            <div className="space-y-6">
              <div className="bg-[#1A1F2C] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#2A2F3C] rounded-lg flex items-center justify-center text-blue-400 font-bold">
                    Dr
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Dr. Sky</h2>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-gray-400 text-sm">Online</span>
                    </div>
                  </div>
                </div>
                <VideoFeed onFrame={() => {}} />
              </div>
            </div>
          )}

          {(viewMode === "full" || viewMode === "chat") && (
            <div className="space-y-6">
              <TherapyChat messages={messages} />
              <div className="bg-[#1A1F2C] rounded-xl p-4">
                <VoiceInput onTranscript={handleTranscript} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;