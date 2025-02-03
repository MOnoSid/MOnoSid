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
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Therapy Session</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <FlexibleLayout
              messages={messages}
              isProcessing={isProcessing}
              onSendMessage={handleSendMessage}
              lastResponse={lastResponse}
              onFrame={handleFrame}
              conversationState={conversationState}
              onStateChange={setConversationState}
            />
          </div>
          
          <div className="mt-8 px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Emotional Journey</h2>
                <EmotionalDashboard 
                  sessionData={sessionData}
                  messages={messages}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;