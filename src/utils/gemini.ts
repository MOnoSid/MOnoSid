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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    return "I apologize, but I'm having trouble processing your response right now. As your therapist, I want to ensure I provide you with the best support possible. Could you please share your thoughts again?";
  }
};