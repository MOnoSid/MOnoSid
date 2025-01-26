import React, { useState, useEffect } from "react";
import VideoFeed from "@/components/VideoFeed";
import VoiceInput from "@/components/VoiceInput";
import TherapyChat from "@/components/TherapyChat";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionStarted) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTranscript = async (text: string) => {
    if (text.trim()) {
      setMessages((prev) => [...prev, { text, isUser: true }]);
      
      // Simulate AI thinking time
      const aiResponse = "Thank you for sharing. I understand how you feel...";
      setMessages((prev) => [...prev, { text: aiResponse, isUser: false }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFC] to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-therapy-primary text-white flex items-center justify-center">
              S
            </div>
            <div>
              <h1 className="text-2xl font-bold text-therapy-text">
                Therapy Session
              </h1>
              <p className="text-gray-600">with AI Companion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <Clock className="w-4 h-4 text-therapy-primary" />
              <span className="text-therapy-text font-medium">
                {formatTime(sessionTime)}
              </span>
            </div>
            
            {!isSessionStarted ? (
              <Button
                onClick={() => setIsSessionStarted(true)}
                className="bg-therapy-primary hover:bg-therapy-primary/90 text-white rounded-full px-6"
              >
                Start Session
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <VideoFeed onFrame={() => {}} />
            </div>
            <div className="flex justify-center">
              <VoiceInput onTranscript={handleTranscript} />
            </div>
          </div>
          <div className="h-full">
            <TherapyChat messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;