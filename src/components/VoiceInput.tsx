import React, { useState, useEffect } from "react";
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
  const [finalTranscript, setFinalTranscript] = useState("");
  const { toast } = useToast();
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);

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
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);
        
        // Reset silence timer on new speech
        if (silenceTimer) clearTimeout(silenceTimer);
        
        // Set new silence timer
        const timer = setTimeout(() => {
          if (final || interim) {
            recognition.stop();
            onTranscript(final || interim);
            setInterimTranscript("");
            setFinalTranscript("");
          }
        }, 1500); // 1.5 seconds of silence will trigger completion
        
        setSilenceTimer(timer);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimer) clearTimeout(silenceTimer);
        toast({
          title: "Listening stopped",
          description: "Click the microphone to start again.",
        });
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
      setFinalTranscript("");
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