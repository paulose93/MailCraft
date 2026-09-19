import { Response } from 'express';
import { generateAiContent, chatAiContent } from '../../utils/ai-fallback';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

const getBrandContext = async (orgId: string): Promise<string> => {
  const brandKit = await prisma.brandKit.findUnique({
    where: { organizationId: orgId },
  });

  if (!brandKit) return '';

  return `
Brand Context:
- Company: ${brandKit.companyName}
- Brand Description: ${brandKit.brandDescription || 'Not specified'}
- Writing Tone: ${brandKit.writingTone}
- Target Audience: ${brandKit.audience || 'General'}
- Mission: ${brandKit.mission || 'Not specified'}
- Primary Color: ${brandKit.primaryColor}
- Secondary Color: ${brandKit.secondaryColor}
- Logo URL: ${brandKit.logoUrl || 'Not specified'}

Please ensure all content aligns with this brand identity.
  `.trim();
};

export const generateNewsletter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { topic, keyPoints, length = 'medium', includeSections } = req.body;
    const brandContext = await getBrandContext(orgId);

    const prompt = `
You are an expert newsletter writer. Create a professional HTML newsletter.

${brandContext}

Topic: ${topic}
${keyPoints ? `Key Points to Cover: ${keyPoints}` : ''}
Length: ${length} (short = ~200 words, medium = ~400 words, long = ~600 words)
${includeSections ? `Include these sections: ${includeSections.join(', ')}` : ''}

Requirements:
- Write engaging, professional newsletter content
- Use clean HTML with inline styles
- Include a compelling headline
- Structure with clear sections
- Make it scannable with short paragraphs
- End with a clear call-to-action
- Do NOT include <html>, <head>, or <body> tags - just the content HTML
- Use the brand's primary color for headings and accents

Return ONLY the HTML content, no markdown code blocks.
    `.trim();

    const content = await generateAiContent(prompt);
    res.json({ content });
  } catch (error) {
    console.error('Generate newsletter error:', error);
    res.status(500).json({ error: 'Failed to generate newsletter.' });
  }
};

export const rewriteContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { content, instruction } = req.body;
    const brandContext = await getBrandContext(orgId);

    const prompt = `
You are an expert content editor. Rewrite the following newsletter content.

${brandContext}

Original Content:
${content}

Instruction: ${instruction || 'Improve the content while maintaining the same message'}

Requirements:
- Maintain the same HTML structure
- Keep inline styles
- Improve clarity and engagement
- Return ONLY the rewritten HTML content
    `.trim();

    const rewritten = await generateAiContent(prompt);
    res.json({ content: rewritten });
  } catch (error) {
    console.error('Rewrite error:', error);
    res.status(500).json({ error: 'Failed to rewrite content.' });
  }
};

export const improveGrammar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    const prompt = `
Fix all grammar, spelling, and punctuation errors in the following HTML content.
Keep the exact same HTML structure and inline styles.
Only fix language errors, do not change the meaning or tone.
Return ONLY the corrected HTML content.

Content:
${content}
    `.trim();

    const fixed = await generateAiContent(prompt);
    res.json({ content: fixed });
  } catch (error) {
    console.error('Grammar error:', error);
    res.status(500).json({ error: 'Failed to improve grammar.' });
  }
};

export const changeTone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, tone } = req.body;

    const prompt = `
Rewrite the following HTML newsletter content in a ${tone} tone.
Keep the exact same HTML structure and inline styles.
Return ONLY the rewritten HTML content.

Content:
${content}
    `.trim();

    const rewritten = await generateAiContent(prompt);
    res.json({ content: rewritten });
  } catch (error) {
    console.error('Change tone error:', error);
    res.status(500).json({ error: 'Failed to change tone.' });
  }
};

