import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { docType, maskedValue } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock mode if no API key is provided
      return NextResponse.json({
        score: Math.floor(Math.random() * (850 - 700 + 1)) + 700,
        summary: "This user has a securely verified identity. Based on available financial records linked to this masked document, they demonstrate responsible credit behavior and low risk. VaultID's zero-knowledge proof confirms authenticity without exposing raw data.",
        isMock: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an AI financial underwriter. A user has just verified their identity using a zero-knowledge token.
Document Type: ${docType}
Masked Value: ${maskedValue}

Generate a realistic but entirely fictional credit score (between 300 and 900, heavily weighted towards a good score 700+) and a 2-3 sentence summary evaluating their trustworthiness based on this successful, highly-secure identity verification. Do not ask for more information.

Return the response STRICTLY as a JSON object with this exact structure (no markdown formatting, no code blocks):
{
  "score": 750,
  "summary": "Your assessment text here."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Clean up potential markdown formatting if the model disobeys instructions
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n/, "").replace(/\n```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/```\n/, "").replace(/\n```$/, "");
    }

    const parsed = JSON.parse(text);

    return NextResponse.json({
      score: parsed.score,
      summary: parsed.summary,
      isMock: false
    });
  } catch (error) {
    console.error("Error generating credit score:", error);
    // Fallback if AI fails
    return NextResponse.json({
      score: 742,
      summary: "Identity verified securely via VaultID. User maintains a stable financial profile and is considered a trustworthy applicant.",
      isMock: true,
      error: "AI generation failed, returned fallback."
    });
  }
}
