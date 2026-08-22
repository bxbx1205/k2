import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { docType, timeLimitSeconds = 300 } = body;

    if (!docType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (docType !== "aadhaar" && docType !== "pan") {
      return NextResponse.json(
        { error: "Invalid docType" },
        { status: 400 }
      );
    }

    const sessionId = uuidv4();
    const sessionKey = `session:${sessionId}`;

    const sessionData = {
      docType,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Store in Redis with TTL
    await redisClient.set(
      sessionKey,
      JSON.stringify(sessionData),
      "EX",
      parseInt(timeLimitSeconds.toString(), 10)
    );

    return NextResponse.json({
      sessionId,
      success: true,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
