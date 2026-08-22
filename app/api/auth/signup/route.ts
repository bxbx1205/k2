import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword, createSessionToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("kyc-demo");
    const usersCollection = db.collection("users");

    // Check for duplicate email
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const result = await usersCollection.insertOne({
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
    });

    // Create session token and set cookie
    const token = await createSessionToken(
      result.insertedId.toString(),
      name,
      email.toLowerCase()
    );
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: result.insertedId.toString(), name, email: email.toLowerCase() },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
