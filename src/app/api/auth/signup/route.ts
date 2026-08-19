import { NextResponse } from "next/server";
import { mockUsers } from "@/lib/mockDb";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Add new user to the mock database
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // Stored in plain text for this mock assignment ONLY
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`, // Generates a cute random avatar
    };

    mockUsers.push(newUser);

    return NextResponse.json(
      { message: "User created successfully", user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
