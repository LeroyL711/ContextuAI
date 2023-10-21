// maps to /api/create-chat eg. we can call this route in the frontend with somehting like this: axios.post('/api/create-chat', {name: 'my chat'})
import { loadS3IntoPinecone } from '@/lib/pinecone';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { getS3Url } from '@/lib/s3';
import { auth } from '@clerk/nextjs';


// /api/create-chat
export async function POST(req: Request, res: Response){
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({error: 'Not authenticated'}, {status: 401});
    }
    try {

        // Parse the request body as JSON
        const body = await req.json();

        // Extract the file key and file name from the body
        const {file_key, file_name} = body;
        console.log(`File key: ${file_key} File name: ${file_name}`);

        // Pages is the array of documents that we are expecting -- We upload this to Pinecone
        await loadS3IntoPinecone(file_key);

        const chatId = await db.insert(chats).values({
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: getS3Url(file_key),
            userId, 
        }).returning({
                insertedId: chats.id,
            });

            return NextResponse.json({

                // Return index 0 of the chatId array because there is only one set of values inserted -- from this array, set the insertedId as the chat_id
                // This is how we get the chat_id from drizzleORM
                chat_id: chatId[0].insertedId,
            }, { status: 200 });
        
    } catch (error){
        console.error(error);
        return NextResponse.json({status: 500, message: 'Internal server error'});
    }

}