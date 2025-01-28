import React, { useState, useEffect } from 'react';
import FlexibleLayout from '@/components/FlexibleLayout';
import { getTherapyResponse, initializeGemini } from '@/utils/gemini';

const Index = () => {
  const [messages, setMessages] = useState<any[]>([{
    text: "Hello! I'm Dr. Sky, your professional AI therapist. I'm here to provide a safe, confidential space for you to share your thoughts and feelings. How are you feeling today?",
    isUser: false
  }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>();
  const [lastFrame, setLastFrame] = useState<string>("");

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
    if (!text.trim() || isProcessing) return;

    // Add user message
    const userMessage = { text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Get AI response based on text and image
      const response = await getTherapyResponse(text, lastFrame);
      setLastResponse(response);
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        text: "I apologize, but I'm having trouble processing your message. Could you please try again?", 
        isUser: false 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FlexibleLayout
      messages={messages}
      onSendMessage={handleSendMessage}
      isProcessing={isProcessing}
      lastResponse={lastResponse}
      onFrame={handleFrame}
    />
  );
};

export default Index;