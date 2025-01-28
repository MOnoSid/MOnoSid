import React, { useRef, useEffect } from 'react';

interface VideoFeedProps {
  onFrame: (imageData: string) => void;
  botResponse?: string;
  isLoading: boolean;
  avatarState: 'idle' | 'listening' | 'speaking' | 'thinking';
}

const VideoFeed: React.FC<VideoFeedProps> = ({ 
  onFrame, 
  botResponse, 
  isLoading,
  avatarState
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);

  // Handle avatar video playback
  useEffect(() => {
    const avatarVideo = avatarVideoRef.current;
    if (!avatarVideo) return;

    const playVideo = async () => {
      try {
        // Preload the video
        const videoPath = `/avatars/${avatarState}.webm`;
        avatarVideo.src = videoPath;
        avatarVideo.load();

        // Play when loaded
        avatarVideo.onloadeddata = async () => {
          try {
            await avatarVideo.play();
            
            // Loop the video
            avatarVideo.onended = () => {
              if (avatarVideo.src.includes(avatarState)) { // Only loop if state hasn't changed
                avatarVideo.currentTime = 0;
                avatarVideo.play().catch(console.error);
              }
            };
          } catch (error) {
            console.error('Error playing avatar video:', error);
          }
        };
      } catch (error) {
        console.error('Error loading avatar video:', error);
      }
    };

    playVideo();

    return () => {
      avatarVideo.onloadeddata = null;
      avatarVideo.onended = null;
      avatarVideo.pause();
      avatarVideo.src = '';
    };
  }, [avatarState]);

  // Handle webcam capture
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }
    };

    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        await video.play();
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle frame capture
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !onFrame) return;

    const captureInterval = setInterval(() => {
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      onFrame(imageData);
    }, 1000); // Capture every second

    return () => clearInterval(captureInterval);
  }, [onFrame]);

  return (
    <div className="grid grid-cols-2 h-full gap-4 p-4">
      {/* User Video */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Avatar Video */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
        <video
          ref={avatarVideoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Status Indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full text-white text-sm">
          <div className={`w-2 h-2 rounded-full ${
            avatarState === 'idle' ? 'bg-green-400' :
            avatarState === 'listening' ? 'bg-blue-400' :
            avatarState === 'speaking' ? 'bg-purple-400' :
            'bg-yellow-400 animate-pulse'
          }`} />
          <span className="capitalize">{avatarState}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;