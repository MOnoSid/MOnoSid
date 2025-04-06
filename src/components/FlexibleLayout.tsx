import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TherapyChat from './TherapyChat';
import VoiceInput from './VoiceInput';
import VideoFeed from './VideoFeed';
import ProgressTracker from './ProgressTracker';
import ContentRecommendations from './ContentRecommendations';
import { Button } from './ui/button';
import { MessageSquare, Brain, Activity, Settings, X, Heart, Clock, ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeProgressTracker } from '@/utils/progressTracking';
import { initializeContentRecommender } from '@/utils/contentRecommender';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  text: string;
  isUser: boolean;
  timestamp?: string;
}

interface EmotionFrequency {
  emotion: string;
  frequency: number;
}

type ContentCategory = 
  | 'meditation'
  | 'relaxation'
  | 'educational'
  | 'motivation'
  | 'breathing'
  | 'mindfulness'
  | 'exercise'
  | 'sleep';

interface ContentItem {
  title: string;
  url: string;
  description: string;
  category: ContentCategory;
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
    dominantEmotions: EmotionFrequency[];
    engagementLevel: number[];
  };
  sessionSummary?: string;
}

interface FlexibleLayoutProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  lastResponse?: string;
  onFrame: (imageData: string) => void;
  conversationState?: 'idle' | 'listening' | 'speaking' | 'thinking';
  onStateChange?: (state: 'idle' | 'listening' | 'speaking' | 'thinking') => void;
}

interface ContentRecommendation {
  meditation: ContentItem[];
  relaxation: ContentItem[];
  educational: ContentItem[];
  motivation: ContentItem[];
  breathing: ContentItem[];
  mindfulness: ContentItem[];
  exercise: ContentItem[];
  sleep: ContentItem[];
  reason: string;
}

const FlexibleLayout: React.FC<FlexibleLayoutProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  lastResponse = '',
  onFrame,
  conversationState = 'idle',
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
  const [contentRecommendations, setContentRecommendations] = useState<ContentRecommendation>({
    meditation: [],
    relaxation: [],
    educational: [],
    motivation: [],
    breathing: [],
    mindfulness: [],
    exercise: [],
    sleep: [],
    reason: ''
  });
  const [emotionalState, setEmotionalState] = useState({
    currentEmotion: 'neutral',
    intensity: 0
  });
  const [showChat, setShowChat] = useState(false);

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
          dominantEmotions: (progress.emotionalJourney?.dominantEmotions || []).map(e => ({
            emotion: e.emotion,
            frequency: e.percentage || 0
          })),
          engagementLevel: progress.emotionalJourney?.engagementLevel || [0, 0, 0, 0, 0]
        },
        sessionSummary: progress.sessionSummary || ''
      };

      // Update content recommendations based on emotional state
      const contentRecommender = initializeContentRecommender(apiKey);
      const dominantEmotion = processedProgress.emotionalJourney?.dominantEmotions[0]?.emotion || 'neutral';
      
      let recommendations: ContentRecommendation;
      try {
        recommendations = await contentRecommender.getRecommendations(
          dominantEmotion,
          processedProgress.sessionSummary || ''
        );
      } catch (error) {
        console.error('Error getting content recommendations:', error);
        recommendations = {
          meditation: [],
          relaxation: [],
          educational: [],
          motivation: [],
          breathing: [],
          mindfulness: [],
          exercise: [],
          sleep: [],
          reason: 'Failed to get recommendations'
        };
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
    onSendMessage('');
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-white overflow-hidden">
      {/* Peaceful Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(169,151,255,0.07),rgba(220,242,255,0.07),rgba(255,255,255,0))] animate-gradient-shift" />
        
        {/* Floating Orbs */}
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-3xl -top-40 -left-40 animate-float-slow" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-blue-200/20 via-cyan-200/20 to-teal-200/20 rounded-full blur-3xl top-1/2 -right-40 animate-float-medium" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-rose-200/20 via-fuchsia-200/20 to-indigo-200/20 rounded-full blur-3xl -bottom-40 left-1/3 animate-float-fast" />

        {/* Subtle Particles */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/4 animate-particle-1" />
          <div className="absolute w-2 h-2 bg-white rounded-full top-3/4 left-1/3 animate-particle-2" />
          <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 right-1/4 animate-particle-3" />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-1/4 right-1/3 animate-particle-4" />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-1/3 right-1/2 animate-particle-5" />
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-100/5 to-blue-100/5 animate-pulse-slow" />
      </div>

      {/* Top Navigation Bar - Clean and minimal */}
      <header className="fixed top-0 inset-x-0 h-12 md:h-14 bg-white/80 backdrop-blur-md border-b border-white/20 z-50">
        <div className="container mx-auto h-full px-4">
          <div className="flex items-center justify-between h-full">
            {/* Logo and Title */}
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm"
              >
                <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.div>
            </div>

            {/* Session Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" />
                <span className="text-xs md:text-sm font-medium text-slate-700">{formatTime(sessionTime)}</span>
              </div>
              <Button
                onClick={handleEndSession}
                variant="ghost"
                size="sm"
                className="text-xs md:text-sm text-slate-700 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 h-auto"
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Adjust top padding to match new header height */}
      <main className="pt-12 md:pt-14 min-h-screen">
        <div className="h-[calc(100vh-4rem)]">
          <div className="flex flex-col h-full">
            {/* Video Feed Section - Centered */}
            <section className="w-full h-screen p-0">
              <div className="h-full w-full">
                {/* Digital Avatar Section */}
                <motion.div
                  layout
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="h-full bg-gradient-to-br from-slate-50 to-slate-100/95 backdrop-blur-sm overflow-hidden transition-all duration-300 relative"
                >
                  {/* Remove the overlapping section label */}
                  <VideoFeed
                    onFrame={onFrame}
                    isLoading={isProcessing}
                    botResponse={lastResponse}
                    avatarState={conversationState || (isProcessing ? 'thinking' : lastResponse ? 'speaking' : 'idle')}
                    onStateChange={(state) => onStateChange?.(state)}
                  />

                  {/* Voice Input Component */}
                  <VoiceInput
                    onTranscript={onSendMessage}
                    isProcessing={isProcessing}
                    lastResponse={lastResponse}
                    onStateChange={(state) => onStateChange?.(state)}
                    onSpeechEvent={(event) => {
                      // Handle speech events if needed
                    }}
                  />

                  {/* Chat Interface - Updated to use TherapyChat's toggleable functionality */}
                  <TherapyChat
                    messages={messages}
                    onSendMessage={onSendMessage}
                    isTyping={isProcessing}
                    visible={showChat}
                    onToggleVisibility={() => setShowChat(!showChat)}
                  />
                </motion.div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Session Status Bar - Simplified */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20"
        >
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium">Active</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions - Removed settings button */}
      {/* Rest of the code remains the same */}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
                <div className="flex items-center justify-between p-6 border-b border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Session Settings</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Settings content */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlexibleLayout;