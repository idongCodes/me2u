"use server";

import dbConnect from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
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

export async function submitTestimonial(data: { name: string; content: string }) {
  await dbConnect();
  const testimonial = await Testimonial.create({
    ...data,
    status: "pending",
  });
  return { success: true, id: testimonial._id.toString() };
}

export async function getApprovedTestimonials() {
  await dbConnect();
  const testimonials = await Testimonial.find({ 
    status: "approved", 
    isDeleted: { $ne: true } 
  }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(testimonials));
}

export async function getAdminTestimonials() {
  await checkAdminAuth();
  await dbConnect();
  const testimonials = await Testimonial.find({ 
    isDeleted: { $ne: true } 
  }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(testimonials));
}

export async function approveTestimonial(id: string) {
  await checkAdminAuth();
  await dbConnect();
  await Testimonial.findByIdAndUpdate(id, { status: "approved" });
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  await checkAdminAuth();
  await dbConnect();
  await Testimonial.findByIdAndUpdate(id, { 
    isDeleted: true, 
    deletedAt: new Date() 
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function restoreTestimonial(id: string) {
  await checkAdminAuth();
  await dbConnect();
  await Testimonial.findByIdAndUpdate(id, { 
    isDeleted: false, 
    $unset: { deletedAt: 1 } 
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
