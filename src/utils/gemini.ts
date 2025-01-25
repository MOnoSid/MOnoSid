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

    const prompt = `You are Sky, an empathetic AI therapist. Based on the user's input text and their facial expression in the image, provide a thoughtful, therapeutic response. Keep responses concise and supportive. User's input: ${text}`;

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
    return "I apologize, but I'm having trouble processing your response right now. Could you please repeat that?";
  }
};