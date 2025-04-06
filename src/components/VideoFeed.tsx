import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import RPMAvatar from '@/components/RPMAvatar';
import { GripVertical } from 'lucide-react';

interface VideoFeedProps {
  onFrame: (imageData: string) => void;
  botResponse?: string;
  isLoading: boolean;
  avatarState: 'idle' | 'listening' | 'speaking' | 'thinking';
  onStateChange: (state: 'idle' | 'listening' | 'speaking' | 'thinking') => void;
  speechEvents?: Array<{ type: 'start' | 'end' | 'boundary'; value: string }>;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ 
  onFrame, 
  botResponse, 
  isLoading,
  avatarState,
  onStateChange,
  speechEvents = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Motion values for position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    let isComponentMounted = true;

    const startWebcam = async () => {
      try {
        if (!isComponentMounted) return;
        
        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!isComponentMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        video.srcObject = stream;
        
        // Handle play() promise
        try {
          await video.play();
        } catch (playError: unknown) {
          if (playError && typeof playError === 'object' && 'name' in playError && playError.name === 'AbortError') {
            // If play was interrupted, try again after a short delay
            setTimeout(startWebcam, 100);
          } else {
            console.error('Error playing video:', playError);
          }
        }
      } catch (err) {
        if (isComponentMounted) {
          console.error('Error accessing webcam:', err);
        }
      }
    };

    startWebcam();

    return () => {
      isComponentMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (video) {
        video.srcObject = null;
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
    <div className="relative h-full w-full">
      {/* Dr. Sky Avatar Section - Now takes full width */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden shadow-lg group bg-[#e8f4f8] w-full"
        style={{ 
          height: 'calc(100vh - 4rem)',
          maxHeight: '900px',
          background: 'linear-gradient(145deg, #e8f4f8 0%, #e6f3ff 50%, #f0e6ff 100%)'
        }}
      >
        {/* RPM Avatar Container with absolute positioning */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <div className="w-full h-full" style={{ maxWidth: '1600px' }}>
            <RPMAvatar 
              avatarUrl="/models/avatar.glb"
              currentState={avatarState}
              isSpeaking={avatarState === 'speaking'}
              speechText={avatarState === 'speaking' ? botResponse : ''}
              speechEvents={avatarState === 'speaking' ? speechEvents : []}
            />
          </div>
        </div>

        {/* Status Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-4 z-10 flex items-center gap-2"
        >
          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
            <motion.div 
              animate={{ 
                scale: avatarState === 'thinking' ? [1, 1.2, 1] : 1,
                backgroundColor: 
                  avatarState === 'idle' ? '#4ade80' : // Calming green
                  avatarState === 'listening' ? '#818cf8' : // Soft indigo
                  avatarState === 'speaking' ? '#c084fc' : // Gentle purple
                  '#fcd34d' // Warm yellow
              }}
              transition={{ duration: 1, repeat: avatarState === 'thinking' ? Infinity : 0 }}
              className="w-2 h-2 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {avatarState === 'idle' ? 'Ready to Help' : avatarState}
            </span>
          </div>
        </motion.div>

        {/* Emotional Response Indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-xs text-white">
              {avatarState === 'speaking' ? 'Empathetic Response' : 
               avatarState === 'listening' ? 'Active Listening' :
               avatarState === 'thinking' ? 'Processing Emotions' : 'Ready to Help'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Draggable User Video - Responsive sizing */}
      <motion.div 
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          top: 0,
          left: 0,
          right: window.innerWidth - (isMobile ? 160 : 256),
          bottom: window.innerHeight - (isMobile ? 90 : 144)
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute bottom-4 left-4 ${isMobile ? 'w-40' : 'w-64'} rounded-2xl overflow-hidden shadow-lg group bg-transparent z-30 cursor-move hover:ring-2 hover:ring-white/30 transition-all`}
        style={{ 
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-white/70" />
        </div>

        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-2xl"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Subtle Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-slate-900/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent" />
        
        {/* Status Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-2 left-2 flex items-center gap-2 scale-90"
        >
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
            <span className="text-xs font-medium text-white">Live</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VideoFeed;