import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getSession } from "@/lib/session";
import { getUsersCollection } from "@/lib/mongodb";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const payload = await request.json().catch(() => ({}));
  const { role } = payload as { role?: "user" | "admin" };

  if (role !== "user" && role !== "admin") {
    return NextResponse.json({ error: "Role must be 'user' or 'admin'." }, { status: 400 });
  }

  if (session.sub === id && role !== "admin") {
    return NextResponse.json(
      { error: "You cannot revoke your own admin access." },
      { status: 400 }
    );
  }

  const usersCollection = await getUsersCollection();
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

