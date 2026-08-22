import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { generateVerificationToken } from "@/lib/tokens";
import { getSessionFromCookie } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Get the approver's identity from their auth cookie
    const authSession = await getSessionFromCookie();
    if (!authSession) {
      return NextResponse.json(
        { error: "You must be logged in to approve a request" },
        { status: 401 }
      );
    }
    const approverUserId = authSession.userId;

    const { id } = await params;
    const sessionKey = `session:${id}`;

    // 2. Get pending session from Redis
    const sessionData = await redisClient.get(sessionKey);
    if (!sessionData) {
      return NextResponse.json(
        { error: "Session expired or not found" },
        { status: 404 }
      );
    }

    const parsedSession = JSON.parse(sessionData);
    if (parsedSession.status !== "pending") {
       return NextResponse.json(
        { error: "Session is already processed" },
        { status: 400 }
      );
    }

    // 3. Fetch the approver's documents from Mongo
    const client = await clientPromise;
    const db = client.db("kyc-demo");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(approverUserId) });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 4. Determine masked value to share
    const maskedValue =
      parsedSession.docType === "aadhaar" ? user.aadhaarLast4 : user.panMasked;

    if (!maskedValue) {
      return NextResponse.json(
        { error: `You do not have a stored ${parsedSession.docType} to share.` },
        { status: 400 }
      );
    }

    // 5. Generate a permanent verification token for the requester
    let verifyUrl = "";
    try {
      const { token, tokenId } = await generateVerificationToken(
        approverUserId,
        parsedSession.docType,
        maskedValue,
        30 // 30 minute token validity
      );
      verifyUrl = `/verify/${encodeURIComponent(token)}`;

      // Store token metadata
      await db.collection("tokens").insertOne({
        tokenId,
        userId: approverUserId,
        docType: parsedSession.docType,
        maskedValue,
        expiryMinutes: 30,
        status: "active",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        source: "qr-approval",
      });
    } catch (err) {
      console.error("Token generation failed (non-blocking):", err);
    }

    // 6. Update session status and append masked data + token URL, preserving TTL
    const updatedSession = {
      ...parsedSession,
      status: "approved",
      verified: true,
      maskedValue,
      verifyUrl,
      userId: approverUserId // Now the session knows who approved it
    };

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
