import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

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
        if (final !== "") {
          setFinalTranscript(final);
          onTranscript(final);
        }
      };

      recognition.onend = () => {
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
      setInterimTranscript("");
      setFinalTranscript("");
      recognition?.start();
      setIsListening(true);
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
        <p className="text-gray-500 italic">{interimTranscript}</p>
      )}
    </div>
  );
};

export default VoiceInput;