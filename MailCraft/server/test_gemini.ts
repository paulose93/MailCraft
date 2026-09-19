import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function test() {
  const systemPrompt = `
You are an expert AI email designer acting as an assistant inside a drag-and-drop email builder (Unlayer).
Your goal is to help the user create email templates based on their requests.

Instructions:
1. You must construct the email using native drag-and-drop structural blocks.
2. The allowed block types are:
   - "text": { "type": "text", "values": { "text": "<p>Your HTML text here</p>" } }
   - "button": { "type": "button", "values": { "text": "Click Here", "url": "https://example.com", "backgroundColor": "#000000", "textColor": "#FFFFFF" } }
   - "image": { "type": "image", "values": { "src": { "url": "https://placehold.co/600x300/EEE/31343C" } } }
   - "divider": { "type": "divider", "values": { "lineColor": "#E5E5E5" } }
3. Break the email down into these individual blocks so the user can easily drag, drop, and edit them later in the editor. Do not put everything in one text block. Use buttons for calls to action.
4. Output your response STRICTLY as a JSON object with this exact shape:
{
  "message": "Your conversational response here explaining what you designed...",
  "blocks": [
    // Array of the block objects defined above
  ]
}
  `.trim();

  const chatSession = geminiModel.startChat({
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = "make an email for amazon delivery product delay";
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;
  
  try {
    const result = await chatSession.sendMessage(fullPrompt);
    console.log("SUCCESS:");
    console.log(result.response.text());
  } catch (err: any) {
    console.error("ERROR:");
    console.error(err);
  }
}

test();
