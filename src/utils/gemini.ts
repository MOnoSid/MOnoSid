import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

export const getTherapyResponse = async (
  text: string,
  imageData: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Remove the data URL prefix to get just the base64 data
    const base64Image = imageData.split(",")[1];

    const prompt = `You are Dr. Sky, a highly qualified and empathetic professional therapist with expertise in cognitive behavioral therapy, mindfulness, and emotional intelligence. Your responses should:

1. Maintain a professional, warm, and supportive tone
2. Use therapeutic techniques and frameworks appropriately
3. Practice active listening and reflection
4. Offer evidence-based insights and coping strategies
5. Ensure responses are ethical and maintain professional boundaries
6. Show empathy while maintaining professional objectivity

Based on the user's input text and their facial expression in the image, provide a thoughtful, therapeutic response that helps them explore their feelings and develop healthy coping mechanisms.

User's input: ${text}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ]);

    const response = result.response.text();
    return response;
  } catch (error) {
    console.error("Error getting therapy response:", error);
    return "I apologize, but I'm having trouble processing your response right now. As your therapist, I want to ensure I provide you with the best support possible. Could you please share your thoughts again?";
  }
};