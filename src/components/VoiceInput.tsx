import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { PhoneCall, PhoneOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isProcessing: boolean;
  lastResponse?: string;
  onStateChange?: (state: 'idle' | 'listening' | 'speaking' | 'thinking') => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  isProcessing,
  lastResponse,
  onStateChange
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true; // Enable interim results for real-time transcript
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setCurrentTranscript('');
    };
  }, []);

  // Handle start/stop listening
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        onStateChange?.('listening');
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    }
  };

  // Set up recognition event handlers
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      // Update current transcript for display
      setCurrentTranscript(transcript);
      
      // Only send final results to the AI
      if (event.results[0].isFinal && transcript.trim()) {
        onTranscript(transcript.trim());
        setCurrentTranscript('');
        onStateChange?.('thinking');
      }
    };

    recognition.onend = () => {
      if (isActive && !isProcessing) {
        // Small delay before restarting
        setTimeout(startListening, 100);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsActive(false);
      }
      setCurrentTranscript('');
    };
  }, [isActive, isProcessing, onTranscript, onStateChange]);

  // Handle AI response
  useEffect(() => {
    if (!lastResponse || !isActive || !window.speechSynthesis) return;

    stopListening();
    
    const utterance = new SpeechSynthesisUtterance(lastResponse);
    synthesisRef.current = utterance;

    // Get voices and select a female English voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => 
      v.lang.includes('en') && v.name.includes('Female')
    ) || voices.find(v => v.lang.includes('en')) || voices[0];

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      onStateChange?.('speaking');
    };

    utterance.onend = () => {
      if (isActive && !isProcessing) {
        startListening();
      }
      synthesisRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Synthesis error:', event);
      if (isActive && !isProcessing) {
        startListening();
      }
      synthesisRef.current = null;
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [lastResponse, isActive, isProcessing, onStateChange]);

  // Handle conversation toggle
  const toggleConversation = async () => {
    if (isActive) {
      setIsActive(false);
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      onStateChange?.('idle');
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsActive(true);
        startListening();
      } catch (error) {
        console.error('Microphone access denied:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {isActive && !isProcessing && currentTranscript && (
        <div className="text-lg text-gray-700 bg-gray-100 rounded-lg p-4 min-h-[50px] w-full max-w-2xl text-center">
          {currentTranscript}
        </div>
      )}
      <Button
        size="lg"
        variant={isActive ? "destructive" : "default"}
        onClick={toggleConversation}
        disabled={isProcessing}
        className={`transition-all ${
          isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isActive ? (
          <>
            <PhoneOff className="h-5 w-5 mr-2" />
            {isProcessing ? 'Processing...' : 'End Session'}
          </>
        ) : (
          <>
            <PhoneCall className="h-5 w-5 mr-2" />
            Start Session
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceInput;