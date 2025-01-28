import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TherapyChat from './TherapyChat';
import VoiceInput from './VoiceInput';
import VideoFeed from './VideoFeed';
import Resizer from './Resizer';
import ProgressTracker from './ProgressTracker';
import ContentRecommendations from './ContentRecommendations';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import { initializeProgressTracker } from '@/utils/progressTracking';
import { initializeContentRecommender } from '@/utils/contentRecommender';
import { useToast } from '@/components/ui/use-toast';

interface FlexibleLayoutProps {
  messages: any[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  lastResponse?: string;
  onFrame: (imageData: string) => void;
  conversationState: 'idle' | 'listening' | 'speaking' | 'thinking';
  onStateChange: (state: 'idle' | 'listening' | 'speaking' | 'thinking') => void;
}

const FlexibleLayout = ({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  lastResponse,
  onFrame,
  conversationState,
  onStateChange
}: FlexibleLayoutProps) => {
  const navigate = useNavigate();
  const [videoSize, setVideoSize] = useState(500);
  const [isMobile, setIsMobile] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressData, setProgressData] = useState({
    sessionSummary: "",
    goals: [],
    improvements: {
      strengths: [],
      challenges: [],
      recommendations: []
    }
  });
  const [contentRecommendations, setContentRecommendations] = useState({
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
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  const updateProgressAndRecommendations = useCallback(async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || messages.length <= 1 || isUpdating) return;

    try {
      setIsUpdating(true);
      const progressTracker = initializeProgressTracker(apiKey);
      const contentRecommender = initializeContentRecommender(apiKey);
      
      const conversation = messages.map(m => `${m.isUser ? 'User' : 'Dr. Sky'}: ${m.text}`);
      
      // Get progress data
      const progress = await progressTracker.trackProgress(conversation);
      setProgressData(progress);
      await progressTracker.saveProgress(progress);

      // Get content recommendations based on emotional state
      const recommendations = await contentRecommender.getRecommendations(
        progress.improvements.challenges[0] || 'neutral',
        progress.sessionSummary
      );
      setContentRecommendations(recommendations);
    } catch (error: any) {
      console.error('Error updating progress:', error);
      if (error.message?.includes('429')) {
        toast({
          title: "Rate Limit Reached",
          description: "Please wait a moment before getting new recommendations.",
          variant: "destructive"
        });
      }
    } finally {
      setIsUpdating(false);
    }
  }, [messages, isUpdating, toast]);

  // Debounced update effect
  useEffect(() => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    const timeout = setTimeout(() => {
      updateProgressAndRecommendations();
    }, 5000); // Wait 5 seconds after last message before updating

    setUpdateTimeout(timeout);

    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [messages, updateProgressAndRecommendations]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Adjust video size based on screen width for desktop
      if (window.innerWidth >= 1024) {
        setVideoSize(Math.min(500, window.innerWidth * 0.4));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-therapy-background">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-therapy-surface/80 backdrop-blur-sm border-b border-therapy-border-light/10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-therapy-text-primary">
            MonoSid
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProgress(!showProgress)}
            className="text-therapy-text-primary"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : (showProgress ? 'Hide Progress' : 'Show Progress')}
          </Button>
          <Button
            variant="ghost"
            className="text-therapy-text-primary"
            onClick={() => navigate('/feedback')}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Feedback
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className={`h-full flex ${isMobile ? 'flex-col' : 'gap-4'}`}>
          {/* Left Section: Video & Profile */}
          <div 
            style={{ width: isMobile ? '100%' : videoSize }}
            className={`
              ${isMobile ? 'h-[45vh] mb-4' : 'min-h-0'}
              flex flex-col gap-4
            `}
          >
            {/* Dr.Sky Profile */}
            <div className="bg-therapy-surface p-4 rounded-xl border border-therapy-border-light/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-therapy-gradient-start to-therapy-gradient-end p-[2px]">
                  <div className="w-full h-full rounded-lg bg-therapy-card flex items-center justify-center">
                    <span className="text-lg font-bold bg-gradient-to-r from-therapy-gradient-start to-therapy-gradient-end text-transparent bg-clip-text">
                      Dr
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-therapy-text-primary">Dr. Sky</h2>
                  <p className="text-sm text-therapy-text-muted">AI Therapeutic Assistant</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-therapy-text-muted">Online</span>
                </div>
              </div>
            </div>

            {/* Video Feed */}
            <div className="flex-1 bg-therapy-surface rounded-xl border border-therapy-border-light/10 overflow-hidden">
              <VideoFeed 
                onFrame={onFrame}
                botResponse={lastResponse}
                isLoading={isProcessing}
                avatarState={conversationState}
              />
            </div>
          </div>

          {/* Resizer for Desktop */}
          {!isMobile && (
            <Resizer
              onResize={setVideoSize}
              minWidth={400}
              maxWidth={800}
            />
          )}

          {/* Right Section: Chat & Input */}
          <div className={`
            flex-1 flex flex-col gap-4
            ${isMobile ? 'h-[55vh]' : 'min-h-0'}
          `}>
            {/* Chat Messages */}
            {showProgress ? (
              <div className="space-y-6">
                <ProgressTracker
                  sessionSummary={progressData.sessionSummary}
                  goals={progressData.goals}
                  improvements={progressData.improvements}
                />
                <ContentRecommendations recommendations={contentRecommendations} />
              </div>
            ) : (
              <div className="flex-1 bg-therapy-surface rounded-xl border border-therapy-border-light/10 overflow-hidden">
                <TherapyChat messages={messages} />
              </div>
            )}
            {/* Voice Input */}
            <div className="bg-therapy-surface p-4 rounded-xl border border-therapy-border-light/10">
              <VoiceInput
                onTranscript={onSendMessage}
                isProcessing={isProcessing}
                lastResponse={lastResponse}
                onStateChange={onStateChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexibleLayout;