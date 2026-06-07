"use server";

import dbConnect from "@/lib/mongodb";
import ShopItem from "@/models/ShopItem";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  const session = await verifySession(sessionCookie);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getShopItems() {
  await dbConnect();
  const items = await ShopItem.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(items));
}

export async function getAvailableShopItems() {
  await dbConnect();
  const items = await ShopItem.find({ 
    isDeleted: { $ne: true },
    status: { $ne: "sold" }
  }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(items));
}

export async function createShopItem(data: {
  name: string;
  price: number;
  description: string;
  images: string[];
  category?: string;
}) {
  await checkAdminAuth();
  await dbConnect();
  
  const item = await ShopItem.create(data);
  revalidatePath("/shop");
  revalidatePath("/admin");
  
  return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

export async function updateShopItem(id: string, data: any) {
  await checkAdminAuth();
  await dbConnect();
  
  const item = await ShopItem.findByIdAndUpdate(id, data, { new: true });
  if (!item) return { success: false, error: "Item not found" };
  
  revalidatePath("/shop");
  revalidatePath("/admin");
  
  return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

export async function deleteShopItem(id: string) {
  await checkAdminAuth();
  await dbConnect();
  
  // Soft delete
  await ShopItem.findByIdAndUpdate(id, { 
    isDeleted: true, 
    deletedAt: new Date() 
  });
  
  revalidatePath("/shop");
  revalidatePath("/admin");
  
  return { success: true };
}

export async function restoreShopItem(id: string) {
  await checkAdminAuth();
  await dbConnect();
  
  await ShopItem.findByIdAndUpdate(id, { 
    isDeleted: false, 
    $unset: { deletedAt: 1 } 
  });
  
  revalidatePath("/shop");
  revalidatePath("/admin");
  
  return { success: true };
}

export async function updateItemStatus(id: string, status: "available" | "reserved" | "sold") {
  await checkAdminAuth();
  await dbConnect();
  
  await ShopItem.findByIdAndUpdate(id, { status });
  
  revalidatePath("/shop");
  revalidatePath("/admin");
  
  return { success: true };
}
