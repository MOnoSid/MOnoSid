import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, Mic, MicOff } from 'lucide-react';

enum VideoState {
  SPEAKING = 'speaking',
  THINKING = 'thinking',
  IDLE = 'idle',
  LISTENING = 'listening'
}

interface DigitalHumanProps {
  text?: string;
  isLoading?: boolean;
  isListening?: boolean;
  onMicToggle?: () => void;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const DigitalHuman = ({ 
  text, 
  isLoading, 
  isListening,
  onMicToggle,
  sentiment = 'neutral' 
}: DigitalHumanProps) => {
  const [currentState, setCurrentState] = useState<VideoState>(VideoState.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isLoading) {
      setCurrentState(VideoState.THINKING);
    } else if (isListening) {
      setCurrentState(VideoState.LISTENING);
    } else if (text) {
      setCurrentState(VideoState.SPEAKING);
    } else {
      setCurrentState(VideoState.IDLE);
    }
  }, [text, isLoading, isListening]);

  const getVideoSource = (state: VideoState): string => {
    return `/avatars/${state}.webm`;
  };

  const getBorderColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'ring-green-500/50';
      case 'negative':
        return 'ring-red-500/50';
      default:
        return 'ring-blue-500/50';
    }
  };

  const getStatusText = () => {
    switch (currentState) {
      case VideoState.THINKING:
        return 'Processing your response...';
      case VideoState.SPEAKING:
        return 'Speaking';
      case VideoState.LISTENING:
        return 'Listening...';
      default:
        return 'Ready to help';
    }
  };

  return (
    <Card className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-background to-background/90 shadow-2xl">
      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-20">
        <Badge
          variant="outline"
          className={`${
            currentState === VideoState.SPEAKING
              ? 'bg-green-500/10 text-green-500'
              : currentState === VideoState.THINKING
              ? 'bg-yellow-500/10 text-yellow-500'
              : currentState === VideoState.LISTENING
              ? 'bg-blue-500/10 text-blue-500'
              : 'bg-muted/50'
          }`}
        >
          {getStatusText()}
        </Badge>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
        </button>
        {onMicToggle && (
          <button
            onClick={onMicToggle}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
          >
            {isListening ? (
              <Mic className="w-4 h-4 text-blue-500" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Video Container */}
      <div 
        className={`relative w-full h-full ring-1 transition-all duration-500 ${getBorderColor()}`}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={getVideoSource(currentState)}
          playsInline
          autoPlay
          loop
          muted={isMuted}
          controls={false}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none" />

        {/* Loading Animation */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce" />
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DigitalHuman;
