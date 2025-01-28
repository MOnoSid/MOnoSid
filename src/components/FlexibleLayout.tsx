import React, { useState, useEffect } from 'react';
import TherapyChat from './TherapyChat';
import VoiceInput from './VoiceInput';
import VideoFeed from './VideoFeed';
import Resizer from './Resizer';

interface FlexibleLayoutProps {
  messages: any[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  lastResponse?: string;
  onFrame: (imageData: string) => void;
}

const FlexibleLayout = ({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  lastResponse,
  onFrame 
}: FlexibleLayoutProps) => {
  const [videoSize, setVideoSize] = useState(500);
  const [isMobile, setIsMobile] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  
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
            Empathetic Dialogue
          </h1>
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
                avatarState={avatarState}
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
            <div className="flex-1 bg-therapy-surface rounded-xl border border-therapy-border-light/10 overflow-hidden">
              <TherapyChat messages={messages} />
            </div>

            {/* Voice Input */}
            <div className="bg-therapy-surface p-4 rounded-xl border border-therapy-border-light/10">
              <VoiceInput
                onTranscript={onSendMessage}
                isProcessing={isProcessing}
                lastResponse={lastResponse}
                onStateChange={setAvatarState}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexibleLayout;