export const generateSubjectLine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { content, count = 5 } = req.body;
    const brandContext = await getBrandContext(orgId);

    const prompt = `
Generate ${count} compelling email subject lines for this newsletter content.

${brandContext}

Newsletter Content (summary):
${content?.substring(0, 1000) || 'General newsletter'}

Requirements:
- Each subject line should be under 60 characters
- Make them compelling, curiosity-driven, and action-oriented
- Vary the styles (question, number-based, urgent, benefit-driven, etc.)
- Return as a JSON array of strings

Return ONLY a JSON array like: ["Subject 1", "Subject 2", ...]
    `.trim();

    const text = await generateAiContent(prompt, true);

    try {
      const subjects = JSON.parse(text);
      res.json({ subjects });
    } catch {
      res.json({ subjects: [text] });
    }
  } catch (error) {
    console.error('Generate subject error:', error);
    res.status(500).json({ error: 'Failed to generate subject lines.' });
  }
};

export const generateCTA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, goal } = req.body;

    const prompt = `
Generate 5 compelling call-to-action (CTA) button texts for this newsletter.

Newsletter Content:
${content?.substring(0, 500) || 'General newsletter'}

Goal: ${goal || 'Drive engagement'}

Requirements:
- Each CTA should be 2-5 words
- Action-oriented and compelling
- Varied styles
- Return as a JSON array of strings

Return ONLY a JSON array like: ["CTA 1", "CTA 2", ...]
    `.trim();

    const text = await generateAiContent(prompt, true);

    try {
      const ctas = JSON.parse(text);
      res.json({ ctas });
    } catch {
      res.json({ ctas: [text] });
    }
  } catch (error) {
    console.error('Generate CTA error:', error);
    res.status(500).json({ error: 'Failed to generate CTAs.' });
  }
};

export const chatUnlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { prompt, history } = req.body;
    const brandContext = await getBrandContext(orgId);
    
    // Fetch brandKit again to safely inject colors into the prompt string
    const brandKit = await prisma.brandKit.findUnique({ where: { organizationId: orgId } });
    const primaryColor = brandKit?.primaryColor || '#000000';
    const secondaryColor = brandKit?.secondaryColor || '#555555';
    const logoUrl = brandKit?.logoUrl || 'https://placehold.co/600x300/EEE/31343C?text=Your+Logo';

    // We build the full context for Gemini
    const systemPrompt = `
You are an expert AI email designer acting as an assistant inside a drag-and-drop email builder (Unlayer).
Your goal is to help the user create email templates based on their requests.

${brandContext}

Instructions:
1. You must construct the email using native drag-and-drop structural blocks.
2. The allowed block types are:
   - "text": { "type": "text", "values": { "text": "<p>Your HTML text here</p>" } }
   - "button": { "type": "button", "values": { "text": "Click Here", "url": "https://example.com", "backgroundColor": "${primaryColor}", "textColor": "#FFFFFF" } }
   - "image": { "type": "image", "values": { "src": { "url": "https://placehold.co/600x300/EEE/31343C" } } }
   - "divider": { "type": "divider", "values": { "lineColor": "#E5E5E5" } }
3. Break the email down into these individual blocks so the user can easily drag, drop, and edit them later in the editor. Do not put everything in one text block. Use buttons for calls to action.
4. If the user asks for a logo or a header image, use an "image" block with this exact URL: "${logoUrl}".
5. If the user asks to use the secondary color, or if a secondary CTA button is needed, you can change the button's "backgroundColor" to: "${secondaryColor}".
6. Output your response STRICTLY as a JSON object with this exact shape:
{
  "message": "Your conversational response here explaining what you designed...",
  "blocks": [
    // Array of the block objects defined above
  ]
}
    `.trim();

    const text = await chatAiContent(systemPrompt, prompt, history, true);
    const parsed = JSON.parse(text);

    // Construct the Unlayer Design JSON wrapping the generated blocks
    const designJson = {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: parsed.blocks || []
              }
            ]
          }
        ]
      }
    };

    res.json({
      message: parsed.message,
      designJson,
    });
  } catch (error: any) {
    console.error('Unlayer Chatbot error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate email template.' });
  }
};
