import React, { useState } from "react";
import VideoFeed from "@/components/VideoFeed";
import TherapyChat from "@/components/TherapyChat";
import VoiceInput from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";
import { getTherapyResponse } from "@/utils/gemini";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  text: string;
  isUser: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm Dr. Sky, your professional AI therapist. I'm here to provide a safe, confidential space for you to share your thoughts and feelings. How are you feeling today?",
      isUser: false,
    },
  ]);
  const [viewMode, setViewMode] = useState<"full" | "video" | "chat">("full");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string>("");
  const { toast } = useToast();

  const handleTranscript = async (text: string) => {
    if (text.trim() && !isProcessing) {
      try {
        setIsProcessing(true);
        // Add user message
        setMessages((prev) => [...prev, { text, isUser: true }]);

        // Get response from Gemini
        const response = await getTherapyResponse(text, currentFrame);
        
        // Add AI response
        setMessages((prev) => [...prev, { text: response, isUser: false }]);
      } catch (error) {
        console.error("Error getting therapy response:", error);
        toast({
          title: "Error",
          description: "I apologize, but I'm having trouble processing your response. Could you please try again?",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleFrame = (imageData: string) => {
    setCurrentFrame(imageData);
  };

  return (
    <div className="min-h-screen bg-[#0F1520]">
      <div className="max-w-[1400px] mx-auto p-4">
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
                <VideoFeed onFrame={handleFrame} />
              </div>
            </div>
          )}

          {(viewMode === "full" || viewMode === "chat") && (
            <div className="space-y-6">
              <TherapyChat messages={messages} />
              <div className="bg-[#1A1F2C] rounded-xl p-4">
                <VoiceInput onTranscript={handleTranscript} isProcessing={isProcessing} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;