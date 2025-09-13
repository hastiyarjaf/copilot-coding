import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "Prompt is required" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ provider: "fallback", message: "No API key set. Add GEMINI_API_KEY to enable AI responses." });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    res.json({ provider: "gemini", message: text.trim() });
  } catch (e) {
    res.status(500).json({ error: "GeminiFailed", details: e?.message });
  }
}