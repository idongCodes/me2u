"use server";

import connectToDatabase from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { revalidatePath } from "next/cache";

export async function getMessages() {
  await connectToDatabase();
  const messages = await ContactMessage.find({ isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean();
  
  // Transform _id to id and createdAt to string to avoid serialization issues
  return messages.map((msg: any) => ({
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
  // SOFT DELETE
  await ContactMessage.findByIdAndUpdate(id, { 
    isDeleted: true, 
    deletedAt: new Date() 
  });
  revalidatePath('/admin');
}

export async function restoreMessage(id: string) {
  await connectToDatabase();
  await ContactMessage.findByIdAndUpdate(id, { 
    isDeleted: false, 
    $unset: { deletedAt: 1 } 
  });
  revalidatePath('/admin');
  return { success: true };
}

export async function adminBulkUpdateMessageStatus(ids: string[], status: 'read' | 'unread' | 'archived' | 'spam' | 'trash') {
  await connectToDatabase();
  await ContactMessage.updateMany({ _id: { $in: ids } }, { status });
  revalidatePath('/admin');
  return { success: true };
}

export async function adminBulkDeleteMessages(ids: string[]) {
  await connectToDatabase();
  // SOFT DELETE BULK
  const result = await ContactMessage.updateMany(
    { _id: { $in: ids } }, 
    { 
      isDeleted: true, 
      deletedAt: new Date() 
    }
  );
  revalidatePath('/admin');
  return { success: true, deletedCount: result.modifiedCount };
}

export async function bulkRestoreMessages(ids: string[]) {
  await connectToDatabase();
  await ContactMessage.updateMany(
    { _id: { $in: ids } }, 
    { 
      isDeleted: false, 
      $unset: { deletedAt: 1 } 
    }
  );
  revalidatePath('/admin');
  return { success: true };
}
