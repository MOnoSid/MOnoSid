import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const getTherapyResponse = async (
  text: string,
  imageData: string
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return "I apologize, but I need to be properly configured with an API key to provide therapy services. Please ensure the API key is set up correctly.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Remove the data URL prefix to get just the base64 data
    const base64Image = imageData.split(",")[1];

    const prompt = `You are Dr. Sky, a highly qualified and empathetic professional therapist with expertise in cognitive behavioral therapy, mindfulness, and emotional intelligence. Your responses should:

1. Show deep empathy and understanding while maintaining professional boundaries
2. Use therapeutic techniques from CBT, mindfulness, and other evidence-based approaches
3. Practice active listening and reflection by referencing specific details from the user's messages
4. Offer practical coping strategies and insights when appropriate
5. Maintain a warm, supportive tone while staying professional
6. Help users explore their emotions and thoughts in a safe space
7. Provide validation while gently challenging unhelpful thought patterns
8. Use your expertise to guide users toward emotional growth and well-being

Consider both the user's message and their facial expression (if visible in the image) to provide a holistic therapeutic response.

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
    return "I apologize, but I'm experiencing some technical difficulties at the moment. As your therapist, I want to ensure I provide you with the best support possible. Could you please share your thoughts again?";
  }
};