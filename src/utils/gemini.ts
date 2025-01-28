import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const getTherapyResponse = async (
  text: string,
  imageData?: string
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return "I apologize, but I need to be properly configured with an API key to provide therapy services. Please ensure the API key is set up correctly.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `You are Dr. Sky, a highly empathetic and professional AI therapist. Your responses should:
    1. Be concise but meaningful (2-3 sentences max)
    2. Show genuine understanding and empathy
    3. Use therapeutic techniques appropriately
    4. Maintain a warm, supportive tone
    5. Focus on the immediate emotional context
    6. Encourage further dialogue naturally
    7. Avoid clinical jargon
    8. Never mention being an AI or virtual entity

    User's input: ${text}`;

    const parts: any[] = [prompt];

    if (imageData && imageData.includes('base64')) {
      const base64Image = imageData.split(',')[1];
      if (base64Image) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        });
      }
    }

    const result = await model.generateContent(parts);
    const response = result.response.text();
    return response;
  } catch (error) {
    console.error("Error getting therapy response:", error);
    return "I apologize, but I'm experiencing some technical difficulties at the moment. Could you please share your thoughts again?";
  }
};