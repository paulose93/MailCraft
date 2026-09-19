import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

async function listModels() {
  try {
    const models = await groq.models.list();
    console.log("AVAILABLE GROQ MODELS:");
    models.data.forEach(m => console.log(m.id));
  } catch (err: any) {
    console.error("Groq Error:", err.message);
  }
}

listModels();
