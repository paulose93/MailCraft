import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const apiKey = process.env.GEMINI_API_KEY || '';

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    data.models?.forEach((m: any) => {
      console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods?.join(', ')})`);
    });
  } catch (err) {
    console.error("ERROR:", err);
  }
}

listModels();
