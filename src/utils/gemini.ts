import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

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

export const getTherapyResponse = async (
  text: string,
  imageData?: string
): Promise<{ response: string; emotion: { emotion: string; intensity: number } }> => {
  try {
    if (!genAI) {
      throw new Error('API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enhanced prompt with emotion awareness
    const prompt = `You are Dr. Sky, a compassionate and experienced therapist. 
    Analyze the emotional state in this message and respond with genuine empathy: "${text}"
    
    Your response should:
    1. Acknowledge and validate the detected emotions
    2. Show deep understanding and empathy
    3. Provide gentle support and guidance
    4. Use a warm, nurturing tone
    5. Keep responses concise but meaningful
    6. Avoid clinical terminology
    7. Never mention being AI
    8. Maintain a natural, conversational style`;

    const parts: any[] = [prompt];

    if (imageData?.includes('base64')) {
      const base64Image = imageData.split(',')[1];
      if (base64Image) {
        parts.push({
          inlineData: { mimeType: "image/jpeg", data: base64Image }
        });
      }
    }

    const result = await model.generateContent(parts);
    const response = result.response.text();
    
    // Analyze emotions in both the user's message and AI's response
    const userEmotion = analyzeEmotion(text);
    const responseEmotion = analyzeEmotion(response);

    // Process the response to remove AI references
    const processedResponse = response
      .replace(/\b(AI|artificial intelligence|machine|model|assistant)\b/gi, 'I')
      .replace(/\b(image|photo|picture|video)\b/gi, 'what you shared');

    return {
      response: processedResponse,
      emotion: responseEmotion
    };
  } catch (error) {
    console.error("Error getting therapy response:", error);
    return {
      response: "I sense this is a difficult moment. Would you feel comfortable sharing your thoughts with me again?",
      emotion: { emotion: 'empathy', intensity: 60 }
    };
  }
};

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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