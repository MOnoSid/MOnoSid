import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TherapyChat from './TherapyChat';
import VoiceInput from './VoiceInput';
import VideoFeed from './VideoFeed';
import ProgressTracker from './ProgressTracker';
import ContentRecommendations from './ContentRecommendations';
import { Button } from './ui/button';
import { MessageSquare, Brain, Activity, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeProgressTracker } from '@/utils/progressTracking';
import { initializeContentRecommender } from '@/utils/contentRecommender';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  text: string;
  isUser: boolean;
  timestamp?: string;
}

interface ProgressData {
  goals?: Array<{
    progress?: number;
    status?: string;
  }>;
  improvements?: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
  emotionalJourney?: {
    emotions: Array<{ emotion: string; timestamp: string }>;
    dominantEmotions: Array<{ emotion: string; frequency: number }>;
    engagementLevel: number[];
  };
  sessionSummary?: string;
}

interface FlexibleLayoutProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  lastResponse: string;
  onFrame?: (frame: string) => void;
  conversationState?: any;
  onStateChange?: (state: any) => void;
}

const FlexibleLayout: React.FC<FlexibleLayoutProps> = ({
  messages,
  setMessages,
  onSendMessage,
  isProcessing,
  lastResponse,
  onFrame,
  conversationState,
  onStateChange
}) => {
  const navigate = useNavigate();
  const [videoSize, setVideoSize] = useState(500);
  const [isMobile, setIsMobile] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [contentRecommendations, setContentRecommendations] = useState<any[]>([]);
  const [emotionalState, setEmotionalState] = useState({
    currentEmotion: 'neutral',
    intensity: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEndSession = async () => {
    setSessionEnded(true);
    toast({
      title: "Session Ending",
      description: "Analyzing your session data...",
      duration: 3000,
    });
    await analyzeConversation();
  };

  const analyzeConversation = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || messages.length < 2) {
      toast({
        title: "Cannot analyze conversation",
        description: "Not enough conversation data to analyze.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const progressTracker = initializeProgressTracker(apiKey);

      // Add timestamps if not present
      const messagesWithTimestamp = messages.map((m, index) => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : 
                  new Date(Date.now() - (messages.length - index) * 60000).toISOString()
      }));

      // Get comprehensive analysis including emotions and engagement
      const progress = await progressTracker.trackProgressWithEmotions(messagesWithTimestamp);
      
      // Process and validate the progress data
      const processedProgress: ProgressData = {
        goals: (progress.goals || []).map(g => ({
          progress: Math.min(100, Math.max(0, g.progress || 0)),
          status: g.status || 'not-started'
        })),
        improvements: {
          strengths: progress.improvements?.strengths || [],
          challenges: progress.improvements?.challenges || [],
          recommendations: progress.improvements?.recommendations || []
        },
        emotionalJourney: {
          emotions: progress.emotionalJourney?.emotions || [],
          dominantEmotions: progress.emotionalJourney?.dominantEmotions || [],
          engagementLevel: progress.emotionalJourney?.engagementLevel || [0, 0, 0, 0, 0]
        },
        sessionSummary: progress.sessionSummary || ''
      };

      // Update content recommendations based on emotional state
      const contentRecommender = initializeContentRecommender(apiKey);
      const dominantEmotion = processedProgress.emotionalJourney.dominantEmotions[0]?.emotion || 'neutral';
      
      let recommendations = [];
      try {
        recommendations = await contentRecommender.getRecommendations(
          dominantEmotion,
          processedProgress.sessionSummary
        );
      } catch (error) {
        console.error('Error getting content recommendations:', error);
        recommendations = []; // Fallback to empty recommendations
      }

      // Save progress and recommendations to localStorage
      try {
        localStorage.setItem('current-progress', JSON.stringify(processedProgress));
        localStorage.setItem('content-recommendations', JSON.stringify(recommendations));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }

      // Set state before navigation
      setProgressData(processedProgress);
      setContentRecommendations(recommendations);

      // Navigate to progress page
      navigate('/progress');

      toast({
        title: "Analysis Complete",
        description: "Viewing your session insights...",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error analyzing conversation:', error);
      toast({
        title: "Analysis Error",
        description: error.message?.includes('429') 
          ? "Service is busy. Please try again in a moment."
          : "Failed to analyze conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewSession = () => {
    setSessionEnded(false);
    setMessages([]);
    setSessionTime(0);
    setEmotionalState({ currentEmotion: 'neutral', intensity: 0 });
    toast({
      title: "New Session Started",
      description: "Ready to begin your therapy session",
      duration: 3000,
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setVideoSize(Math.min(500, window.innerWidth * 0.4));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-sm border-b shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">Dr</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-800">MonoSid</h1>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-400 mr-2 rounded-full animate-pulse"></span>
                Session Active
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="hidden md:flex items-center bg-primary/5 px-4 py-2 rounded-lg"
          >
            <Activity className="w-4 h-4 text-primary mr-2" />
            <span className="font-mono text-primary">{formatTime(sessionTime)}</span>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProgress(!showProgress)}
              className="hidden md:flex text-gray-600 hover:text-primary"
            >
              <Brain className="w-4 h-4 mr-2" />
              Progress
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="hidden md:flex text-gray-600 hover:text-primary"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {!sessionEnded ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndSession}
                disabled={isAnalyzing || messages.length < 2}
                className="bg-red-500 hover:bg-red-600 text-white whitespace-nowrap"
              >
                End Session
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleNewSession}
                className="bg-primary hover:bg-primary/90 text-white whitespace-nowrap"
              >
                New Session
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className={`h-full flex ${isMobile ? 'flex-col' : 'gap-6'}`}>
          {/* Left Section: Video & Profile */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ width: isMobile ? '100%' : videoSize }}
            className={`${isMobile ? 'h-[45vh] mb-4' : 'min-h-0'} flex flex-col gap-4`}
          >
            {/* Video Feed */}
            <div className="flex-1 bg-white border border-blue-100 shadow-lg overflow-hidden">
              <VideoFeed 
                onFrame={onFrame}
                botResponse={lastResponse}
                isLoading={isProcessing}
                avatarState={conversationState}
              />
            </div>

            {/* Emotional State Indicator */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white p-4 border border-blue-100 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Emotional State</h3>
                  <p className="text-lg text-blue-600 capitalize">{emotionalState.currentEmotion}</p>
                </div>
                <div className="w-20 h-20">
                  {/* Add an emotional state visualization here */}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Section: Chat & Input */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`flex-1 flex flex-col gap-4 ${isMobile ? 'h-[55vh]' : 'min-h-0'}`}
          >
            {/* Chat Interface */}
            <div className="flex-1 bg-white border border-blue-100 shadow-lg overflow-hidden">
              <TherapyChat 
                messages={messages}
                onSendMessage={onSendMessage}
                isTyping={isProcessing}
              />
            </div>

            {/* Voice Input */}
            <div className="bg-white p-4 border border-blue-100 shadow-lg">
              <VoiceInput
                onTranscript={onSendMessage}
                isProcessing={isProcessing}
                lastResponse={lastResponse}
                onStateChange={onStateChange}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l border-blue-100 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Add settings options here */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Panel */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed bottom-0 left-0 right-0 h-2/3 bg-white shadow-lg border-t border-blue-100 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Session Progress</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProgress(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ProgressTracker />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlexibleLayout;