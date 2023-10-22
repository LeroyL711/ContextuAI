import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";
// Returns all messages for a given chatId
export const POST = async (req: Request) => {
  const { chatId } = await req.json();
  const dbMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));
  return NextResponse.json(dbMessages);
};
