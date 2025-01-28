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

  // Initialize speech recognition
  useEffect(() => {
    const setupRecognition = () => {
      if (!recognitionRef.current) {
        recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          onStateChange?.('listening');
        };

        recognition.onresult = (event) => {
          // Ignore results if bot is speaking
          if (isSpeakingRef.current) return;

          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
            onTranscript(transcriptText);
            setTranscript('');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // Only restart if the conversation is active and bot is not speaking
          if (isConversationActive && !isSpeakingRef.current && !isProcessing) {
            recognition.start();
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (isConversationActive && !isSpeakingRef.current && !isProcessing) {
            // Try to restart on error if conversation is active and bot is not speaking
            setTimeout(() => {
              if (isConversationActive && !isSpeakingRef.current && !isProcessing) {
                recognition.start();
              }
            }, 1000);
          }
        };
      }
    };

    setupRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isConversationActive, isProcessing, onTranscript, onStateChange]);

  // Handle bot's text-to-speech response
  useEffect(() => {
    if (lastResponse && isConversationActive) {
      // Stop listening while bot speaks
      isSpeakingRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      onStateChange?.('speaking');

      // Speak the response
      speak(lastResponse, () => {
        // Resume listening after speaking finishes
        isSpeakingRef.current = false;
        if (isConversationActive && !isProcessing) {
          recognitionRef.current?.start();
        }
      });

      return () => {
        stopSpeaking();
        isSpeakingRef.current = false;
      };
    }
  }, [lastResponse, isConversationActive, isProcessing, onStateChange]);

  // Handle processing state
  useEffect(() => {
    if (isProcessing && isListening) {
      recognitionRef.current?.stop();
    }
  }, [isProcessing, isListening]);

  const startConversation = () => {
    setIsConversationActive(true);
    recognitionRef.current?.start();
  };

  const stopConversation = () => {
    setIsConversationActive(false);
    setIsListening(false);
    isSpeakingRef.current = false;
    stopSpeaking();
    recognitionRef.current?.stop();
    onStateChange?.('idle');
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm text-therapy-text-muted">
          {transcript || (isListening ? 'Listening...' : 
            isSpeakingRef.current ? 'Bot is speaking...' : 
            isConversationActive ? 'Conversation active...' : 
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