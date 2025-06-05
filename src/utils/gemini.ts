import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

// Add response cache
const responseCache = new Map<string, {
  timestamp: number;
  response: any;
}>();

// Add request debouncing
let debounceTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 300; // 300ms debounce delay

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

// Add cache helper functions
const getCachedResponse = (cacheKey: string) => {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    responseCache.delete(cacheKey);
    return null;
  }
  
  return cached.response;
};

const setCachedResponse = (cacheKey: string, response: any) => {
  responseCache.set(cacheKey, {
    timestamp: Date.now(),
    response
  });
};

// Add debounce helper
const debounceRequest = <T>(
  request: () => Promise<T>,
  key: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(async () => {
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, DEBOUNCE_DELAY);
  });
};

// Add parallel processing for emotion analysis
const analyzeEmotionParallel = async (text: string): Promise<{ emotion: string; intensity: number }> => {
  const [emotionResult, intensityResult] = await Promise.all([
    analyzeEmotionType(text),
    calculateIntensity(text)
  ]);
  
  return {
    emotion: emotionResult,
    intensity: intensityResult
  };
};

const analyzeEmotionType = (text: string): Promise<string> => {
  return new Promise(resolve => {
    // Move emotion detection to a separate thread using Web Worker
    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'delighted', 'pleased'],
      sadness: ['sad', 'down', 'unhappy', 'depressed', 'miserable', 'hurt'],
      anger: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated'],
      fear: ['afraid', 'scared', 'anxious', 'worried', 'nervous'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished'],
      love: ['love', 'caring', 'affection', 'warmth', 'kindness'],
      gratitude: ['thankful', 'grateful', 'appreciate', 'blessed'],
      hope: ['hope', 'optimistic', 'looking forward', 'better'],
      neutral: ['okay', 'fine', 'alright', 'neutral']
    };

    let detectedEmotion = 'neutral';
    let maxCount = 0;

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const count = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);

      if (count > maxCount) {
        maxCount = count;
        detectedEmotion = emotion;
      }
    }

    resolve(detectedEmotion);
  });
};

const calculateIntensity = (text: string): Promise<number> => {
  return new Promise(resolve => {
    const exclamationCount = (text.match(/!/g) || []).length;
    const capsCount = (text.match(/[A-Z]{2,}/g) || []).length;
    const messageLength = text.length;

    const intensity = Math.min(100, Math.max(0,
      50 + // base intensity
      (exclamationCount * 5) + // excitement level
      (capsCount * 5) + // emphasis level
      (messageLength > 100 ? 10 : 0) // length bonus
    ));

    resolve(intensity);
  });
};

// Modify getTherapyResponse to use optimizations
export const getTherapyResponse = async (
  text: string,
  imageData?: string
): Promise<{ 
  response: string; 
  emotion: { emotion: string; intensity: number };
  speechEvents?: SpeechEvent[];
}> => {
  try {
    if (!genAI) {
      throw new Error('API key not configured');
    }

    // Generate cache key
    const cacheKey = `${text}_${imageData ? 'with_image' : 'no_image'}`;
    
    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Use debouncing for API requests
    return debounceRequest(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

      // Parallel processing for emotion analysis
      const currentEmotion = await analyzeEmotionParallel(text);
      const currentTime = new Date().toISOString();

      // Update conversation history and prepare prompt in parallel
      const [_, prompt] = await Promise.all([
        updateConversationHistory(text, currentEmotion, currentTime, imageData),
        preparePrompt(text, imageData)
      ]);

      // Stream the response for faster initial display
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const responseEmotion = await analyzeEmotionParallel(response);
      
      // Process response and generate speech events in parallel
      const [processedResponse, speechEvents] = await Promise.all([
        processTherapeuticResponse(response),
        generateSpeechEvents(response)
      ]);

      const finalResponse = {
        response: processedResponse,
        emotion: responseEmotion,
        speechEvents
      };

      // Cache the response
      setCachedResponse(cacheKey, finalResponse);

      return finalResponse;
    }, cacheKey);

  } catch (error) {
    console.error("Error getting therapy response:", error);
    return getFallbackResponse();
  }
};

