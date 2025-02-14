import OpenAI from "openai";

const api_key = process.env.GROQ_API_KEY;

if (!api_key) {
  throw new Error("Please provide your Groq API key");
}

export const openAIclient = new OpenAI({
  apiKey: api_key,
  baseURL: "https://api.groq.com/openai/v1"
});