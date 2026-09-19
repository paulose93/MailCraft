import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

async function testGroq() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'Output JSON.' }, { role: 'user', content: 'test' }],
      model: 'llama3-70b-8192',
      response_format: { type: 'json_object' },
    });
    console.log("Success:", completion.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("Groq Error:", err.message);
  }
}

testGroq();
