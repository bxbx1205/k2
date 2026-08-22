import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSessionFromCookie } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { ObjectId } from "mongodb";

// POST — generate a new verification token
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { docType, expiryMinutes = 30 } = body;

    if (!docType || (docType !== "aadhaar" && docType !== "pan")) {
      return NextResponse.json({ error: "Invalid docType" }, { status: 400 });
    }

    // Get user's masked value
    const client = await clientPromise;
    const db = client.db("kyc-demo");
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const maskedValue = docType === "aadhaar" ? user.aadhaarLast4 : user.panMasked;

    if (!maskedValue) {
      return NextResponse.json(
        { error: "No documents stored. Add documents first." },
        { status: 400 }
      );
    }

    // Generate token
    const { token, tokenId } = await generateVerificationToken(
      session.userId,
      docType,
      maskedValue,
      expiryMinutes
    );

    // Store token metadata for audit trail
    await db.collection("tokens").insertOne({
      tokenId,
      userId: session.userId,
      docType,
      maskedValue,
      expiryMinutes,
      status: "active",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    });

    const verifyUrl = `/verify/${encodeURIComponent(token)}`;

    return NextResponse.json({
      success: true,
      token,
      tokenId,
      verifyUrl,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
