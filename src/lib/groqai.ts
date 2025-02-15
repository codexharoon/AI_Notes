import Groq from "groq-sdk";

const api_key = process.env.GROQ_API_KEY;

if (!api_key) {
  throw new Error("Please provide your Groq API key");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});