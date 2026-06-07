"use server";

import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import { Resend } from "resend";
import twilio from "twilio";
import crypto from "crypto";
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

// Generate times from 10:00 to 17:00 in 30-min intervals
// 15 min block + 15 min buffer = 30 min spacing
const ALL_TIMES = [
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
];

export async function getAvailableTimes(date: string, excludeId?: string) {
  await dbConnect();
  
  // Find all reservations for this date
  const query: any = { date };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const reservations = await Reservation.find(query).select("time");
  const bookedTimes = reservations.map(r => r.time);
  
  // Filter out booked times
  const availableTimes = ALL_TIMES.filter(t => !bookedTimes.includes(t));
  
  return availableTimes;
}

export async function createReservation(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  optIn: "sms" | "email" | "both" | "none";
  items: Array<{ id: string; name: string; price: number }>;
  totalPrice: number;
}) {
  await dbConnect();

  // Validate time is still available
  const existing = await Reservation.findOne({ date: data.date, time: data.time });
  if (existing) {
    return { success: false, error: "This time slot is no longer available. Please select another time." };
  }

  const reservation = await Reservation.create({
    ...data,
    editToken: crypto.randomUUID()
  });

  // Send Notifications asynchronously
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "idongcodes@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    const adminPhone = "+17743126471";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fromme2u.app";

    const itemsList = data.items.map(i => `${i.name} ($${i.price})`).join(", ");
    const manageUrl = `${baseUrl}/manage-reservation/${reservation._id}?token=${reservation.editToken}`;
    
    // --- NOTIFY ADMIN ---
    const adminNotificationText = `New Reservation from ${data.name} (${data.phone}, ${data.email}) for ${data.date} at ${data.time}.\nItems: ${itemsList}\nTotal: $${data.totalPrice}\nView/Edit: ${manageUrl}`;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error } = await resend.emails.send({
        from: "Me2U Reservations <hello@fromme2u.app>", 
        to: adminEmail,
        subject: `New Reservation: ${data.name} on ${data.date}`,
        text: adminNotificationText,
      });
      if (error) console.error("Resend Admin Email Error:", error);
    }

    if (twilioSid && twilioAuth && twilioPhone) {
      const client = twilio(twilioSid, twilioAuth);
      await client.messages.create({
        body: adminNotificationText,
        from: twilioPhone,
        to: adminPhone,
      }).catch(err => console.error("Twilio Admin SMS Error:", err));
    }

    // --- NOTIFY CUSTOMER ---
    const wantsEmail = data.optIn === "email" || data.optIn === "both";
    const customerNotificationText = `Hi ${data.name}, your reservation at Me2U for ${data.date} at ${data.time} is confirmed! Total: $${data.totalPrice} (Cash Only).\n\nAddress: 212 May St, Worcester, MA 01602\n\nWe look forward to seeing you.\n\nYou can edit or cancel your reservation within 15 minutes here: ${manageUrl}`;

    if (wantsEmail && resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error } = await resend.emails.send({
        from: "Me2U <hello@fromme2u.app>",
        to: data.email,
        subject: "Your Me2U Reservation is Confirmed!",
        text: customerNotificationText,
      });
      if (error) console.error("Resend Customer Email Error:", error);
    }

  } catch (error) {
    console.error("Critical error in notification block:", error);
  }

  return { success: true, reservationId: reservation._id.toString() };
}

export async function getReservationForEdit(id: string, token: string) {
  await dbConnect();
  const reservation = await Reservation.findOne({ _id: id, editToken: token });
  
  if (!reservation) {
    return { success: false, error: "Reservation not found or invalid token." };
  }

  return { success: true, reservation: JSON.parse(JSON.stringify(reservation)) };
}

export async function updateReservation(id: string, token: string, data: {
  date: string;
  time: string;
  items: Array<{ id: string; name: string; price: number }>;
  totalPrice: number;
}) {
  await dbConnect();
  const reservation = await Reservation.findOne({ _id: id, editToken: token });

  if (!reservation) {
    return { success: false, error: "Reservation not found or invalid token." };
  }

  // Check 15 min window
  const now = new Date();
  const diff = (now.getTime() - reservation.createdAt.getTime()) / 1000 / 60;
  if (diff > 15) {
    return { success: false, error: "The 15-minute window for editing this reservation has passed." };
  }

  // Check edit count limit
  if (reservation.editCount >= 2) {
    return { success: false, error: "You have reached the maximum of 2 modifications for this reservation." };
  }

  // Validate time availability (excluding current reservation)
  const existing = await Reservation.findOne({ 
    date: data.date, 
    time: data.time,
    _id: { $ne: id } 
  });
  if (existing) {
    return { success: false, error: "This time slot is no longer available. Please select another time." };
  }

  await Reservation.updateOne(
    { _id: id }, 
    { 
      ...data, 
      status: "pending",
      $inc: { editCount: 1 }
    }
  );

  return { success: true };
}

