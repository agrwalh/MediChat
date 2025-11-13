import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUsersCollection } from "@/lib/mongodb";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const usersCollection = await getUsersCollection();
  const users = await usersCollection
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      role: user.role ?? "user",
      createdAt: user.createdAt ? user.createdAt.toISOString?.() ?? user.createdAt : undefined,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString?.() ?? user.updatedAt : undefined,
    })),
  });
}

