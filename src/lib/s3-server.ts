import AWS from 'aws-sdk';
import fs from 'fs';

export async function downloadFromS3(file_key: string){
    try{
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        });
        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            },
            region: 'us-west-2'
            
        });
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
        };

        // We can extract the file name using the file key as part of the params object - The other component is the bucket name we are retrieving from
        // getObject is a method that retrieves an object from S3
        const obj = await s3.getObject(params).promise();
        const file_name = `C:\\Windows\\Temp\\pdf-${Date.now()}.pdf`;
        
        // We write the file to the file system using the file name and the object body
        fs.writeFileSync(file_name, obj.Body as Buffer);
        return file_name;
    } catch (error){
        console.log(error);
        return null;
    }


}