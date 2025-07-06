import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "~/lib/password";
import { db } from "~/server/db";

// Define the schema for signup request
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    console.log("Signup request received");

    // Parse and validate request body
    const rawBody = await req.text();
    console.log("Raw body:", rawBody);

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("Parsed body:", body);

    const result = signupSchema.safeParse(body);

    if (!result.success) {
      console.error("Validation error:", result.error.issues);
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    console.log("Validated email:", email);

    // Check if user already exists
    console.log("Checking if user exists");
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists");
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // Hash the password
    console.log("Hashing password");
    const hashedPassword = await hashPassword(password);

    // Create the user
    console.log("Creating user");
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    console.log("User created successfully:", user.id);

    // Return success response
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Signup error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
