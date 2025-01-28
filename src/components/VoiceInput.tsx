import React, { useState, useEffect, useRef } from 'react';
import { speak, stopSpeaking } from '@/utils/tts';

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
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSpeakingRef = useRef(false);

  // Start listening for user input
  const startListening = () => {
    if (!recognitionRef.current || isSpeakingRef.current || !isConversationActive) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      onStateChange?.('listening');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    const setupRecognition = () => {
      if (!recognitionRef.current) {
        recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        const recognition = recognitionRef.current;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          onStateChange?.('listening');
        };

        recognition.onresult = (event) => {
          if (isSpeakingRef.current) {
            recognition.abort();
            return;
          }

          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
            onTranscript(transcriptText);
            setTranscript('');
            recognition.stop(); // Stop after getting final result
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // Don't automatically restart - wait for bot response
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          // Wait a bit and try to restart listening if still in conversation
          setTimeout(() => {
            if (isConversationActive && !isSpeakingRef.current && !isProcessing) {
              startListening();
            }
          }, 1000);
        };
      }
    };

    setupRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isConversationActive, isProcessing, onTranscript, onStateChange]);

  // Handle bot's text-to-speech response
  useEffect(() => {
    if (lastResponse && isConversationActive) {
      // Stop any ongoing listening
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort();
        setIsListening(false);
      }

      // Mark as speaking and update state
      isSpeakingRef.current = true;
      onStateChange?.('speaking');

      // Speak the response
      speak(lastResponse, () => {
        // After speaking finishes, wait a moment then start listening again
        setTimeout(() => {
          isSpeakingRef.current = false;
          if (isConversationActive && !isProcessing) {
            startListening(); // Resume listening for next user input
          }
        }, 1000); // Short pause after speaking
      });

      return () => {
        stopSpeaking();
        isSpeakingRef.current = false;
      };
    }
  }, [lastResponse, isConversationActive, isProcessing, onStateChange, isListening]);

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

  const startConversation = () => {
    setIsConversationActive(true);
    startListening();
  };

  const stopConversation = () => {
    setIsConversationActive(false);
    setIsListening(false);
    isSpeakingRef.current = false;
    stopSpeaking();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    onStateChange?.('idle');
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm text-therapy-text-muted">
          {transcript || (isListening ? 'Listening...' : 
            isSpeakingRef.current ? 'Bot is speaking...' : 
            isProcessing ? 'Processing...' :
            isConversationActive ? 'Ready for your input...' : 
            'Click to start conversation')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Start Button */}
        <button
          onClick={startConversation}
          disabled={isConversationActive}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full 
            ${isConversationActive 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800'
            }
            transition-colors duration-200
          `}
          title="Start conversation"
        >
          {/* Equalizer Icon */}
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="4" y="10" width="2" height="4" className={`${isListening ? 'animate-eq1' : ''}`} />
            <rect x="8" y="8" width="2" height="8" className={`${isListening ? 'animate-eq2' : ''}`} />
            <rect x="12" y="4" width="2" height="16" className={`${isListening ? 'animate-eq3' : ''}`} />
            <rect x="16" y="8" width="2" height="8" className={`${isListening ? 'animate-eq2' : ''}`} />
            <rect x="20" y="10" width="2" height="4" className={`${isListening ? 'animate-eq1' : ''}`} />
          </svg>
        </button>

        {/* Stop Button */}
        {isConversationActive && (
          <button
            onClick={stopConversation}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
            title="Stop conversation"
          >
            {/* Stop Icon */}
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;