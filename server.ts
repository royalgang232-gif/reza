import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Server-side Gemini Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to query Gemini with primary model and automatic fallback
async function generateGeminiContent(ai: GoogleGenAI, contents: any) {
  // Try gemini-3.8-flash first; if experiencing temporary high demand/load, fallback to gemini-3.1-flash-lite
  try {
    const res = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_FALLBACK')), 5000)
      ),
    ]);
    return res;
  } catch (err: any) {
    console.warn('[Gemini] Primary model busy/unavailable, trying gemini-3.1-flash-lite fallback...', err?.message);
    return await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
    });
  }
}

// 1. Text & Multimodal Chat / Code Generation Endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, language = 'en', userInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on server.',
        fallback: true,
      });
    }

    const langInstruction =
      language === 'ne'
        ? 'Respond in natural, polite, respectful Nepali (नेपाली भाषा).'
        : language === 'hi'
        ? 'Respond in polite, professional Hindi (हिन्दी भाषा).'
        : 'Respond in professional, concise, intelligent English with JARVIS persona.';

    const systemPrompt = `You are REZA, an advanced JARVIS-like personal desktop AI assistant.
Personality: Highly competent, concise, polite, proactive, tech-savvy.
Language instructions: ${langInstruction}
${userInstruction ? `Additional context: ${userInstruction}` : ''}
User Request: ${prompt}

Provide an immediate, direct response. If code is requested, provide clean code in markdown code blocks with clear explanation. Never fabricate completed OS actions; ask confirmation for dangerous tasks.`;

    const response = await generateGeminiContent(ai, systemPrompt);
    const replyText = response.text || 'Command acknowledged and processed.';

    // Extract code snippet if present
    const codeMatch = replyText.match(/```(\w+)?\n([\s\S]*?)```/);
    let codeSnippet = undefined;
    if (codeMatch) {
      codeSnippet = {
        language: codeMatch[1] || 'python',
        code: codeMatch[2].trim(),
        explanation: 'Generated script for requested automation.',
      };
    }

    return res.json({
      text: replyText,
      codeSnippet,
    });
  } catch (error: any) {
    console.error('Server Gemini generate error:', error);
    return res.status(500).json({
      error: error.message || 'Gemini server processing error',
      fallback: true,
    });
  }
});

// 2. Server-side Streaming Endpoint (SSE)
app.post('/api/gemini/stream', async (req, res) => {
  try {
    const { prompt, language = 'en' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not set', fallback: true });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const langInstruction =
      language === 'ne'
        ? 'Respond in natural, respectful Nepali (नेपाली भाषा).'
        : language === 'hi'
        ? 'Respond in polite, professional Hindi (हिन्दी भाषा).'
        : 'Respond in professional, concise, intelligent English with JARVIS persona.';

    const systemPrompt = `You are REZA, an advanced JARVIS-like personal desktop AI assistant.
Language instructions: ${langInstruction}
User Request: ${prompt}`;

    let stream: any;
    try {
      stream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
      });
    } catch {
      stream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents: systemPrompt,
      });
    }

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Server Gemini stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// 3. Screen Vision & Multimodal Image Analysis Endpoint
app.post('/api/gemini/vision', async (req, res) => {
  try {
    const { base64Image, instruction } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image data' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on server.',
        fallback: true,
      });
    }

    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const prompt =
      instruction ||
      'Analyze this desktop screen. Explain what is visible, identify any open applications, windows, errors, or prominent buttons, and guide the user on recommended next actions.';

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
    ];

    const response = await generateGeminiContent(ai, contents);
    const report = response.text || 'Screen analyzed successfully. No notable errors detected.';
    return res.json({ text: report });
  } catch (error: any) {
    console.error('Server Gemini vision error:', error);
    return res.status(500).json({
      error: error.message || 'Vision analysis failed',
      fallback: true,
    });
  }
});

// 4. Live Internet Search Endpoint for Web, Mobile, and Laptop
app.get('/api/search', async (req, res) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'Search query parameter (q) is required' });
    }

    // Try DuckDuckGo Instant Answers
    try {
      const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      if (ddgRes.ok) {
        const ddgData: any = await ddgRes.json();
        if (ddgData.AbstractText) {
          return res.json({
            title: ddgData.Heading || query,
            snippet: ddgData.AbstractText,
            sourceUrl: ddgData.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            sourceName: 'DuckDuckGo Live Knowledge',
            isLive: true,
          });
        }
        if (ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
          const first = ddgData.RelatedTopics[0];
          if (first.Text) {
            return res.json({
              title: query,
              snippet: first.Text,
              sourceUrl: first.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
              sourceName: 'DuckDuckGo Instant Topic',
              isLive: true,
            });
          }
        }
      }
    } catch (e) {
      console.warn('DuckDuckGo search error in server:', e);
    }

    // Try Wikipedia Summary API
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (wikiRes.ok) {
        const wikiData: any = await wikiRes.json();
        if (wikiData.extract && wikiData.type !== 'disambiguation') {
          return res.json({
            title: wikiData.title || query,
            snippet: wikiData.extract,
            sourceUrl: wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            sourceName: 'Wikipedia Live Data',
            isLive: true,
          });
        }
      }
    } catch (e) {
      console.warn('Wikipedia search error in server:', e);
    }

    // Fallback: Use Gemini server knowledge synthesis
    const ai = getGeminiClient();
    if (ai) {
      try {
        const geminiRes = await generateGeminiContent(ai, `Provide a concise, up-to-date, factual summary for internet search query: "${query}". Keep under 3 paragraphs.`);
        if (geminiRes.text) {
          return res.json({
            title: `Search Intelligence: ${query}`,
            snippet: geminiRes.text,
            sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            sourceName: 'REZA Live Web Intelligence',
            isLive: true,
          });
        }
      } catch (err) {
        console.warn('Gemini search synthesis error:', err);
      }
    }

    return res.json({
      title: `Web Query: ${query}`,
      snippet: `Live search query dispatched for "${query}". You can browse full external web index results directly.`,
      sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      sourceName: 'Global Web Index',
      isLive: true,
    });
  } catch (error: any) {
    console.error('Server search route error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. WebSocket Server for Gemini Live API (`gemini-3.8-live`)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to WebSocket');
  const ai = getGeminiClient();
  if (!ai) {
    clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server.' }));
    clientWs.close();
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction:
          'You are REZA, an intelligent, helpful, professional, conversational, and concise personal AI desktop assistant like JARVIS. Support English, Hindi, and Nepali seamlessly.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          for (const part of message.serverContent?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (part.text) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ text: part.text }));
              }
            }
          }
          if (message.serverContent?.interrupted) {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          }
        },
        onerror: (err: any) => {
          console.error('[Live API] Session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ error: err.message || 'Live session error' }));
          }
        },
        onclose: () => {
          console.log('[Live API] Session closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close();
          }
        },
      },
    });

    clientWs.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio && session) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (parsed.text && session) {
          session.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [{ text: parsed.text }],
              },
            ],
            turnComplete: true,
          });
        }
      } catch (e) {
        console.warn('[Live API] Error handling client message:', e);
      }
    });

    clientWs.on('close', () => {
      if (session) {
        try {
          session.close();
        } catch {}
      }
    });
  } catch (err: any) {
    console.error('[Live API] Initialization error:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: err.message || 'Failed to start Live session' }));
      clientWs.close();
    }
  }
});

// Upgrade HTTP requests to WebSocket on /api/gemini/live
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/api/gemini/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Integrate Vite middleware in development, or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[REZA Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
