// Route for communicating with the OpenAI API

import {Configuration, OpenAIApi} from 'openai-edge';

// The Request and StreamingTextResponse classes utilities provided by Vercel SDK enable the 'chat-gpt' effect of the messages
import {OpenAIStream, StreamingTextResponse} from 'ai';

export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config);

export async function POST(req: Request){
    try {
        const {messages} = await req.json();
        const response  = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            // Messages comes from the request body
            messages,

            stream: true
        })
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error) {
        
    }
}