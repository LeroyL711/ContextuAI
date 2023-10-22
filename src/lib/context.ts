import { PineconeClient } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

// This takes the query vector and searches through Pinecone for similar vectors and returns the top 5 results
export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string){
    // Initialize the Pinecone client
    const pinecone = new PineconeClient();
    await pinecone.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
    })
    // Get the pinecone Index
    const index = await pinecone.Index('quizzr');
    try {
        // const namespace = convertToAscii(fileKey);

        // Namespace is an empty string because free tier does not support namespaces
        const namespace = ''; 
        const queryResult = await index.query({
            queryRequest: {
                topK: 5,
                 vector: embeddings, 
                 includeMetadata: true,
                 namespace,
            }
        })

        return queryResult.matches || [];
    } catch (error) {
        console.log('Error querying embeddings', error);
        throw error;
    }

}   

export async function getContext(query: string, fileKey: string){
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    // For each match, check if the score is greater than 0.7
    const qualifyingDocs = matches.filter((match) => match.score && 0.7);

    // Define the metadata type
    type Metadata = {
        text: string,
        pageNumber: number,
    }

    // Get the text from the metadata
    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

    // Join 5 vectors together to create the context block for the AI prompt
    return docs.join('\n').substring(0, 3000);
}