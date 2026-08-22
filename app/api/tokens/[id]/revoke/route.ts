import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSessionFromCookie } from "@/lib/auth";
import { revokeToken } from "@/lib/tokens";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: tokenId } = await params;

    const client = await clientPromise;
    const db = client.db("kyc-demo");

    // Verify the token belongs to this user
    const tokenDoc = await db.collection("tokens").findOne({
      tokenId,
      userId: session.userId,
    });

    if (!tokenDoc) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Revoke in Redis
    await revokeToken(tokenId);

    // Update in MongoDB
    await db.collection("tokens").updateOne(
      { tokenId },
      { $set: { status: "revoked", revokedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