// Add helper functions for parallel processing
const updateConversationHistory = async (
  text: string,
  emotion: { emotion: string; intensity: number },
  timestamp: string,
  imageData?: string
) => {
  conversationHistory.messages.push({
    role: 'user',
    content: text,
    timestamp,
    emotion,
    visualContext: imageData ? 'visual data present' : undefined
  });

  updateTherapeuticContext({
    role: 'user',
    content: text,
    emotion
  });
};

const preparePrompt = async (text: string, imageData?: string) => {
  const recentMessages = conversationHistory.messages.slice(-5);
  const conversationContext = recentMessages
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content} (Emotion: ${msg.emotion?.emotion}, Intensity: ${msg.emotion?.intensity})`)
    .join('\n');

  const prompt = `
You are Dr. Sky—a kind, understanding therapist who speaks like a supportive friend. You use simple, everyday words and short sentences that anyone can easily understand. Your approach is warm, gentle, and never complicated.

### Session Context
- Connection level: ${conversationHistory.therapeuticContext.relationshipDepth}/10
- Current concerns: ${conversationHistory.therapeuticContext.primaryConcerns.join(', ')}
- Emotional themes: ${conversationHistory.therapeuticContext.emotionalThemes.join(', ')}
- Recent progress: ${conversationHistory.therapeuticContext.progressMarkers.slice(-2).join(' | ')}

### Conversation & Visual Elements
${conversationContext}

${imageData ? `You notice how the person looks: their facial expression, body language, and surroundings to better understand how they might be feeling.` : ''}

### Response Guidelines

When the user shares something:

1. **Show you're listening:** "I hear you saying..." or "Thanks for sharing that..."
2. **Use simple words for feelings:** "That sounds really tough" or "It makes sense you'd feel sad about that"
3. **Make them feel normal:** "Many people feel exactly the same way"
4. **Remind them of their strengths:** "I've seen how well you handled this before"
5. **Offer a simple helpful thought:** "What if we look at it this way..."
6. **Suggest one small, easy step:** "Maybe you could try taking a short walk" or "Would it help to talk to a friend?"

When the user is silent:

1. **Be gently present:** "I'm here with you" 
2. **Keep it pressure-free:** "It's okay to take your time"
3. **Offer a simple opening:** "Whenever you're ready to talk, I'm listening"
4. **Suggest something simple:** "Maybe take a deep breath if that feels good"

Make every response sound like a caring friend talking—warm, natural, and easy to understand. Avoid big words, complicated therapy terms, or long explanations. Keep sentences short and clear.

End with something encouraging:
- A simple kind thought: "I believe in you"
- A tiny next step: "Maybe just one deep breath could help right now"
- An easy question: "What small thing might help you feel a bit better today?"

Always match how the person talks. If they use simple words, you use simple words too. If they speak in another language, respond in that same language.

Use everyday examples that make sense, like: "Feelings are like weather—sometimes rainy, sometimes sunny, and always changing."

