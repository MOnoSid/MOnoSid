import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Wand2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "listening" | "speaking" | "thinking">("idle");

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setStatus("listening");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setStatus("thinking");
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatus("idle");
      };

      setRecognition(recognition);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-[#2A2F3C] rounded-lg p-3">
      <Button
        onClick={toggleListening}
        variant="ghost"
        size="icon"
        className={`${
          isListening ? "text-red-500" : "text-white"
        } hover:bg-[#1A1F2C]`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>
      
      <input
        type="text"
        placeholder="Type your message or click the AI to start interaction..."
        className="flex-1 bg-transparent text-white border-none focus:outline-none"
        disabled={isListening}
      />

      <div className="flex items-center gap-2">
        {status !== "idle" && (
          <span className="text-sm text-gray-400 capitalize">{status}...</span>
        )}
        <Button variant="ghost" size="icon" className="text-white hover:bg-[#1A1F2C]">
          <Wand2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default VoiceInput;