// Contains function to load in the S3 Configuration
import AWS from 'aws-sdk';

export async function uploadToS3(file: File) {
    try {
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

        // File key uploads to a folder called uploads within S3
        const file_key = 'uploads/' + Date.now().toString() + file.name.replace(' ', '-');
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
            Body: file,
        }

        // httpUploadProgress is a callback function that is called when the upload is in progress
        // It allows us to track the progress of the upload, and in turn we can use this to create a progress bar UI
        const upload = s3.putObject(params).on('httpUploadProgress', event =>{
            console.log(`Uploading to s3... `, parseInt(((event.loaded/event.total)*100).toString())) + '%';  
        }).promise()

        await upload.then(data => {
            console.log(`Successfully uploaded to s3!`, file_key);
        })

        return Promise.resolve({
            file_key,
            file_name: file.name
        })
    } catch (error) {
        console.log(error);
    }
}

export function getS3Url(file_key: string) {
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3-us-west-2.amazonaws.com/${file_key}`;
    return url;
}