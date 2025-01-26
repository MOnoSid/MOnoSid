import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface DigitalAvatarProps {
  message: string;
}

const DigitalAvatar = ({ message }: DigitalAvatarProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // This will be implemented once you provide the D-ID API credentials
    // The function will make API calls to D-ID to generate and stream the avatar video
    const generateAvatarResponse = async () => {
      if (!message) return;
      
      // D-ID API integration will go here
      // For now, we'll just show a placeholder
      console.log("Avatar would respond to:", message);
    };

    if (message) {
      generateAvatarResponse();
    }
  }, [message]);

  return (
    <Card className="w-full aspect-video bg-gradient-to-r from-therapy-bg to-white rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
      />
      {!videoRef.current?.src && (
        <div className="absolute inset-0 flex items-center justify-center text-therapy-text">
          <p className="text-lg">Digital Therapist Avatar</p>
        </div>
      )}
    </Card>
  );
};

export default DigitalAvatar;