"use server";

import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import { Resend } from "resend";
import twilio from "twilio";
import crypto from "crypto";

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
    const customerNotificationText = `Hi ${data.name}, your reservation at Me2U for ${data.date} at ${data.time} is confirmed! Total: $${data.totalPrice} (Cash Only). We look forward to seeing you.\n\nYou can edit or cancel your reservation within 15 minutes here: ${manageUrl}`;

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

  // Check 15 min window
  const now = new Date();
  const diff = (now.getTime() - reservation.createdAt.getTime()) / 1000 / 60;
  if (diff > 15) {
    return { success: false, error: "The 15-minute window for editing this reservation has passed." };
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

  // Validate time availability (excluding current reservation)
  const existing = await Reservation.findOne({ 
    date: data.date, 
    time: data.time,
    _id: { $ne: id } 
  });
  if (existing) {
    return { success: false, error: "This time slot is no longer available. Please select another time." };
  }

  await Reservation.updateOne({ _id: id }, { ...data, status: "pending" });

  // Optional: Send update notifications here if desired

  return { success: true };
}

export async function cancelReservation(id: string, token: string) {
  await dbConnect();
  const reservation = await Reservation.findOne({ _id: id, editToken: token });

  if (!reservation) {
    return { success: false, error: "Reservation not found or invalid token." };
  }

  // Check 15 min window
  const now = new Date();
  const diff = (now.getTime() - reservation.createdAt.getTime()) / 1000 / 60;
  if (diff > 15) {
    return { success: false, error: "The 15-minute window for cancelling this reservation has passed." };
  }

  await Reservation.updateOne({ _id: id }, { status: "cancelled" });

  return { success: true };
}
