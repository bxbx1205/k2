import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { encrypt } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, aadhaarNumber, panNumber } = body;

    if (!name || !aadhaarNumber || !panNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Masking
    // Aadhaar format typically: 12 digits. Last 4 digits visible.
    const aadhaarStr = aadhaarNumber.toString().replace(/\s/g, "");
    const aadhaarLast4 = aadhaarStr.slice(-4);
    
    // PAN format typically: 10 chars (e.g. ABCDE1234F).
    const panStr = panNumber.toString().toUpperCase().replace(/\s/g, "");
    const panMasked = panStr.slice(0, 5) + "****" + panStr.slice(-1);

    // Encryption
    const aadhaarEncrypted = encrypt(aadhaarStr);
    const panEncrypted = encrypt(panStr);

    const client = await clientPromise;
    const db = client.db("kyc-demo"); // Using standard db name for the demo
    const usersCollection = db.collection("users");

    const newUser = {
      name,
      aadhaarEncrypted,
      aadhaarLast4,
      panEncrypted,
      panMasked,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      userId: result.insertedId.toString(),
      success: true,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
