export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) => voice.name.includes("Google") || voice.name.includes("Female")
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    
    window.speechSynthesis.speak(utterance);
  });
};