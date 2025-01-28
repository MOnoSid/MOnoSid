import React, { useState, useEffect, useRef } from 'react';
import { speak, stopSpeaking } from '@/utils/tts';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send } from "lucide-react"
import { toast } from "sonner"

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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSpeakingRef = useRef(false);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission
      setHasMicPermission(true);
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Please allow microphone access to use voice input");
      setHasMicPermission(false);
      return false;
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    const setupRecognition = () => {
      try {
        if (!recognitionRef.current) {
          const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SpeechRecognitionImpl) {
            toast.error("Speech recognition is not supported in your browser");
            return;
          }
          
          recognitionRef.current = new SpeechRecognitionImpl();
          const recognition = recognitionRef.current;
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onstart = () => {
            setIsListening(true);
            onStateChange?.('listening');
            toast.success("Listening...");
          };

          recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);

            if (event.results[current].isFinal) {
              onTranscript(transcriptText);
              setTranscript('');
              if (!isContinuousMode) {
                recognition.stop();
              }
            }
          };

          recognition.onend = () => {
            setIsListening(false);
            if (!isProcessing && !isSpeakingRef.current) {
              onStateChange?.('idle');
              // If in continuous mode and not processing, start listening again
              if (isContinuousMode && !isProcessing && !isSpeakingRef.current) {
                setTimeout(() => startListening(), 1000);
              }
            }
          };

          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            if (event.error !== 'aborted') {
              toast.error(`Speech recognition error: ${event.error}`);
            }
            onStateChange?.('idle');
            setIsContinuousMode(false);
          };
        }
      } catch (error) {
        console.error('Error setting up speech recognition:', error);
        toast.error("Failed to initialize speech recognition");
      }
    };

    setupRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, onStateChange, isProcessing, isContinuousMode]);

  // Handle bot's text-to-speech response
  useEffect(() => {
    if (lastResponse && !isProcessing) {
      // Stop any ongoing listening
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort();
        setIsListening(false);
      }

      // Mark as speaking and update state
      isSpeakingRef.current = true;
      onStateChange?.('speaking');

      // Speak the response
      speak(lastResponse)
        .then(() => {
          // After speaking finishes, wait a moment then start listening again if in continuous mode
          setTimeout(() => {
            isSpeakingRef.current = false;
            if (!isProcessing && isContinuousMode) {
              startListening();
            } else {
              onStateChange?.('idle');
            }
          }, 1000);
        })
        .catch((error) => {
          console.error('Text-to-speech error:', error);
          toast.error("Failed to speak response");
          isSpeakingRef.current = false;
          onStateChange?.('idle');
          setIsContinuousMode(false);
        });

      return () => {
        stopSpeaking();
        isSpeakingRef.current = false;
      };
    }
  }, [lastResponse, isProcessing, onStateChange, isListening, isContinuousMode]);

  // Handle processing state
  useEffect(() => {
    if (isProcessing) {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort();
        setIsListening(false);
      }
      onStateChange?.('thinking');
    }
  }, [isProcessing, isListening, onStateChange]);

  const startListening = async () => {
    if (!recognitionRef.current || isSpeakingRef.current || isProcessing) return;
    
    try {
      // Check/request microphone permission before starting
      const hasPermission = hasMicPermission || await requestMicrophonePermission();
      if (!hasPermission) return;

      recognitionRef.current.start();
      setIsListening(true);
      onStateChange?.('listening');
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error("Failed to start listening");
      setIsListening(false);
      onStateChange?.('idle');
      setIsContinuousMode(false);
    }
  };

  const toggleContinuousMode = async () => {
    if (!isContinuousMode) {
      // Check/request microphone permission before enabling continuous mode
      const hasPermission = hasMicPermission || await requestMicrophonePermission();
      if (!hasPermission) return;

      setIsContinuousMode(true);
      startListening();
    } else {
      setIsContinuousMode(false);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
      setIsListening(false);
      onStateChange?.('idle');
    }
  };

  const handleSendText = () => {
    if (inputText.trim()) {
      onTranscript(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            transcript || 
            (isListening ? 'Listening...' : 
            isSpeakingRef.current ? 'Bot is speaking...' : 
            isProcessing ? 'Processing...' : 
            'Type a message or click microphone to speak...')
          }
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            size="icon"
            variant={isContinuousMode ? "default" : "ghost"}
            onClick={toggleContinuousMode}
            disabled={isProcessing || isSpeakingRef.current}
            className={`transition-colors ${isContinuousMode ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSendText}
            disabled={!inputText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;