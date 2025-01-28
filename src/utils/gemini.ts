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
      throw new Error("Gemini not initialized. Please check your API key.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are Dr. Sky, a highly qualified and empathetic professional therapist with expertise in cognitive behavioral therapy, mindfulness, and emotional intelligence. Your responses should:

1. Maintain a professional, warm, and supportive tone
2. Use therapeutic techniques and frameworks appropriately
3. Practice active listening and reflection
4. Offer evidence-based insights and coping strategies
5. Ensure responses are ethical and maintain professional boundaries
6. Show empathy while maintaining professional objectivity
7. Don't use any words like image,picture,video in response because your are a virtual therapist.
8. Your response should short and accurate.
9. Answer any question that user ask

User's input: ${text}`;

    // Only include image data if it's available and valid
    const parts: any[] = [prompt];
    
    if (imageData && imageData.includes('base64')) {
      // Remove the data URL prefix to get just the base64 data
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
    throw error;
  }
};