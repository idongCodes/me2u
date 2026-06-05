"use server";

import connectToDatabase from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { revalidatePath } from "next/cache";

export async function getMessages() {
  await connectToDatabase();
  const messages = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .lean();
  
  // Transform _id to id and createdAt to string to avoid serialization issues
  return messages.map((msg: Record<string, unknown> & { _id: { toString(): string }, createdAt: Date, updatedAt: Date }) => ({
    ...msg,
    id: msg._id.toString(),
    _id: msg._id.toString(),
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
  })) as any[];
}

export async function updateMessageStatus(id: string, status: 'unread' | 'read' | 'archived' | 'spam' | 'trash') {
  await connectToDatabase();
  await ContactMessage.findByIdAndUpdate(id, { status });
  revalidatePath('/admin');
}

export async function deleteMessage(id: string) {
  await connectToDatabase();
  await ContactMessage.findByIdAndDelete(id);
  revalidatePath('/admin');
}
