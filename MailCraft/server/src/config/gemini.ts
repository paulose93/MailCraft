import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './index';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-3.7-flash',
});

export default genAI;
