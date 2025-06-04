import { Worker } from "bullmq";
import 'dotenv/config';

import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const embedder = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004", // 768 dimensions
        apiKey: process.env.GOOGLE_API_KEY, // Ensure you have set your Google API key in the environment variables
});

const worker = new Worker('file-upload-queue', async (job) => {
    console.log(`Job:`, job.data);
    const data = job.data;

    /*
    Read pdf file from path
    chhunk pdf file into smaller chunks
    call the openai embedding api for every chunk
    save the embeddings to a database
    */

    // Load the PDF
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents from PDF`);

    const splitDocs = await textSplitter.splitDocuments(docs);

    const client = new QdrantClient({ url: "http://localhost:6333", checkCompatibility:false });

    const collectionExists = await client.collectionExists(
      data.userId
    );

    if (collectionExists) {
      //console.log("Deleting collection as there is already a pdf file uploaded by this user")
      await client.deleteCollection(data.userId);
    }

     await QdrantVectorStore.fromDocuments(splitDocs, embedder, {
      url: "http://localhost:6333",
      collectionName: data.userId,
    });

}, {
    connection: {
        host: 'localhost',
        port: 6379 // Adjust if your Redis server is running on a different port
    },
    concurrency: 100 // Adjust concurrency as needed
});

worker.on('completed', job => {
    console.log(`Job ${job.id} has completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

worker.on('error', err => {
    console.error('Worker error:', err);
});

console.log('Worker started');
