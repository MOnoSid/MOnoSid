// Speech synthesis utility
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isSpeaking = false;
let remainingChunks: string[] = [];

const splitTextIntoChunks = (text: string): string[] => {
  // Split by sentences while keeping punctuation
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < 200) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

const speakChunk = (chunk: string, onComplete: () => void, onError: (error: any) => void) => {
  const utterance = new SpeechSynthesisUtterance(chunk);
  currentUtterance = utterance;

  // Configure voice settings
  utterance.rate = 1.0;  // Speed of speech
  utterance.pitch = 1.0; // Pitch of voice
  utterance.volume = 1.0; // Volume

  // Try to use a female voice if available
  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => 
    voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
  );
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    onComplete();
  };

  utterance.onerror = (error) => {
    currentUtterance = null;
    onError(error);
  };

  speechSynthesis.speak(utterance);
};

export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Stop any ongoing speech
      stopSpeaking();

      // Split text into chunks
      const chunks = splitTextIntoChunks(text);
      if (chunks.length === 0) {
        resolve();
        return;
      }

      remainingChunks = [...chunks];
      isSpeaking = true;

      const speakNextChunk = () => {
        if (remainingChunks.length === 0) {
          isSpeaking = false;
          resolve();
          return;
        }

        const chunk = remainingChunks.shift()!;
        speakChunk(
          chunk,
          // On complete
          () => {
            if (isSpeaking) {
              speakNextChunk();
            }
          },
          // On error
          (error) => {
            isSpeaking = false;
            remainingChunks = [];
            reject(error);
          }
        );
      };

      speakNextChunk();
    } catch (error) {
      isSpeaking = false;
      remainingChunks = [];
      reject(error);
    }
  });
};

// Cancel any ongoing speech
export const stopSpeaking = () => {
  if (isSpeaking || currentUtterance) {
    speechSynthesis.cancel();
    isSpeaking = false;
    currentUtterance = null;
    remainingChunks = [];
  }
};
