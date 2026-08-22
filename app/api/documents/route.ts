import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { encrypt } from "@/lib/crypto";
import { getSessionFromCookie } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET — list documents for the logged-in user
export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ documents: [] });
    }

    const client = await clientPromise;
    const db = client.db("kyc-demo");
    const usersCollection = db.collection("users");

    let user;
    try {
      user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    } catch {
      return NextResponse.json({ documents: [] });
    }

    if (!user) {
      return NextResponse.json({ documents: [] });
    }

    // Build documents array from user's stored data
    const documents = [];
    if (user.aadhaarEncrypted) {
      documents.push({
        _id: `${user._id}-aadhaar`,
        docType: "aadhaar",
        maskedValue: user.aadhaarLast4,
        createdAt: user.createdAt,
      });
    }
    if (user.panEncrypted) {
      documents.push({
        _id: `${user._id}-pan`,
        docType: "pan",
        maskedValue: user.panMasked,
        createdAt: user.createdAt,
      });
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ documents: [] });
  }
}

// POST — store documents for the logged-in user
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { aadhaarNumber, panNumber } = body;

    if (!aadhaarNumber || !panNumber) {
      return NextResponse.json(
        { error: "Both Aadhaar and PAN numbers are required" },
        { status: 400 }
      );
    }

    // Masking
    const aadhaarStr = aadhaarNumber.toString().replace(/\s/g, "");
    const aadhaarLast4 = aadhaarStr.slice(-4);

    const panStr = panNumber.toString().toUpperCase().replace(/\s/g, "");
    const panMasked = panStr.slice(0, 5) + "****" + panStr.slice(-1);

    // Encryption
    const aadhaarEncrypted = encrypt(aadhaarStr);
    const panEncrypted = encrypt(panStr);

    const client = await clientPromise;
    const db = client.db("kyc-demo");
    const usersCollection = db.collection("users");

    // Update the existing user record with document data
    await usersCollection.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $set: {
          aadhaarEncrypted,
          aadhaarLast4,
          panEncrypted,
          panMasked,
          documentsUpdatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      userId: session.userId,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
