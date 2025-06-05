import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import './VoiceInput.css'; // Import CSS for responsive styles
import { ZyphraClient } from '@zyphra/client';
const MAX_UTTERANCE_LENGTH = 300; // Increased for ElevenLabs

// ElevenLabs configuration - use import.meta.env for Vite/Next.js
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const VOICE_ID = 'XeomjLZoU5rr4yNIg16w'; //56AoDkrOh6qfVPDXZ7Pt

// Add TypeScript interfaces
interface AudioContextWithWebkit extends AudioContext {
  webkitAudioContext?: AudioContext;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface AudioQueueItem {
  text: string;
  audioBuffer?: ArrayBuffer;
}

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

// Function to get available languages
const getAvailableLanguages = async (): Promise<string[]> => {
  if (!window.speechSynthesis) return [];
  
  // Wait for voices to be loaded
  if (speechSynthesis.getVoices().length === 0) {
    await new Promise(resolve => {
      speechSynthesis.addEventListener('voiceschanged', resolve, { once: true });
    });
  }

  // Get all available voices
  const voices = speechSynthesis.getVoices();
  
  // Extract unique language codes
  const languages = [...new Set(voices.map(voice => voice.lang))];
  
  return languages.sort();
};

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isProcessing: boolean;
  lastResponse?: string;
  onStateChange?: (state: 'idle' | 'listening' | 'speaking' | 'thinking') => void;
  onSpeechEvent?: (event: { type: 'start' | 'end' | 'boundary' | 'error', value?: string }) => void;
  autoStart?: boolean;
  language?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  isProcessing,
  lastResponse,
  onStateChange,
  onSpeechEvent,
  autoStart = false,
  language = ''
}) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueueItem[]>([]);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Function to start speech recognition
  const startListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      onStateChange?.('listening');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  // Initialize Web Audio API context
  useEffect(() => {
    const AudioContextClass = (window.AudioContext || window.webkitAudioContext) as typeof AudioContext;
    audioContextRef.current = new AudioContextClass();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        // Add language detection handler
        recognition.onlanguagechange = (event: any) => {
          if (event.language) {
            setDetectedLanguage(event.language);
            console.log('Detected language:', event.language);
          }
        };

        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentAudioSourceRef.current) {
        currentAudioSourceRef.current.stop();
      }
      setCurrentTranscript('');
    };
  }, [language]);

  
  // ElevenLabs TTS function
  const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not found');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    return await response.arrayBuffer();
  };

  // Process the audio queue
  const processAudioQueue = async () => {
    if (audioQueueRef.current.length === 0 || isSpeakingRef.current) {
      return;
    }

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    onStateChange?.('speaking');

    while (audioQueueRef.current.length > 0) {
      const item = audioQueueRef.current[0];
      
      try {
        // Generate speech if not already generated
        if (!item.audioBuffer) {
          item.audioBuffer = await generateSpeech(item.text);
        }

        // Decode the audio buffer before starting playback
        if (!audioContextRef.current) return;
        const buffer = await audioContextRef.current.decodeAudioData(item.audioBuffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        
        currentAudioSourceRef.current = source;

        // Calculate word timings based on audio duration
        const words = item.text.split(/\s+/);
        const audioDuration = buffer.duration * 1000; // Convert to milliseconds
        const averageWordDuration = audioDuration / words.length;
        
        // Set up the 'ended' event handler before starting playback
        const playbackPromise = new Promise<void>((resolve, reject) => {
          source.addEventListener('ended', () => {
            currentAudioSourceRef.current = null;
            resolve();
          });
          source.addEventListener('error', (error) => {
            reject(error);
          });
        });

        // Emit start event just before audio playback
        onSpeechEvent?.({ type: 'start' });
        
        // Add a small delay to ensure the avatar has time to prepare for lip-sync
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Start audio playback
        source.start(0);
        
        // Schedule word boundary events based on audio timing
        words.forEach((word, index) => {
          setTimeout(() => {
            onSpeechEvent?.({ type: 'boundary', value: word });
          }, index * averageWordDuration);
        });
        
        // Wait for audio playback to complete
        await playbackPromise;
        
        // Remove the played item
        audioQueueRef.current.shift();
        
        // Small pause between chunks
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error processing audio:', error);
        audioQueueRef.current.shift(); // Remove failed item
      }
    }

    isSpeakingRef.current = false;
    setIsSpeaking(false);
    onSpeechEvent?.({ type: 'end' });
    onStateChange?.('idle');
    startListeningWithDelay();
  };

  // Handle AI response
  useEffect(() => {
    if (!lastResponse || !isActive || isProcessing) return;

    const textChunks = splitTextIntoChunks(lastResponse);
    
    // Reset the queue
    audioQueueRef.current = textChunks.map(text => ({ text }));
    
    // Stop listening while speaking
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Start processing the queue
    processAudioQueue();

    return () => {
      // Cleanup
      if (currentAudioSourceRef.current) {
        currentAudioSourceRef.current.stop();
      }
      setIsSpeaking(false);
    };
  }, [lastResponse, isActive, isProcessing]);

  // Handle conversation toggle
  const toggleConversation = async () => {
    if (isActive) {
      setIsActive(false);
      setIsSpeaking(false);
      if (currentAudioSourceRef.current) {
        currentAudioSourceRef.current.stop();
      }
      onStateChange?.('idle');
    } else {
      setIsActive(true);
      startListening();
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
        .map((result: any) => {
          // Log detected language from the result
          if (result[0].lang) {
            setDetectedLanguage(result[0].lang);
            console.log('Speech recognized in:', result[0].lang);
          }
          return result[0].transcript;
        })
        .join(' ');
      
      // Always update the current transcript for display
      setCurrentTranscript(transcript);
      
      // Only send final results to the AI if we're not speaking
      if (event.results[0].isFinal && transcript.trim() && !isSpeaking) {
        onTranscript(transcript.trim());
        setCurrentTranscript('');
        onStateChange?.('thinking');
      }
    };

    recognition.onend = () => {
      // Only restart recognition if active and not processing or speaking
      if (isActive && !isProcessing && !isSpeaking) {
        // Small delay before restarting
        setTimeout(startListening, 300);
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

  return (
    <div className="relative">
      {/* Transcript Overlay - improved for mobile */}
      {isActive && !isProcessing && currentTranscript && !isSpeaking && (
        <div className="absolute -top-[4.5rem] md:-top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-3xl px-4 z-10">
          <div className="bg-black/60 backdrop-blur-sm text-white rounded-xl p-3 text-center">
            <p className="text-sm font-medium whitespace-normal break-words leading-relaxed">
              {currentTranscript}
            </p>
          </div>
        </div>
      )}

      {/* Status Message - improved for mobile */}
      {isActive && (isSpeaking || isProcessing || currentTranscript) && (
        <div className="absolute -top-[4.5rem] md:-top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-3xl px-4 z-10">
          <div className="bg-black/60 backdrop-blur-sm text-white rounded-xl p-3 text-center flex flex-col gap-1">
            <p className="text-sm font-medium whitespace-normal">
              {isSpeaking ? "Listening will resume after response" : 
               isProcessing ? "Processing your message..." : 
               "Listening..."}
            </p>
            {detectedLanguage && (
              <p className="text-xs text-white/70">
                Detected Language: {new Intl.DisplayNames([navigator.language], { type: 'language' }).of(detectedLanguage)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Button - improved for mobile and more professional */}
      <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[100]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="default"
                onClick={toggleConversation}
                disabled={isProcessing}
                className={`relative group h-12 w-12 md:h-14 md:w-14 rounded-full shadow-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-red-500/90 hover:bg-red-600 text-white' 
                    : 'bg-emerald-500/90 hover:bg-emerald-600 text-white'
                }`}
              >
                <div className="relative z-10">
                  {isActive ? (
                    <VideoOff className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    <Mic className="h-5 w-5 md:h-6 md:w-6" />
                  )}
                </div>

                {/* Subtle glow effect */}
                <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                  isActive ? 'bg-red-500' : 'bg-emerald-500'
                } opacity-0 group-hover:opacity-20 blur-sm`} />

                {/* Subtle pulse for active state */}
                {isActive && (
                  <div className="absolute -inset-0.5 rounded-full animate-pulse opacity-20 bg-white/20" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="left"
              className="bg-white/95 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-sm font-medium text-slate-800 shadow-xl"
            >
              {isActive ? 'End Voice Session' : 'Start Voice Session'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* More subtle processing indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
                isProcessing ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isProcessing ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;