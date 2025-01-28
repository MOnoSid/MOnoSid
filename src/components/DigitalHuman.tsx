import React, { useEffect, useRef, useState } from 'react';

enum VideoState {
  SPEAKING = 'speaking',
  THINKING = 'thinking',
  IDLE = 'idle'
}

interface DigitalHumanProps {
  text?: string;
  isLoading?: boolean;
}

const DigitalHuman = ({ text, isLoading }: DigitalHumanProps) => {
  const [currentState, setCurrentState] = useState<VideoState>(VideoState.IDLE);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isLoading) {
      setCurrentState(VideoState.THINKING);
    } else if (text) {
      setCurrentState(VideoState.SPEAKING);
    } else {
      setCurrentState(VideoState.IDLE);
    }
  }, [text, isLoading]);

  const getVideoSource = (state: VideoState): string => {
    return `/avatars/${state}.mp4`;
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-therapy-surface">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={getVideoSource(currentState)}
        playsInline
        autoPlay
        loop
        muted={false}
        controls={false}
      />

      {/* State Text Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-therapy-surface/50">
        <p className="text-therapy-text-muted">
          {currentState === VideoState.THINKING ? 'Thinking...' : 
           currentState === VideoState.SPEAKING ? 'Speaking...' : 
           'Ready to help'}
        </p>
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default DigitalHuman;
