import React, { useState } from "react";
import VideoFeed from "@/components/VideoFeed";
import VoiceInput from "@/components/VoiceInput";
import TherapyChat from "@/components/TherapyChat";

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

  const handleFrame = (imageData: string) => {
    setLastFrame(imageData);
  };

  const handleTranscript = (text: string) => {
    if (text.trim()) {
      // Add user message
      setMessages((prev) => [...prev, { text, isUser: true }]);
      
      // Simulate AI response (in real implementation, this would call Gemini)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I understand how you're feeling. Would you like to tell me more about that?",
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-therapy-bg to-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-therapy-text text-center mb-8">
          MonoSid Therapy Session
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