export async function cancelReservation(id: string, token: string) {
  await dbConnect();
  const reservation = await Reservation.findOne({ _id: id, editToken: token });

  if (!reservation) {
    return { success: false, error: "Reservation not found or invalid token." };
  }

  // Check if it's at least 15 minutes before the booked time
  const [year, month, day] = reservation.date.split("-").map(Number);
  const [hour, minute] = reservation.time.split(":").map(Number);
  const bookedDateTime = new Date(year, month - 1, day, hour, minute).getTime();
  
  const now = new Date().getTime();
  const diffToBooking = (bookedDateTime - now) / 1000 / 60; // in minutes

  if (diffToBooking < 15) {
    return { success: false, error: "Reservations can only be cancelled up to 15 minutes before the scheduled time." };
  }

  await Reservation.updateOne({ _id: id }, { status: "cancelled" });

  // Send Cancellation Notifications
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "idongcodes@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    const adminPhone = "+17743126471";

    const cancelText = `Reservation for ${reservation.name} on ${reservation.date} at ${reservation.time} has been CANCELLED.`;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      // Notify Admin
      await resend.emails.send({
        from: "Me2U Reservations <hello@fromme2u.app>",
        to: adminEmail,
        subject: `CANCELLED: Reservation - ${reservation.name}`,
        text: cancelText,
      });

      // Notify Customer
      await resend.emails.send({
        from: "Me2U <hello@fromme2u.app>",
        to: reservation.email,
        subject: "Reservation Cancelled - Me2U",
        text: `Hi ${reservation.name}, your reservation for ${reservation.date} at ${reservation.time} has been successfully cancelled. We hope to see you another time!`,
      });
    }

    if (twilioSid && twilioAuth && twilioPhone) {
      const client = twilio(twilioSid, twilioAuth);
      await client.messages.create({
        body: `CANCELLED: ${cancelText}`,
        from: twilioPhone,
        to: adminPhone,
      }).catch(err => console.error("Twilio Admin Cancel SMS Error:", err));
    }
  } catch (error) {
    console.error("Cancellation Notification Error:", error);
  }

  return { success: true };
}

export async function getReservedItemIds() {
  await dbConnect();
  // Fetch items from all active reservations (not cancelled)
  const activeReservations = await Reservation.find({ 
    status: { $in: ["pending", "confirmed"] } 
  }).select("items.id");

  const reservedIds = new Set<string>();
  activeReservations.forEach(res => {
    res.items.forEach((item: any) => {
      reservedIds.add(item.id);
    });
  });

  return Array.from(reservedIds);
}

export async function getAllReservations() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  const session = await verifySession(sessionCookie);

  if (!session) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const reservations = await Reservation.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(reservations));
}

export async function adminCancelReservation(id: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  const session = await verifySession(sessionCookie);

  if (!session) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const reservation = await Reservation.findById(id);

  if (!reservation) {
    return { success: false, error: "Reservation not found." };
  }

  if (reservation.status === "cancelled") {
    return { success: false, error: "Reservation is already cancelled." };
  }

  await Reservation.updateOne({ _id: id }, { status: "cancelled" });

  // Send Cancellation Notifications
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "idongcodes@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    const adminPhone = "+17743126471";

    const cancelText = `Reservation for ${reservation.name} on ${reservation.date} at ${reservation.time} has been CANCELLED by ADMIN.`;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      // Notify Admin
      await resend.emails.send({
        from: "Me2U Reservations <hello@fromme2u.app>",
        to: adminEmail,
        subject: `ADMIN CANCELLED: Reservation - ${reservation.name}`,
        text: cancelText,
      });

      // Notify Customer
      await resend.emails.send({
        from: "Me2U <hello@fromme2u.app>",
        to: reservation.email,
        subject: "Reservation Cancelled by Me2U",
        text: `Hi ${reservation.name}, your reservation for ${reservation.date} at ${reservation.time} has been cancelled by the shop. All reserved items are now available for others. We hope to see you another time!`,
      });
    }

    if (twilioSid && twilioAuth && twilioPhone) {
      const client = twilio(twilioSid, twilioAuth);
      await client.messages.create({
        body: `ADMIN CANCELLED: ${cancelText}`,
        from: twilioPhone,
        to: adminPhone,
      }).catch(err => console.error("Twilio Admin Cancel SMS Error:", err));
    }
  } catch (error) {
    console.error("Cancellation Notification Error:", error);
  }

  return { success: true };
}

export async function deleteReservation(id: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  const session = await verifySession(sessionCookie);

  if (!session) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const result = await Reservation.findByIdAndDelete(id);

  if (!result) {
    return { success: false, error: "Reservation not found." };
  }

  return { success: true };
}
