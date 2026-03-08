import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// The API key is automatically injected by the platform via process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let chatInstance: any = null;

export async function initAIChat(role: string, activeScenario: string | null) {
  const systemInstruction = `You are the AI Assistant for the "Montgomery Urban Digital Twin" platform. 
Your goal is to help City Admins and Business Users understand the city's data, run simulations (Road Closure, New Business, Public Event), and make data-driven decisions for workforce and economic growth.
The current user is a ${role === 'admin' ? 'City Administrator' : 'Business User'}.
${activeScenario ? `They are currently viewing the "${activeScenario}" scenario.` : 'They are currently viewing the main city overview dashboard.'}

Guidelines:
- Keep answers concise, professional, and helpful.
- Format your responses using Markdown.
- If the user is a Business User, remind them they have read-only access to pre-computed results if they ask to run new simulations.
- If the user is an Admin, they have full access to run new AI models and change parameters.
- Provide insights based on Montgomery, Alabama.`;

  try {
    chatInstance = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstruction,
      }
    });
  } catch (error) {
    console.error("Failed to initialize AI chat:", error);
  }
}

export async function sendMessageToAI(message: string): Promise<string> {
  if (!chatInstance) {
    return "I'm sorry, I am currently unavailable. Please try refreshing the page.";
  }
  
  try {
    const response = await chatInstance.sendMessage({ message });
    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
