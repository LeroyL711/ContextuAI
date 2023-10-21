import { Pinecone, PineconeClient, Vector, utils as PineconeUtils } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from 'md5';
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { truncate } from "fs";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";


let pinecone: PineconeClient | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
  //   pinecone = new Pinecone({
  //     apiKey: process.env.PINECONE_API_KEY!,
  //     environment: process.env.PINECONE_ENVIRONMENT!,
  //   });
  // }
  // return pinecone;

  // Need to use deprecated PineconeClient instead of Pinecone to satisfy parameter requirements of chunkedUpsert
  pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
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

// The retrieval augmented generation
export async function loadS3IntoPinecone(fileKey: string) {


  // 1. Obtain the PDF file from S3 --> Download and read from PDF
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

  // 2. Split the PDF into smaller documents
  const docs = await Promise.all(pages.map(prepareDocument));

  // 3. Vectorize and embed individual documents
  const vectors = await Promise.all(docs.flat().map(embedDocuments));

  // 4. Upload the vectors to Pinecone
  // create a new instance of the Pinecone client
  const client = await getPineconeClient();
  // Once we have the client, we create an index using the Index method with the name of the index as the parameter
  const pineconeIndex = client.Index('quizzr');

  console.log('Uploading vectors to Pinecone');
  
 const nameSpace = convertToAscii(fileKey);
 // Helps update and push vectors into the pinecone index 
 // NOTE THAT NAMESPACES ARE NOT SUPPORTED IN FREE TIER OF PINECONE - AS A RESULT, WE PUT AN EMPTY STRING AS THE NAMESPACE
 PineconeUtils.chunkedUpsert(pineconeIndex, vectors, "", 10);
 return docs[0];
}

// function to embed the documents -- calls getEmbeddings from embeddings.ts -- returns the embeddings as a vector
async function embedDocuments(doc: Document){
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      }
    }as Vector;
  
  } catch (error) {
    console.log("Error embedding document", error);
    throw error;
  }
}

// Function to truncate the string by bytes - We need to do this because Pinecone has a limit of 36,000 bytes per document
export const truncateStringByBytes = (str: string, numBytes: number) => {
  const encoder = new TextEncoder();

  // Slice the string to the number of bytes
  return new TextDecoder("utf-8").decode(
    encoder.encode(str).slice(0, numBytes)
  );
};

//Split and segment the PDF into small documents - The previous documents are still too big for Pinecone
async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " ");

  // Split the documents
  // We are using the RecursiveCharacterTextSplitter to split the documents (imported from doc-splitter package)
  const splitter = new RecursiveCharacterTextSplitter();

  // Split the documents into smaller documents using the splitDocuments function from the splitter (Part of the doc-splitter package)
  const documents = await splitter.splitDocuments([

    // Create a new document with the page content and metadata (pageNumber and text)
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
