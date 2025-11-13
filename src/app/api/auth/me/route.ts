import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(session.sub) }, { projection: { passwordHash: 0 } });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  });
}

