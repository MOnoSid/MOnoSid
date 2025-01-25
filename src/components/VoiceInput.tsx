import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");

        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  return (
    <Button
      onClick={toggleListening}
      className={`${
        isListening ? "bg-therapy-secondary" : "bg-therapy-primary"
      } text-white hover:opacity-90 transition-all duration-200`}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4 mr-2" />
          Stop Listening
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 mr-2" />
          Start Listening
        </>
      )}
    </Button>
  );
};

export default VoiceInput;