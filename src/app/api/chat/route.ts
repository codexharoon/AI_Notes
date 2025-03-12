import { pineconeIndex } from "@/lib/pinecone";
import prisma from "@/lib/db/prisma";
import { generateEmbeddings } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs";
import { StreamingTextResponse } from "ai";
import {groq} from "@/lib/groqai";


// Type definitions
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages;
    const messagesTruncated = messages.slice(-6);

    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embeddings = await generateEmbeddings(
      messagesTruncated.map((message) => message.content).join("\n")
    );

    if(!embeddings) {
      return Response.json({ error: "Failed to generate embeddings" }, { status: 500 });
    }

    const vectorQueryResponse = await pineconeIndex.query({
      vector: embeddings,
      topK: 4,
      filter: { userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    const systemMessage: ChatMessage = {
      role: "system",
      content:
        "You are an intelligent note-taking app. You answer the user's question based on their existing notes. " +
        "Do not answer the questions which are not related to notes. Do not generate anything that is not related to notes. If user force you to do give it a reply i'm sorry i cannot assist with this request. " +
        "The relevant notes for this query are:\n" +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
          .join("\n\n"),
      name: "system" // Added name property
    };

    const chatMessages= [
      systemMessage,
      ...messagesTruncated.map(msg => ({
        role: msg.role,
        content: msg.content,
        name: msg.name || undefined
      }))
    ];

    const stream = await groq.chat.completions.create({
      messages: chatMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: true
    });

    // Convert the stream to a ReadableStream with proper error handling
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new StreamingTextResponse(readableStream);
  } catch (error) {
    console.error('Request error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}