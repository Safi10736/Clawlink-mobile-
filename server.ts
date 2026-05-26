/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '12mb' }));

// Initialize GoogleGenAI securely server-side using the injected API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint: AI Audio Chat Assistant
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemInstruction = 
      "You are 'CrewLink Core AI', the assistant built inside CrewLink Mobile—the proximity and group status voice-chat app for mobile gamers (Among Us, PUBG, Roblox, Free Fire). " +
      "You troubleshoot microphone issues, explain overlay setup steps (Android accessibility/draw-over), propose custom audio sensitivity rules, " +
      "and configure Alive/Dead channel logic. Keep answers conversational, friendly, encouraging, and heavily optimized for gamers. Use gaming references where appropriate.";

    const contents = [];
    if (history && Array.isArray(history)) {
      contents.push(...history);
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ reply: response.text || "I was unable to complete that thought, please try again!" });
  } catch (error: any) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI chat response" });
  }
});

// Endpoint: AI Settings & Overlay Screenshot Diagnostics
app.post("/api/gemini/diagnose", async (req, res) => {
  try {
    const { imageBase64, imageMimeType, customContext } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Config screenshot is required as high-resolution base64 data" });
    }

    const mime = imageMimeType || "image/png";
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mime,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analyze this mobile setup configuration or phone status screenshot. Help the user diagnose why their game overlay, background service, or microphone setup might be blocked or suboptimal. ${customContext ? `User says: "${customContext}".` : ""} Provide a clear, friendly, and step-by-step breakdown: 1) Detected status/issue, 2) Simple fix tutorial, 3) Best audio recommendations. Use markdown format.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: "You are the advanced visual diagnosis expert of CrewLink Mobile. Analyze system permissions, volume panels, system warnings, mic status icons, and game UI settings with precision. Propose direct, step-by-step fixes.",
      }
    });

    res.json({ analysis: response.text || "Could not analyze the image context." });
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    res.status(500).json({ error: error.message || "Visual diagnosis engine has misfired." });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CrewLink Express server running on port ${PORT}`);
  });
}

startServer();