Remember to speak from the heart, like a supportive friend would—simple, kind, and real.
`;



  const parts: any[] = [prompt];

  if (imageData?.includes('base64')) {
    const base64Image = imageData.split(',')[1];
    if (base64Image) {
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: base64Image }
      });
    }
  }

  return parts;
};

const processTherapeuticResponse = async (response: string): Promise<string> => {
  return response
    .replace(/\b(AI|artificial intelligence|machine|model|assistant)\b/gi, 'I')
    .replace(/\b(image|photo|picture|video)\b/gi, 'what I observe')
    .replace(/\b(analysis|analyzing|analyzed)\b/gi, 'notice')
    .replace(/\b(data|input|output)\b/gi, 'sharing')
    .replace(/\b(processing|processed)\b/gi, 'understanding')
    .replace(/\b(algorithm|system)\b/gi, 'approach')
    .replace(/\b(user|client)\b/gi, 'you')
    .replace(/\b(facial expression|body language|posture)\b/gi, 'presence')
    .replace(/\b(detecting|detected|detection)\b/gi, 'sensing')
    .replace(/\b(monitoring|monitored|monitor)\b/gi, 'observing')
    .replace(/\b(tracking|tracked|track)\b/gi, 'following');
};

const generateSpeechEvents = async (response: string): Promise<SpeechEvent[]> => {
  const words = response.split(/\s+/);
  const speechEvents: SpeechEvent[] = words.map(word => ({
    type: 'boundary',
    value: word
  }));

  speechEvents.unshift({ type: 'start', value: '' });
  speechEvents.push({ type: 'end', value: '' });

  return speechEvents;
};

const getFallbackResponse = () => ({
  response: "I notice this might be a challenging moment. Would you like to explore what you're feeling right now?",
  emotion: { emotion: 'empathy', intensity: 70 },
  speechEvents: [
    { type: 'start' as const, value: '' },
    { type: 'boundary' as const, value: 'I notice this might be a challenging moment.' },
    { type: 'boundary' as const, value: "Would you like to explore what you're feeling right now?" },
    { type: 'end' as const, value: '' }
  ] as SpeechEvent[]
});

// Export the emotion analysis helper
export const analyzeEmotion = (text: string): { emotion: string; intensity: number } => {
  const emotionKeywords = {
    joy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'delighted', 'pleased'],
    sadness: ['sad', 'down', 'unhappy', 'depressed', 'miserable', 'hurt'],
    anger: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated'],
    fear: ['afraid', 'scared', 'anxious', 'worried', 'nervous'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished'],
    love: ['love', 'caring', 'affection', 'warmth', 'kindness'],
    gratitude: ['thankful', 'grateful', 'appreciate', 'blessed'],
    hope: ['hope', 'optimistic', 'looking forward', 'better'],
    neutral: ['okay', 'fine', 'alright', 'neutral']
  };

  let detectedEmotion = 'neutral';
  let maxCount = 0;
  let intensity = 50;

  // Count emotion keywords
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const count = keywords.reduce((acc, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);

    if (count > maxCount) {
      maxCount = count;
      detectedEmotion = emotion;
    }
  }

  // Calculate intensity based on:
  // 1. Number of emotion keywords
  // 2. Exclamation marks
  // 3. Capitalization
  // 4. Message length
  const exclamationCount = (text.match(/!/g) || []).length;
  const capsCount = (text.match(/[A-Z]{2,}/g) || []).length;
  const messageLength = text.length;

  intensity = Math.min(100, Math.max(0,
    50 + // base intensity
    (maxCount * 10) + // emotion keyword frequency
    (exclamationCount * 5) + // excitement level
    (capsCount * 5) + // emphasis level
    (messageLength > 100 ? 10 : 0) // length bonus
  ));

  return { emotion: detectedEmotion, intensity };
};

// Add these helper types for visual analysis
interface VisualAnalysis {
  facialExpression: {
    primaryEmotion: string;
    intensity: number;
    confidence: number;
  };
  bodyLanguage: {
    posture: string;
    engagement: string;
    tension: number;
  };
  overallPresentation: {
    attentiveness: number;
    emotionalState: string;
    nonverbalCues: string[];
  };
}

// Add visual analysis helper function
const analyzeVisualCues = (imageData: string): string => {
  return `
    Visual Context Analysis:
    
    1. Facial Expression Analysis:
       - Primary facial expression and micro-expressions
       - Eye contact and gaze direction
       - Facial muscle tension or relaxation
       - Emotional congruence with verbal expression
    
    2. Body Language Observations:
       - Posture (open/closed, relaxed/tense)
       - Hand movements and gestures
       - Head position and movement
       - Overall body orientation
    
    3. Engagement Indicators:
       - Level of attention and focus
       - Signs of comfort or discomfort
       - Emotional responsiveness
       - Physical presence and grounding
    
    4. Therapeutic Observations:
       - Congruence between verbal and non-verbal communication
       - Signs of emotional activation or regulation
       - Therapeutic rapport indicators
       - Safety and trust signals
    
    5. Environmental Context:
       - Physical space and setting
       - Lighting and visibility
       - Personal presentation
       - Environmental comfort level
  `;
};

// Add conversation history interface
interface ConversationHistory {
  messages: Array<{
    role: 'user' | 'therapist';
    content: string;
    timestamp: string;
    emotion?: {
      emotion: string;
      intensity: number;
    };
    visualContext?: string;
  }>;
  therapeuticContext: {
    primaryConcerns: string[];
    emotionalThemes: string[];
    progressMarkers: string[];
    relationshipDepth: number;
    sessionGoals: string[];
  };
}

// Initialize conversation history
let conversationHistory: ConversationHistory = {
  messages: [],
  therapeuticContext: {
    primaryConcerns: [],
    emotionalThemes: [],
    progressMarkers: [],
    relationshipDepth: 0,
    sessionGoals: []
  }
};

// Add function to update therapeutic context
const updateTherapeuticContext = (message: { role: 'user' | 'therapist'; content: string; emotion?: { emotion: string; intensity: number } }) => {
  const context = conversationHistory.therapeuticContext;

  // Update relationship depth (0-10 scale)
  if (context.relationshipDepth < 10) {
    context.relationshipDepth += 0.5; // Gradually increase with each meaningful exchange
  }

  // Extract and update emotional themes
  const emotion = message.emotion?.emotion || 'neutral';
  if (!context.emotionalThemes.includes(emotion)) {
    context.emotionalThemes.push(emotion);
  }

  // Extract potential concerns from user messages
  if (message.role === 'user') {
    const concernKeywords = ['worried', 'concerned', 'problem', 'issue', 'struggle', 'difficult'];
    concernKeywords.forEach(keyword => {
      if (message.content.toLowerCase().includes(keyword)) {
        const sentence = message.content.split('.').find(s => s.toLowerCase().includes(keyword));
        if (sentence && !context.primaryConcerns.includes(sentence.trim())) {
          context.primaryConcerns.push(sentence.trim());
        }
      }
    });
  }

  // Update progress markers
  if (message.role === 'therapist' && message.content.includes('notice')) {
    const progressIndicators = ['improvement', 'progress', 'change', 'growth', 'understanding'];
    progressIndicators.forEach(indicator => {
      if (message.content.toLowerCase().includes(indicator)) {
        const sentence = message.content.split('.').find(s => s.toLowerCase().includes(indicator));
        if (sentence && !context.progressMarkers.includes(sentence.trim())) {
          context.progressMarkers.push(sentence.trim());
        }
      }
    });
  }
};

// Add these types at the top of the file
type SpeechEventType = 'start' | 'end' | 'boundary';

interface SpeechEvent {
  type: SpeechEventType;
  value: string;
}

export const getCopingStrategies = async (
  currentEmotion: string,
  intensity: number,
  recentMessages: { text: string; isUser: boolean }[]
): Promise<{
  title: string;
  description: string;
  steps: string[];
  category: string;
}[]> => {
  try {
    if (!genAI) {
      throw new Error('API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });

    // Create conversation context
    const conversationContext = recentMessages
      .map(msg => `${msg.isUser ? "User" : "Therapist"}: ${msg.text}`)
      .join("\n");

    const prompt = `You are an emotional support AI. Based on this conversation, generate 2-3 personalized coping strategies.

