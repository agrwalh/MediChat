import { NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const users = await getUsersCollection();
  await users.createIndex({ email: 1 }, { unique: true });

  const existing = await users.findOne({ email: trimmedEmail });
  if (existing) {
    return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = {
    email: trimmedEmail,
    passwordHash,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { insertedId } = await users.insertOne(user);

  await createSession({ sub: insertedId.toString(), email: trimmedEmail, role: user.role });

  return NextResponse.json({
    user: {
      id: insertedId.toString(),
      email: trimmedEmail,
      role: user.role,
    },
  });
}

