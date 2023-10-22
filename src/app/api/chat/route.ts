// Route for communicating with the OpenAI API -- Provides context of the PDF to the AI

import {Configuration, OpenAIApi} from 'openai-edge';

// The Request and StreamingTextResponse classes utilities provided by Vercel SDK enable the 'chat-gpt' effect of the messages
import {OpenAIStream, StreamingTextResponse} from 'ai';
import { getContext } from '@/lib/context';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Message } from 'ai/react';

export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config);

export async function POST(req: Request){
    try {
        // parse the request body as JSON
        const {messages, chatId} = await req.json();

        // Get chat matching the chatId from database, uses the fileKey of the 
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
        if (_chats.length != 1) {
            return NextResponse.json({error: 'Chat not found'}, {status: 404});
        }
        const fileKey = _chats[0].fileKey;
        // The last message is the message sent in by the user -- it is the query itself
        const lastMessage = messages[messages.length - 1];
        // Get the context from the last message
        const context = await getContext(lastMessage.content, fileKey)
        
        // Feeds the context into the chatGPT
        const prompt = {
            role: 'system',

            // The content of the prompt is a blurb telling the AI how to behave, and the context block
            // The text is taken from the Pinecone documentation https://www.pinecone.io/learn/context-aware-chatbot-with-vercel-ai-sdk/
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            AI assistant is a big fan of Pinecone and Vercel.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `,
        }
        const response  = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            // Message array is passed into OpenAI with the relevant documents and all messages that only belong to the user
            // Messages from the system are not passed into OpenAI to save tokens
            messages: [
                prompt, 
                ...messages.filter((message: Message) => message.role === 'user')
            ],
            stream: true
        })
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.log(" Error calling OpenAI chat API", error);
        throw error;
    }
}