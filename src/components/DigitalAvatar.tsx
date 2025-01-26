import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface DigitalAvatarProps {
  message: string;
}

const D_ID_API_KEY = "MjJocDFhNDI1NUBhbGlldC5hYy5pbg:3STcyu7tL6uRZPbIDQC9S";
const D_ID_API_URL = "https://api.d-id.com";

const DigitalAvatar = ({ message }: DigitalAvatarProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const generateAvatarResponse = async () => {
      if (!message) return;
      
      setIsLoading(true);
      try {
        // First, create a talk
        const talkResponse = await fetch(`${D_ID_API_URL}/talks`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${D_ID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: {
              type: 'text',
              input: message,
              provider: {
                type: 'microsoft',
                voice_id: 'en-US-JennyNeural'
              }
            },
            config: {
              stitch: true,
            },
            source_url: "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg"
          }),
        });

        if (!talkResponse.ok) {
          throw new Error('Failed to create talk');
        }

        const talkData = await talkResponse.json();
        
        // Poll for the result
        const checkResult = async () => {
          const resultResponse = await fetch(`${D_ID_API_URL}/talks/${talkData.id}`, {
            headers: {
              'Authorization': `Basic ${D_ID_API_KEY}`,
            },
          });

          if (!resultResponse.ok) {
            throw new Error('Failed to get talk status');
          }

          const resultData = await resultResponse.json();

          if (resultData.status === 'done') {
            if (videoRef.current) {
              videoRef.current.src = resultData.result_url;
            }
            setIsLoading(false);
          } else if (resultData.status === 'error') {
            throw new Error('Talk generation failed');
          } else {
            // Continue polling
            setTimeout(checkResult, 1000);
          }
        };

        await checkResult();

      } catch (error) {
        console.error('Error generating avatar response:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate avatar response. Please try again.",
        });
        setIsLoading(false);
      }
    };

    if (message) {
      generateAvatarResponse();
    }
  }, [message, toast]);

  return (
    <Card className="w-full aspect-video bg-gradient-to-r from-therapy-bg to-white rounded-xl overflow-hidden shadow-lg relative">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
      />
      {!videoRef.current?.src && (
        <div className="absolute inset-0 flex items-center justify-center text-therapy-text">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-therapy-primary"></div>
              <p className="text-lg">Generating response...</p>
            </div>
          ) : (
            <p className="text-lg">Digital Therapist Avatar</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default DigitalAvatar;