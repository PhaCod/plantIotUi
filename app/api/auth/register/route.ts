import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Simulate backend registration logic
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ message: errorData.message || "Registration failed" }, { status: response.status });
    }

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error) {
    console.error("Error in registration API:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
