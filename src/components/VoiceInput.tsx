import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { PhoneCall, PhoneOff } from "lucide-react";

const MAX_UTTERANCE_LENGTH = 200; // Maximum length for each utterance chunk

const splitTextIntoChunks = (text: string): string[] => {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_UTTERANCE_LENGTH) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

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
  const [isSpeaking, setIsSpeaking] = useState(false);
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

  // Add this function to handle speech recognition start
  const startListeningWithDelay = () => {
    // Add a delay before starting to listen to avoid picking up the AI's response
    setTimeout(() => {
      if (isActive && !isProcessing && !isSpeaking) {
        startListening();
      }
    }, 1000); // 1 second delay
  };

  // Set up recognition event handlers
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      
      // Only process the transcript if we're not speaking
      if (!isSpeaking) {
        // Update current transcript for display
        setCurrentTranscript(transcript);
        
        // Only send final results to the AI
        if (event.results[0].isFinal && transcript.trim()) {
          onTranscript(transcript.trim());
          setCurrentTranscript('');
          onStateChange?.('thinking');
        }
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
  }, [isActive, isProcessing, onTranscript, onStateChange, isSpeaking]);

  // Handle AI response
  useEffect(() => {
    if (!lastResponse || !isActive || isProcessing) return;

    const textChunks = splitTextIntoChunks(lastResponse);
    let currentChunkIndex = 0;

    const speakNextChunk = () => {
      if (currentChunkIndex >= textChunks.length) {
        setIsSpeaking(false);
        startListeningWithDelay();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textChunks[currentChunkIndex]);
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Samantha') || 
        v.name.includes('Google UK English Female')
      );
      
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStateChange?.('speaking');
      };

      utterance.onend = () => {
        currentChunkIndex++;
        if (currentChunkIndex < textChunks.length) {
          setTimeout(() => speakNextChunk(), 300); // Add small pause between chunks
        } else {
          setIsSpeaking(false);
          startListeningWithDelay();
        }
        synthesisRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Synthesis error:', event);
        currentChunkIndex++;
        if (currentChunkIndex < textChunks.length) {
          setTimeout(() => speakNextChunk(), 500);
        } else {
          setIsSpeaking(false);
          startListeningWithDelay();
        }
        synthesisRef.current = null;
      };

      // Stop listening while speaking
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
          synthesisRef.current = utterance;
        } catch (error) {
          console.error('Speech synthesis error:', error);
          setIsSpeaking(false);
        }
      }, 100);
    };

    speakNextChunk();

    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [lastResponse, isActive, isProcessing, onStateChange]);

  // Handle conversation toggle
  const toggleConversation = async () => {
    if (isActive) {
      setIsActive(false);
      setIsSpeaking(false);
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      onStateChange?.('idle');
    } else {
      setIsActive(true);
      startListening();
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