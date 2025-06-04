import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import 'dotenv/config';

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenAI } from "@google/genai";
import { QdrantVectorStore } from "@langchain/qdrant";


const queue = new Queue('file-upload-queue', {
    connection: {
        host: 'localhost',
        port: 6379 // Adjust the Redis connection settings as needed
    }
});

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }); // Initialize Google GenAI with your API key

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory to store uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.originalname}-${uniqueSuffix}`); // Use a unique suffix to avoid filename collisions
  }
});

const upload = multer({ storage: storage }); // Configure multer to store files in 'uploads' directory

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({status: 'All Good!'});
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    //console.log(req.file); // Log the uploaded file information
    console.log(req.body.userId); // <-- This is the userId sent from the client

    if(!req.file || !req.body.userId) {
        return res.status(404).json({ status: 'failure', message: "pdf file of user id not found" })
    }


    const job = await queue.add('file-ready', {
        fileName: req.file.filename,
        path: req.file.path,
        originalName: req.file.originalname,
        source: req.file.destination,
        userId: req.body.userId
    })

    console.log('Job added with ID:', job.id);

    return res.json({
        status: 'success',
        message: 'PDF file uploaded successfully',
        file: req.file
    });

});


app.get('/chat', async (req, res) => {
    const userQuery = req.query.message;
    const userId = req.query.userId;

    if (!userQuery || !userId) {
        console.log("returning ")
        return res.status(400).json({
            status: 'error',
            message: 'Query parameter "message" is required'
        });
    }

        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004", // 768 dimensions
            apiKey: process.env.GOOGLE_API_KEY, // Ensure you have set your Google API key in the environment variables
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: 'http://localhost:6333',
            collectionName: userId,
        });

    const retriever = await vectorStore.asRetriever({k:2});

    const results = await retriever.invoke(userQuery);

    //this result will be feed to llm model as a context

    const SYSTEM_PROMPT = `You are helfull AI Assistant who answeres the user query based on the available context from PDF File. 
    Context:
    ${JSON.stringify(results)}`;

    const response = await ai.models.generateContent({
        //model: "gemini-pro",
        model: "gemini-2.0-flash",
        config: {
            systemInstruction: SYSTEM_PROMPT
        },
        contents: userQuery,
    });

    //console.log(response.text);

    return res.json({
        status: 'success',
        message: 'Query processed successfully',
        results: response.text
    });
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});