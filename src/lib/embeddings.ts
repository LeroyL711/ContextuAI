import {OpenAIApi, Configuration} from 'openai-edge';

// Define the configuration for the OpenAI API
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create a new instance of the OpenAI API
const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
    try {

        // Call the OpenAI API to get the embeddings using model text-embedding-ada-002
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: text.replace(/\n/g, " "),
        });

        // Parse the response as JSON
        const result = await response.json();
        
        // Return the embeddings as an array of numbers
        return result.data[0].embedding as Number[];
    } catch (error){
        console.log("Error calling OpenAI embeddings API", error);
        throw error;
    }
}