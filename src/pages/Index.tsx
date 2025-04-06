import React, { useState, useEffect } from 'react';
import FlexibleLayout from '@/components/FlexibleLayout';
import EmotionalDashboard from '@/components/EmotionalDashboard';
import { getTherapyResponse, initializeGemini, analyzeEmotion } from '@/utils/gemini';

interface EmotionData {
  timestamp: string;
  emotion: string;
  intensity: number;
  trigger?: string;
  recommendation?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>();
  const [lastFrame, setLastFrame] = useState<string>("");
  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  const [sessionData, setSessionData] = useState<EmotionData[]>([{
    timestamp: new Date().toLocaleTimeString(),
    emotion: 'neutral',
    intensity: 50
  }]);

  useEffect(() => {
    // Initialize Gemini with API key from environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is missing! Please add VITE_GEMINI_API_KEY to your .env file');
      return;
    }
    initializeGemini(apiKey);
  }, []);

  const handleFrame = (imageData: string) => {
    setLastFrame(imageData);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setMessages(prev => [...prev, { text, isUser: true }]);

    try {
      const { response, emotion } = await getTherapyResponse(text, lastFrame);
      setLastResponse(response);
      setMessages(prev => [...prev, { text: response, isUser: false }]);

      // Update session data with both user and AI emotions
      const timestamp = new Date().toLocaleTimeString();
      setSessionData(prev => [
        ...prev,
        {
          timestamp,
          emotion: emotion.emotion,
          intensity: emotion.intensity,
          trigger: text,
          recommendation: response
        }
      ]);

    } catch (error) {
      console.error('Error getting therapy response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Emotional Dashboard - positioned absolutely */}
      <EmotionalDashboard 
        sessionData={sessionData}
        messages={messages}
      />
      
      <main className="flex-1 overflow-hidden">
        <FlexibleLayout
          messages={messages}
          isProcessing={isProcessing}
          onSendMessage={handleSendMessage}
          lastResponse={lastResponse}
          onFrame={handleFrame}
          conversationState={conversationState}
          onStateChange={setConversationState}
        />
      </main>
    </div>
  );
};

export default Index;