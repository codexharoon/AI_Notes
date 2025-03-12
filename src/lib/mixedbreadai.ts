import { MixedbreadAIClient } from "@mixedbread-ai/sdk";

const mxbai_apikey = process.env.MIXEDBREADAI_API_KEY;

if (!mxbai_apikey) {
    throw new Error("Please provide your Mixedbread AI API key");
}
 
export const mxbai = new MixedbreadAIClient({
    apiKey: mxbai_apikey,
});

export const model ='mixedbread-ai/mxbai-embed-large-v1';


export async function generateEmbeddings(text: string) {
    const res = await mxbai.embeddings({
        model,
        input: [
            text
        ],
    });

    const embeddings = res.data[0].embedding;

    return Array.isArray(embeddings) ? embeddings : Array.from(Object.values(embeddings));
}