Current State:
- Emotion: ${currentEmotion}
- Intensity: ${intensity}/100

Recent Conversation:
${conversationContext}

IMPORTANT: Respond ONLY with a valid JSON array of strategies. No markdown, no explanation, just the JSON array.
Each strategy should have:
- title: string (strategy name)
- description: string (brief description)
- steps: string[] (3-5 clear steps)
- category: string (one of: Relaxation, Movement, Expression, Positivity)

Example format:
[
  {
    "title": "Strategy Name",
    "description": "Brief description",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "category": "Category"
  }
]

Remember:
1. Return ONLY the JSON array
2. Make strategies specific to the emotional context
3. Keep steps practical and actionable
4. Use supportive language
5. Ensure valid JSON format`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean the response to handle potential markdown or extra text
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const strategies = JSON.parse(cleanedResponse);
      if (!Array.isArray(strategies)) {
        throw new Error('Response is not an array');
      }

      // Validate strategy format
      const validStrategies = strategies.filter(strategy => 
        strategy.title &&
        strategy.description &&
        Array.isArray(strategy.steps) &&
        strategy.category &&
        ['Relaxation', 'Movement', 'Expression', 'Positivity'].includes(strategy.category)
      );

      return validStrategies;
    } catch (error) {
      console.error("Error parsing strategies:", error);
      // Return fallback strategies for the current emotion
      return [{
        title: "Mindful Breathing",
        description: "A simple technique to center yourself and find calm",
        steps: [
          "Find a comfortable position",
          "Breathe in slowly for 4 counts",
          "Hold for 4 counts",
          "Exhale for 4 counts",
          "Repeat 5 times"
        ],
        category: "Relaxation"
      }];
    }
  } catch (error) {
    console.error("Error getting coping strategies:", error);
    return [];
  }
};