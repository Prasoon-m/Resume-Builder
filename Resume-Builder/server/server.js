// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Initialize Google Generative AI client ---
const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// --- Endpoint to generate improved resume summary ---
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("✅ Received prompt from frontend:", prompt);

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Select model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5" });
    console.log("✅ Model initialized successfully");

    // Generate content
    const result = await model.generateContent([`Improve this resume summary: ${prompt}`]);
    console.log("✅ AI generateContent result:", result);

    // Extract text response safely
    const aiText = result.response?.text?.() || "No response from AI.";
    console.log("✅ AI response text:", aiText);

    res.json({ summary: aiText });
  } catch (error) {
    console.error("❌ AI Generation Error:", error);
    res.status(500).json({ error: "Error generating AI summary" });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
