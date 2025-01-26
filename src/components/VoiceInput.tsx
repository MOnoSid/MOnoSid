import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "You can start speaking now.",
        });
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            onTranscript(transcript);
            setInterimTranscript("");
            recognition.stop();
          } else {
            interim += transcript;
          }
        }
        
        setInterimTranscript(interim);

        // Reset the timeout on new speech
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout for silence detection
        timeoutRef.current = setTimeout(() => {
          if (interim) {
            onTranscript(interim);
            setInterimTranscript("");
            recognition.stop();
          }
        }, 1500); // 1.5 seconds of silence will trigger completion
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was an error with speech recognition.",
        });
      };

      setRecognition(recognition);
    }
  }, [onTranscript, toast]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setInterimTranscript("");
      recognition?.start();
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={toggleListening}
        className={`${
          isListening
            ? "bg-therapy-secondary hover:bg-therapy-secondary/90"
            : "bg-therapy-primary hover:bg-therapy-primary/90"
        } text-white transition-all duration-300 rounded-full px-6 py-3 shadow-lg hover:shadow-xl`}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5 mr-2" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            Start Listening
          </>
        )}
      </Button>
      {interimTranscript && (
        <p className="text-gray-500 italic mt-2">{interimTranscript}</p>
      )}
    </div>
  );
};

export default VoiceInput;