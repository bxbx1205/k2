import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSessionFromCookie } from "@/lib/auth";

// GET — list all tokens for the logged-in user
export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ tokens: [] });
    }

    const client = await clientPromise;
    const db = client.db("kyc-demo");
    const tokensCollection = db.collection("tokens");

    const tokens = await tokensCollection
      .find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Update status based on expiry
    const now = new Date();
    const enrichedTokens = tokens.map((t) => ({
      _id: t._id.toString(),
      tokenId: t.tokenId,
      docType: t.docType,
      maskedValue: t.maskedValue,
      status: t.status === "revoked" ? "revoked" : new Date(t.expiresAt) < now ? "expired" : "active",
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
    }));

    return NextResponse.json({ tokens: enrichedTokens });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json({ tokens: [] });
  }
}
