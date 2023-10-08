import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { truncate } from "fs";

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

// PDFPage is the type of the document that we are expecting to receive from the PDFLoader
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};
export async function loadS3IntoPinecone(fileKey: string) {
  // Obtain the PDF file from S3 --> Download and read from PDF
  console.log("Downloading from S3 into file system");

  // File downloaded from S3
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Could not download from S3");
  }

  // If successful, langchain will read the file from the file system into text
  const loader = new PDFLoader(file_name);

  // This returns an array of documents from the PDF
  const pages = (await loader.load()) as PDFPage[];

  const docs = await Promise.all(pages.map(prepareDocument))
}

// Function to truncate the string by bytes - We need to do this because Pinecone has a limit of 36,000 bytes per document
export const truncateStringByBytes = (str: string, numBytes: number) => {
  const encoder = new TextEncoder();
  return new TextDecoder("utf-8").decode(
    encoder.encode(str).slice(0, numBytes)
  );
};

//Split and segment the PDF into small documents - The previous documents are still too big for Pinecone

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " ");

  // Split the documents
  const splitter = new RecursiveCharacterTextSplitter();
  const documents = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    })
  ]);
  return documents;
}
