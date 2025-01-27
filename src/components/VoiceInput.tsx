import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isProcessing: boolean;
}

const VoiceInput = ({ onTranscript, isProcessing }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onTranscript(inputText);
      setInputText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4 bg-[#2A2F3C] rounded-lg p-3">
      <Button
        type="button"
        onClick={toggleListening}
        variant="ghost"
        size="icon"
        className={`${
          isListening ? "text-red-500" : "text-white"
        } hover:bg-[#1A1F2C]`}
        disabled={isProcessing}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>
      
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your message or click the microphone to start speaking..."
        className="flex-1 bg-transparent text-white border-none focus:outline-none"
        disabled={isListening || isProcessing}
      />

      {(status !== "idle" || isProcessing) && (
        <span className="text-sm text-gray-400 capitalize">
          {isProcessing ? "Processing..." : `${status}...`}
        </span>
      )}

      <Button 
        type="submit" 
        variant="ghost" 
        size="icon"
        disabled={(!inputText.trim() && !isListening) || isProcessing}
        className="text-white hover:bg-[#1A1F2C]"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </form>
  );
};

export default VoiceInput;