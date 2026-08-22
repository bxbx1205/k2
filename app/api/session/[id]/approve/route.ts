import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionKey = `session:${id}`;

    // 1. Get session from Redis
    const sessionData = await redisClient.get(sessionKey);
    if (!sessionData) {
      return NextResponse.json(
        { error: "Session expired or not found" },
        { status: 404 }
      );
    }

    const parsedSession = JSON.parse(sessionData);

    // 2. Fetch user from Mongo
    const client = await clientPromise;
    const db = client.db("kyc-demo");
    const usersCollection = db.collection("users");

    let user;
    try {
      user = await usersCollection.findOne({ _id: new ObjectId(parsedSession.userId) });
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. Determine masked value
    const maskedValue =
      parsedSession.docType === "aadhaar" ? user.aadhaarLast4 : user.panMasked;

    // 4. Update session status and append masked data, preserving TTL
    const updatedSession = {
      ...parsedSession,
      status: "approved",
      verified: true,
      maskedValue,
    };

    // KEEPTTL preserves the existing TTL
    await redisClient.set(sessionKey, JSON.stringify(updatedSession), "KEEPTTL");

    return NextResponse.json({ success: true, status: "approved" });
  } catch (error) {
    console.error("Error approving session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
