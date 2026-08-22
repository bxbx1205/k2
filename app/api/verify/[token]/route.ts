import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/tokens";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const decodedToken = decodeURIComponent(token);
    const result = await verifyToken(decodedToken);

    if (result.valid && result.payload) {
      return NextResponse.json({
        valid: true,
        docType: result.payload.docType,
        maskedValue: result.payload.maskedValue,
        verifiedAt: result.payload.verifiedAt,
        issuedBy: result.payload.issuedBy,
        tokenId: result.payload.tokenId,
      });
    }

    return NextResponse.json({
      valid: false,
      error: result.error || "Invalid token",
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ valid: false, error: "Verification failed" });
  }
}
