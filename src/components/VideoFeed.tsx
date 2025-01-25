import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface VideoFeedProps {
  onFrame: (imageData: string) => void;
}

const VideoFeed = ({ onFrame }: VideoFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startVideo();

    // Cleanup
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const captureInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.drawImage(videoRef.current, 0, 0, 640, 480);
          const imageData = canvasRef.current.toDataURL("image/jpeg");
          onFrame(imageData);
        }
      }
    }, 1000); // Capture frame every second

    return () => clearInterval(captureInterval);
  }, [onFrame]);

  return (
    <Card className="relative overflow-hidden rounded-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto"
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="hidden"
      />
    </Card>
  );
};

export default VideoFeed;