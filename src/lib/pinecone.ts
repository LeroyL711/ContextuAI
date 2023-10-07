import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return pinecone;
};

export async function loadS3IntoPinecone(fileKey: string) {
  // Obtain the PDF file from S3 --> Download and read from PDF
  console.log("Downloading from S3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Could not download from S3");
  }
  const loader = new PDFLoader(file_name);

  // This returns an array of documents from the PDF
  const pages = await loader.load();
  return pages;
}
