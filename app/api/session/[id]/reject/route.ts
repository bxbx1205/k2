import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";

export async function POST(
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

    const updatedSession = {
      ...parsedSession,
      status: "rejected",
    };

    await redisClient.set(sessionKey, JSON.stringify(updatedSession), "KEEPTTL");

    return NextResponse.json({ success: true, status: "rejected" });
  } catch (error) {
    console.error("Error rejecting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
