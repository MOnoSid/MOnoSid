import React, { useState, useEffect } from "react";
import VideoFeed from "@/components/VideoFeed";
import VoiceInput from "@/components/VoiceInput";
import TherapyChat from "@/components/TherapyChat";
import { getTherapyResponse, initializeGemini } from "@/utils/gemini";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  text: string;
  isUser: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm Sky, your AI therapist. How are you feeling today?",
      isUser: false,
    },
  ]);
  const [lastFrame, setLastFrame] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("GEMINI_API_KEY");
    if (storedApiKey) {
      initializeGemini(storedApiKey);
    } else {
      setShowApiInput(true);
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to enable AI responses.",
        variant: "destructive",
      });
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKey);
      initializeGemini(apiKey);
      setShowApiInput(false);
      toast({
        title: "Success",
        description: "API key has been saved successfully.",
      });
    }
  };

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
          MonoSid Therapy Session
        </h1>
        
        {showApiInput ? (
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Enter Gemini API Key</h2>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={handleApiKeySubmit} className="w-full">
                Save API Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <VideoFeed onFrame={handleFrame} />
              <div className="flex justify-center">
                <VoiceInput onTranscript={handleTranscript} />
              </div>
            </div>
            <TherapyChat messages={messages} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;