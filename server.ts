import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  SamjhaMode,
  SupportedLanguage,
  MemoryRecord,
  detectPromptInjection,
  buildSCEMExecutionTrace,
  buildSystemInstruction,
  verifyResponseWithVEM,
  autoDetectLanguageAndIntent,
} from './src/core/samjhaEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets in AI Studio.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simple in-memory rate limiter per IP (Security Audit Area 12)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'local';
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 60;

  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (entry.count >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded (max 60 requests/minute). Please wait a moment and retry.',
    });
  }
  entry.count += 1;
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow up to 25MB JSON payloads for image/video base64 analysis
  app.use(express.json({ limit: '25mb' }));
  app.use('/api', rateLimitMiddleware);

  // ---------------------------------------------------------------------------
  // 1. Health & Safe Provider Configuration Inspection (Area 4 & Area 9)
  // ---------------------------------------------------------------------------
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Samjha AI Cognitive Server',
      timestamp: new Date().toISOString(),
      providers: {
        geminiConfigured: Boolean(
          process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
        ),
        nvidiaNimConfigured: Boolean(process.env.NVIDIA_API_KEY),
        nvidiaNimEndpoint:
          process.env.NVIDIA_NIM_ENDPOINT || 'https://integrate.api.nvidia.com/v1/chat/completions',
        nvidiaNimModel: process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-70b-instruct',
      },
      models: {
        complexReasoning: 'gemini-4-argon',
        generalAndSearch: 'gemini-3.8-flash',
        lowLatencyFast: 'gemini-3.1-flash-lite',
        highQualityImage: 'gemini-3-pro-image-preview',
        multimodalVisionVideo: 'gemini-4-argon',
      },
      computeEnvironment: {
        gpuAvailable: false,
        cudaDetected: false,
        runtimeMode: 'Server-Side Gemini API + Deterministic SCEM/SCCL Cognitive Engine',
      },
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Multi-Turn Cognitive Chat Endpoint (Area 4, 6, 7)
  // ---------------------------------------------------------------------------
  app.post('/api/chat', async (req: Request, res: Response) => {
    const startMs = Date.now();
    try {
      const {
        prompt,
        history = [],
        mode = 'standard',
        language = 'English',
        memories = [],
        promptTemplate,
        promptVersionId = 'v2.4-verified',
      } = req.body as {
        prompt?: string;
        history?: Array<{ role: 'user' | 'assistant'; content: string }>;
        mode?: SamjhaMode;
        language?: SupportedLanguage;
        memories?: MemoryRecord[];
        promptTemplate?: string;
        promptVersionId?: string;
      };

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'Prompt must be a non-empty string.' });
      }
      if (prompt.length > 12000) {
        return res.status(400).json({ error: 'Prompt exceeds maximum length of 12,000 characters.' });
      }

      const injectionCheck = detectPromptInjection(prompt);
      if (injectionCheck.detected) {
        return res.status(403).json({
          error:
            'Security Policy Violation: Samjha VEM blocked a prompt attempting to override security controls or extract secrets.',
          blockedByVEM: true,
        });
      }

      const autoResult = autoDetectLanguageAndIntent(prompt);
      const effectiveLanguage: SupportedLanguage =
        req.body.autoUnderstand !== false ? autoResult.detectedLanguage : language;
      const effectiveMode: SamjhaMode =
        req.body.autoUnderstand !== false ? autoResult.detectedMode : mode;
      const forceImageGeneration =
        req.body.forceImageGeneration === true || autoResult.isImageRequest;

      const scemTrace = buildSCEMExecutionTrace({
        prompt,
        mode: effectiveMode,
        language: effectiveLanguage,
        memories,
        promptVersionId,
      });

      const ai = getGenAIClient();

      // If the user selected Text-to-Image or asked the chat to generate an image, run Nano Banana (gemini-2.5-flash-image)
      if (forceImageGeneration) {
        const aspectRatio = (req.body.aspectRatio as '1:1' | '16:9' | '4:3' | '3:4' | '9:16') || '1:1';
        const imgResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt.trim() }],
          },
          config: {
            imageConfig: {
              aspectRatio,
            },
          },
        });

        let generatedImageUrl: string | null = null;
        let captionText = '';
        const parts = imgResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            captionText += part.text;
          }
        }

        scemTrace.lpmMetrics.totalLatencyMs = Math.max(1, Date.now() - startMs);

        return res.json({
          text:
            captionText.trim() ||
            `Generated image for: "${prompt.trim()}" using Samjha Nano Vision.`,
          imageUrl: generatedImageUrl,
          modelUsed: 'Samjha Nano Vision',
          detectedIntent: 'Text-to-Image Generation',
          detectedLanguage: effectiveLanguage,
          groundingUrls: [],
          scemTrace,
        });
      }

      const systemInstruction = buildSystemInstruction({
        mode: effectiveMode,
        language: effectiveLanguage,
        memories: scemTrace.cpmSelectedMemories,
        scclTask: scemTrace.parsedTask,
        promptTemplate,
      });

      const targetModel =
        scemTrace.routing.modelId === 'gemini-3-pro-image-preview'
          ? 'gemini-3.8-flash'
          : scemTrace.routing.modelId;

      const contents = [
        ...history.slice(-12).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const config: Record<string, unknown> = {
        systemInstruction,
      };

      if (targetModel === 'gemini-4-argon' || scemTrace.routing.thinkingLevel === 'HIGH') {
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
      }

      if (scemTrace.routing.useSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });

      const responseText =
        response.text || 'Samjha AI processed your request, but no text output was returned.';

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingUrls: Array<{ uri: string; title: string }> = [];
      for (const chunk of rawChunks as Array<{ web?: { uri?: string; title?: string } }>) {
        if (chunk?.web?.uri) {
          groundingUrls.push({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri,
          });
        }
      }

      const vemReport = verifyResponseWithVEM({
        prompt,
        responseText,
        scclTask: scemTrace.parsedTask,
        language: effectiveLanguage,
        groundingUrls,
      });

      scemTrace.vemReport = vemReport;
      scemTrace.lpmMetrics.totalLatencyMs = Math.max(1, Date.now() - startMs);

      return res.json({
        text: responseText,
        modelUsed: autoResult.samjhaBrandLabel,
        detectedIntent: autoResult.intentSummary,
        detectedLanguage: effectiveLanguage,
        groundingUrls,
        scemTrace,
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[/api/chat error]:', errMsg);
      return res.status(500).json({
        error: `Inference pipeline error: ${errMsg}`,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Streaming Chat Endpoint via SSE (Area 4 & Area 13)
  // ---------------------------------------------------------------------------
  app.post('/api/chat/stream', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        history = [],
        mode = 'standard',
        language = 'English',
        memories = [],
      } = req.body as {
        prompt?: string;
        history?: Array<{ role: 'user' | 'assistant'; content: string }>;
        mode?: SamjhaMode;
        language?: SupportedLanguage;
        memories?: MemoryRecord[];
      };

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      const injectionCheck = detectPromptInjection(prompt);
      if (injectionCheck.detected) {
        return res.status(403).json({
          error: 'Blocked by VEM prompt injection filter.',
        });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const scemTrace = buildSCEMExecutionTrace({
        prompt,
        mode,
        language,
        memories,
      });

      const systemInstruction = buildSystemInstruction({
        mode,
        language,
        memories: scemTrace.cpmSelectedMemories,
        scclTask: scemTrace.parsedTask,
      });

      const targetModel =
        scemTrace.routing.modelId === 'gemini-3-pro-image-preview'
          ? 'gemini-3.8-flash'
          : scemTrace.routing.modelId;

      const contents = [
        ...history.slice(-10).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const config: Record<string, unknown> = { systemInstruction };
      if (targetModel === 'gemini-4-argon') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }
      if (scemTrace.routing.useSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      const ai = getGenAIClient();
      const stream = await ai.models.generateContentStream({
        model: targetModel,
        contents,
        config,
      });

      let fullText = '';
      for await (const chunk of stream) {
        const textChunk = chunk.text || '';
        if (textChunk) {
          fullText += textChunk;
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: textChunk })}\n\n`);
        }
      }

      const vemReport = verifyResponseWithVEM({
        prompt,
        responseText: fullText,
        scclTask: scemTrace.parsedTask,
        language,
      });
      scemTrace.vemReport = vemReport;

      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          modelUsed: targetModel,
          scemTrace,
        })}\n\n`
      );
      res.end();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      res.write(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`);
      res.end();
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Free Text-to-Image Generation via Nano Banana (gemini-2.5-flash-image)
  // ---------------------------------------------------------------------------
  app.post('/api/multimodal/image-generate', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        aspectRatio = '1:1',
      } = req.body as {
        prompt?: string;
        aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
      };

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Image prompt is required.' });
      }

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt.trim() }],
        },
        config: {
          imageConfig: {
            aspectRatio,
          },
        },
      });

      let imageUrl: string | null = null;
      let captionText = '';

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          captionText += part.text;
        }
      }

      if (!imageUrl) {
        return res.status(502).json({
          error: 'Samjha Nano Vision completed request but did not return an inline image payload.',
          captionText,
        });
      }

      return res.json({
        imageUrl,
        captionText: captionText || `Created with Samjha Nano Vision: "${prompt.trim()}"`,
        modelUsed: 'Samjha Nano Vision',
        aspectRatio,
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[/api/multimodal/image-generate error]:', errMsg);
      return res.status(500).json({ error: `Image generation failed: ${errMsg}` });
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Image Understanding & Analysis (gemini-4-argon)
  // ---------------------------------------------------------------------------
  app.post('/api/multimodal/analyze-image', async (req: Request, res: Response) => {
    try {
      const {
        base64Data,
        mimeType = 'image/jpeg',
        prompt = 'Analyze this image thoroughly: identify key subjects, text, structure, and actionable insights.',
      } = req.body as {
        base64Data?: string;
        mimeType?: string;
        prompt?: string;
      };

      if (!base64Data || typeof base64Data !== 'string') {
        return res.status(400).json({ error: 'base64Data image payload is required.' });
      }

      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      const ai = getGenAIClient();

      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      return res.json({
        analysis: response.text || 'No analysis text generated.',
        modelUsed: 'gemini-4-argon',
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[/api/multimodal/analyze-image error]:', errMsg);
      return res.status(500).json({ error: `Image analysis failed: ${errMsg}` });
    }
  });

  // ---------------------------------------------------------------------------
  // 6. Video Understanding & Analysis (gemini-4-argon)
  // ---------------------------------------------------------------------------
  app.post('/api/multimodal/analyze-video', async (req: Request, res: Response) => {
    try {
      const {
        base64Data,
        mimeType = 'video/mp4',
        prompt = 'Analyze this video for key events, timeline summary, visual details, and takeaways.',
      } = req.body as {
        base64Data?: string;
        mimeType?: string;
        prompt?: string;
      };

      if (!base64Data || typeof base64Data !== 'string') {
        return res.status(400).json({ error: 'base64Data video payload is required.' });
      }

      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      const ai = getGenAIClient();

      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      return res.json({
        analysis: response.text || 'No video analysis generated.',
        modelUsed: 'gemini-4-argon',
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[/api/multimodal/analyze-video error]:', errMsg);
      return res.status(500).json({ error: `Video analysis failed: ${errMsg}` });
    }
  });

  // ---------------------------------------------------------------------------
  // 7. Isolated Server-Side NVIDIA NIM Adapter (Area 9)
  // ---------------------------------------------------------------------------
  app.post('/api/nvidia/infer', async (req: Request, res: Response) => {
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const endpoint =
      process.env.NVIDIA_NIM_ENDPOINT || 'https://integrate.api.nvidia.com/v1/chat/completions';
    const modelId = req.body?.model || process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-70b-instruct';
    const prompt = req.body?.prompt || 'Verify NVIDIA NIM adapter connectivity.';

    if (!nvidiaKey) {
      return res.status(200).json({
        available: false,
        status: 'BLOCKED_MISSING_CREDENTIALS',
        endpoint,
        modelId,
        message:
          'NVIDIA_API_KEY is not present in environment variables. Adapter schema is verified and isolated, keeping Gemini production routing active as default.',
      });
    }

    try {
      const nimRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 512,
        }),
      });

      const data = await nimRes.json();
      if (!nimRes.ok) {
        return res.status(nimRes.status).json({
          available: false,
          status: 'NIM_UPSTREAM_ERROR',
          endpoint,
          modelId,
          error: data,
        });
      }

      return res.json({
        available: true,
        status: 'VERIFIED',
        endpoint,
        modelId,
        output: data.choices?.[0]?.message?.content || '',
      });
    } catch (error: unknown) {
      return res.status(502).json({
        available: false,
        status: 'NETWORK_ERROR',
        endpoint,
        modelId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Vite middleware in dev, static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Samjha AI server running on http://localhost:${PORT}`);
  });
}

startServer();
