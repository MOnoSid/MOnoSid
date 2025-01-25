import React, { useState, useEffect } from "react";
import VideoFeed from "@/components/VideoFeed";
import VoiceInput from "@/components/VoiceInput";
import TherapyChat from "@/components/TherapyChat";
import { getTherapyResponse, initializeGemini } from "@/utils/gemini";
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
  const [lastFrame, setLastFrame] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeGemini("AIzaSyDJHyNLVHEljoWyg9jVeV0rI-An-LdmAyw");
  }, []);

  const handleFrame = (imageData: string) => {
    setLastFrame(imageData);
  };

  const handleTranscript = async (text: string) => {
    if (text.trim() && !isProcessing) {
      setIsProcessing(true);
      
      // Add user message
      setMessages((prev) => [...prev, { text, isUser: true }]);
      
      try {
        // Get AI response based on text and image
        const response = await getTherapyResponse(text, lastFrame);
        
        // Add AI response
        setMessages((prev) => [...prev, { text: response, isUser: false }]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-therapy-bg to-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-therapy-text text-center mb-8">
          Professional Therapy Session
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <VideoFeed onFrame={handleFrame} />
            <div className="flex justify-center">
              <VoiceInput onTranscript={handleTranscript} />
            </div>
          </div>
          <TherapyChat messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default Index;