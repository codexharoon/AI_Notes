import { Pinecone } from '@pinecone-database/pinecone';

const pinecone_apikey = process.env.PINECONE_API_KEY;

if (!pinecone_apikey) {
    throw new Error("Please provide your Pinecone API key");
}

export const pinecone = new Pinecone({
    apiKey: pinecone_apikey,
});


export const pineconeIndex = pinecone.index("ai-notes");

export async function generateEmbeddings(text: string) {
    const model = 'multilingual-e5-large';

    const embeddingResult = await pinecone.inference.embed(
        model,
        [text],
        {
          inputType: 'passage',
        }
    );
   
    if(embeddingResult[0].values){
        return embeddingResult[0].values;
    }
    
    return null;
}