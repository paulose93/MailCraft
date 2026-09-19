import { geminiModel } from '../config/gemini';
import Groq from 'groq-sdk';
import { config } from '../config';
import * as dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Using a modern text generation model available on Groq
const GROQ_MODEL = 'openai/gpt-oss-120b';

/**
 * Standard AI text generation that falls back to Groq if Gemini fails.
 */
export const generateAiContent = async (prompt: string, requireJson: boolean = false): Promise<string> => {
  try {
    const result = await geminiModel.generateContent(prompt);
    let text = result.response.text();
    if (requireJson) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    return text;
  } catch (geminiError: any) {
    console.error(`[Gemini Error] ${geminiError?.message}`);
    console.log(`[AI Fallback] Attempting fallback to Groq API...`);
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Gemini API failed, and no GROQ_API_KEY is configured for fallback.');
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: GROQ_MODEL,
        response_format: requireJson ? { type: 'json_object' } : undefined,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (groqError: any) {
      console.error(`[Groq Error] ${groqError?.message}`);
      throw new Error('Both Gemini and Groq AI generation failed.');
    }
  }
};

/**
 * Interactive Chat API that maintains history. Falls back to Groq if Gemini fails.
 */
export const chatAiContent = async (
  systemPrompt: string, 
  userMessage: string, 
  history: { role: 'user' | 'model', text: string }[] = [],
  requireJson: boolean = false
): Promise<string> => {
  try {
    const chatSession = geminiModel.startChat({
      history: history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      generationConfig: requireJson ? { responseMimeType: "application/json" } : undefined
    });

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${userMessage}`;
    const result = await chatSession.sendMessage(fullPrompt);
    let text = result.response.text();
    if (requireJson) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    return text;
  } catch (geminiError: any) {
    console.error(`[Gemini Error] ${geminiError?.message}`);
    console.log(`[AI Fallback] Attempting fallback to Groq API for Chat...`);

    if (!process.env.GROQ_API_KEY) {
      throw new Error('Gemini API failed, and no GROQ_API_KEY is configured for fallback.');
    }

    try {
      // Map history for Groq
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }

      messages.push({ role: 'user', content: userMessage });

      const completion = await groq.chat.completions.create({
        messages,
        model: GROQ_MODEL,
        response_format: requireJson ? { type: 'json_object' } : undefined,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (groqError: any) {
      console.error(`[Groq Error] ${groqError?.message}`);
      throw new Error('Both Gemini and Groq AI Chat generation failed.');
    }
  }
};
