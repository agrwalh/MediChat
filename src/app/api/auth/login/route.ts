import { NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();

  const users = await getUsersCollection();
  const user = await users.findOne({ email: trimmedEmail });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const role = user.role || "user";

  await createSession({ sub: user._id.toString(), email: trimmedEmail, role });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: trimmedEmail,
      role,
    },
  });
}

