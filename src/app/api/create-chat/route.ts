// maps to /api/create-chat eg. we can call this route in the frontend with somehting like this: axios.post('/api/create-chat', {name: 'my chat'})
import { loadS3IntoPinecone } from '@/lib/pinecone';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response){
    try {
        const body = await req.json();
        const {file_key, file_name} = body;
        console.log(`File key: ${file_key} File name: ${file_name}`);
        await loadS3IntoPinecone(file_key);
        return NextResponse.json({status: 200, message: 'Success'});
    } catch (error){
        console.error(error);
        return NextResponse.json({status: 500, message: 'Internal server error'});
    }

}