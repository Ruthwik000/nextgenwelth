import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

// Create a model instance
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateFinancialAdvice(message) {
  try {
    const prompt = `You are a financial AI assistant. Provide concise, helpful financial advice based on the following question: "${message}". Keep your response focused on personal finance, budgeting, investing, or related topics.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating financial advice:", error);
    throw new Error("Failed to generate financial advice");
  }
} 