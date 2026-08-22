import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  let reqName = "Unknown Entity";
  try {
    const body = await request.json();
    reqName = body.requesterName || "Unknown Entity";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        score: Math.floor(Math.random() * (99 - 70 + 1)) + 70, // Mock trust score 70-99
        summary: `We don't have enough data to evaluate ${reqName} right now. Ensure you trust them before approving.`,
        isMock: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a cyber-security trust evaluator for an identity verification app. A user is being asked to share their sensitive KYC documents with an entity named: "${reqName}".

Generate a "Trust Score" between 1 and 100 representing how legitimate and safe this entity is known to be in the real world (e.g., major banks like SBI get 90-99, random unknown names get 10-30). Also provide a 2-sentence summary explaining the score and whether the user should proceed.

Return the response STRICTLY as a JSON object with this exact structure (no markdown formatting):
{
  "score": 95,
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
    console.error("Error generating trust score:", error);
    return NextResponse.json({
      score: 50,
      summary: `Unable to verify ${reqName} at this time. Proceed with caution.`,
      isMock: true
    });
  }
}
