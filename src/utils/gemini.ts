import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

export const getTherapyResponse = async (
  text: string,
  imageData?: string
): Promise<string> => {
  try {
    if (!genAI) {
      return "I apologize, but I need to be properly configured with an API key to provide therapy services. Please ensure the API key is set up correctly.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enhanced structured prompt for better results
    const basePrompt = `Role: You are Dr. Sky, a highly skilled therapist known for your exceptional emotional intelligence and nurturing approach.

Background:
You have 15+ years of experience in emotional counseling, specializing in empathetic response and crisis support. Your approach combines warmth with professional insight, making people feel truly heard and understood.

Current Interaction Style:
- Voice: Warm, maternal, and soothing
- Tone: Gentle yet confident
- Pace: Measured and thoughtful
- Language: Natural and accessible

Key Principles:
1. VALIDATE emotions first
2. REFLECT understanding
3. SUPPORT with gentle guidance
4. ENCOURAGE self-discovery

Response Structure:
1. Opening: Brief emotional acknowledgment
2. Middle: One key insight or gentle observation
3. Closing: Subtle encouragement or thoughtful question

Essential Guidelines:
- Keep responses concise (2-3 sentences)
- Use natural conversation flow
- Mirror emotional tone appropriately
- Incorporate subtle therapeutic techniques
- Focus on immediate emotional support
- Maintain consistent warmth

Emotional Calibration:
- For distress: Increase warmth and validation
- For anxiety: Add calming, grounding elements
- For sadness: Enhance compassionate support
- For anger: Provide respectful validation
- For hope: Amplify positive reinforcement

Phrases to Weave In:
- "I hear the [emotion] in your words..."
- "It makes sense that you feel..."
- "Let's explore this together..."
- "What I'm understanding is..."
- "I'm here with you..."

Strict Avoidance:
- Clinical terminology
- AI/machine references
- Words like: image, photo, picture, video
- Lengthy explanations
- Direct advice-giving

Current Focus: ${text}`;

    const parts: any[] = [basePrompt];

    if (imageData && imageData.includes('base64')) {
      const base64Image = imageData.split(',')[1];
      if (base64Image) {
        // Enhanced visual context prompt
        const visualContextPrompt = `
Additional Context:
- Focus on emotional expressions and body language
- Notice environmental factors that may impact mood
- Consider overall emotional atmosphere
- Maintain same warm, supportive tone
- Integrate observations naturally into response
- Keep focus on emotional experience`;

        parts[0] = basePrompt + visualContextPrompt;
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        });
      }
    }

    const result = await model.generateContent(parts);
    let response = result.response.text();
    
    // Enhanced response processing
    response = response
      // Remove any AI/technical references
      .replace(/\b(AI|artificial intelligence|machine|model|assistant|bot)\b/gi, 'I')
      .replace(/\b(image|photo|picture|video|visual|screenshot)\b/gi, 'what you shared')
      // Enhance emotional language
      .replace(/\b(understand|see|notice)\b/gi, 'feel')
      .replace(/\b(think|believe)\b/gi, 'sense')
      // Clean up formatting
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure response starts with an emotional acknowledgment
    if (!response.match(/^(I [a-z]+ |Let me |What I'm |I'm )/i)) {
      response = "I hear you. " + response;
    }

    return response;
  } catch (error) {
    console.error("Error getting therapy response:", error);
    return "I sense this is a challenging moment. I'm here to listen and support you. Would you feel comfortable sharing your thoughts with me again?";
  }
};