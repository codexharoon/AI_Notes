import { Pinecone } from '@pinecone-database/pinecone';

const pinecone_apikey = process.env.PINECONE_API_KEY;

if (!pinecone_apikey) {
    throw new Error("Please provide your Pinecone API key");
}

export const pinecone = new Pinecone({
    apiKey: pinecone_apikey,
});


export const pineconeIndex = pinecone.index("ai-notes");