import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionKey = `session:${id}`;

    const sessionData = await redisClient.get(sessionKey);

    if (!sessionData) {
      return NextResponse.json(
        { error: "Session expired or not found" },
        { status: 404 }
      );
    }

    const parsedSession = JSON.parse(sessionData);

    return NextResponse.json(parsedSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
