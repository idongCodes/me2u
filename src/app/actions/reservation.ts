"use server";

import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import { Resend } from "resend";
import twilio from "twilio";
import crypto from "crypto";
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { generateCalendarLinks } from "@/lib/calendar";
import { formatTo12hr } from "@/lib/time";

// Generate times from 10:00 to 17:00 in 30-min intervals
const ALL_TIMES = [
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
];

// Helper to generate the email HTML template
function getEmailTemplate(data: {
  title: string;
  name: string;
  details: string;
  itemsList: string;
  totalPrice: number;
  googleUrl: string;
  icsDataUri: string;
  manageUrl?: string;
  address?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
        .logo span { color: #00BAFF; }
        .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .status { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 24px; }
        .detail-row { margin-bottom: 16px; font-size: 14px; }
        .label { font-weight: 800; text-transform: uppercase; font-size: 10px; color: #9ca3af; letter-spacing: 1px; display: block; margin-bottom: 4px; }
        .value { font-weight: 600; }
        .items-box { background: #f9fafb; border-radius: 16px; padding: 16px; margin: 24px 0; }
        .item-chip { display: inline-block; background: #ffffff; border: 1px solid #e5e7eb; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; margin: 2px; }
        .total { font-size: 18px; font-weight: 800; color: #00BAFF; text-align: right; margin-top: 16px; }
        .button-group { margin-top: 32px; }
        .btn { display: block; text-align: center; padding: 16px; border-radius: 16px; font-weight: 800; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; transition: all 0.2s; }
        .btn-primary { background: #1a1a1a; color: #ffffff; }
        .btn-secondary { background: #f3f4f6; color: #4b5563; }
        .btn-outline { border: 2px solid #00BAFF; color: #00BAFF; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Me2<span>U</span></div>
        </div>
        
        <div class="card">
          <div class="status">Confirmed</div>
          <h1 class="title">${data.title}</h1>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Hi ${data.name}, your reservation is all set. Please remember payment is <strong>cash only</strong>.</p>
          
          <div class="detail-row">
            <span class="label">Date & Time</span>
            <span class="value">${data.details}</span>
          </div>
          
          ${data.address ? `
          <div class="detail-row">
            <span class="label">Location</span>
            <span class="value">${data.address}</span>
          </div>
          ` : ''}

          <div class="items-box">
            <span class="label">Reserved Items</span>
            <div style="margin-top: 8px;">
              ${data.itemsList.split(', ').map(item => `<span class="item-chip">${item}</span>`).join('')}
            </div>
            <div class="total">$${data.totalPrice}</div>
          </div>

          <div class="button-group">
            <a href="${data.googleUrl}" class="btn btn-outline">Add to Google Calendar</a>
            <a href="${data.icsDataUri}" class="btn btn-secondary">Add to Apple/Outlook</a>
            ${data.manageUrl ? `<a href="${data.manageUrl}" class="btn btn-primary" style="margin-top: 24px;">Edit or Cancel Reservation</a>` : ''}
          </div>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} From Me 2 U. All rights reserved.<br>
          212 May St, Worcester, MA 01602
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function getAvailableTimes(date: string, excludeId?: string) {
  await dbConnect();
  const query: any = { date, isDeleted: { $ne: true } };
  if (excludeId) query._id = { $ne: excludeId };
  const reservations = await Reservation.find(query).select("time");
  const bookedTimes = reservations.map(r => r.time);
  return ALL_TIMES.filter(t => !bookedTimes.includes(t));
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

  const existing = await Reservation.findOne({ date: data.date, time: data.time, isDeleted: { $ne: true } });
  if (existing) return { success: false, error: "This time slot is no longer available." };

  const reservation = await Reservation.create({
    ...data,
    editToken: crypto.randomUUID()
  });

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
    
    const { googleUrl, icsDataUri } = generateCalendarLinks({
      title: `Me2U Reservation: ${data.name}`,
      description: `Reservation at Me2U for ${itemsList}. Total: $${data.totalPrice} (Cash Only).`,
      location: "212 May St, Worcester, MA 01602",
      date: data.date,
      time: data.time
    });

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      // Admin Email (HTML)
      await resend.emails.send({
        from: "Me2U Reservations <hello@fromme2u.app>", 
        to: adminEmail,
        subject: `New Reservation: ${data.name} on ${data.date}`,
        html: getEmailTemplate({
          title: "New Reservation Received",
          name: "Admin",
          details: `${data.date} at ${formatTo12hr(data.time)}`,
          itemsList,
          totalPrice: data.totalPrice,
          googleUrl,
          icsDataUri,
          manageUrl,
          address: `Customer Phone: ${data.phone}`
        }),
      });

      // Customer Email (HTML)
      if (data.optIn === "email" || data.optIn === "both") {
        await resend.emails.send({
          from: "Me2U <hello@fromme2u.app>",
          to: data.email,
          subject: "Your Me2U Reservation is Confirmed!",
          html: getEmailTemplate({
            title: "Reservation Confirmed!",
            name: data.name,
            details: `${data.date} at ${formatTo12hr(data.time)}`,
            itemsList,
            totalPrice: data.totalPrice,
            googleUrl,
            icsDataUri,
            manageUrl,
            address: "212 May St, Worcester, MA 01602"
          }),
        });
      }
    }

    if (twilioSid && twilioAuth && twilioPhone) {
      const client = twilio(twilioSid, twilioAuth);
      await client.messages.create({
        body: `Me2U: New Reservation from ${data.name} for ${data.date} at ${formatTo12hr(data.time)}. Total: $${data.totalPrice}. View details in email.`,
        from: twilioPhone,
        to: adminPhone,
      }).catch(err => console.error("Twilio Admin SMS Error:", err));
    }

  } catch (error) {
    console.error("Notification Error:", error);
  }

  return { success: true, reservationId: reservation._id.toString() };
}

export async function getReservationForEdit(id: string, token: string) {
  await dbConnect();
  const reservation = await Reservation.findOne({ _id: id, editToken: token, isDeleted: { $ne: true } });
  if (!reservation) return { success: false, error: "Reservation not found." };
  return { success: true, reservation: JSON.parse(JSON.stringify(reservation)) };
}

export async function updateReservation(id: string, token: string, data: {
  date: string;
  time: string;
  items: Array<{ id: string; name: string; price: number }>;
  totalPrice: number;
}) {
  await dbConnect();
  const reservation = await Reservation.findOne({ _id: id, editToken: token, isDeleted: { $ne: true } });
  if (!reservation) return { success: false, error: "Reservation not found." };

  const now = new Date();
  const diff = (now.getTime() - reservation.createdAt.getTime()) / 1000 / 60;
  if (diff > 15) return { success: false, error: "The 15-minute window has passed." };
  if (reservation.editCount >= 2) return { success: false, error: "Max edits reached." };

  const existing = await Reservation.findOne({ date: data.date, time: data.time, _id: { $ne: id }, isDeleted: { $ne: true } });
  if (existing) return { success: false, error: "Time slot taken." };

  await Reservation.updateOne({ _id: id }, { ...data, status: "pending", $inc: { editCount: 1 } });
  return { success: true };
}

export async function cancelReservation(id: string, token: string) {
  await dbConnect();
  const reservation = await Reservation.findOne({ _id: id, editToken: token, isDeleted: { $ne: true } });
  if (!reservation) return { success: false, error: "Reservation not found." };

  const [year, month, day] = reservation.date.split("-").map(Number);
  const [hour, minute] = reservation.time.split(":").map(Number);
  const bookedDateTime = new Date(year, month - 1, day, hour, minute).getTime();
  const now = new Date().getTime();
  if ((bookedDateTime - now) / 1000 / 60 < 15) return { success: false, error: "Too late to cancel." };

  await Reservation.updateOne({ _id: id }, { status: "cancelled" });

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "idongcodes@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const subject = `CANCELLED: Reservation - ${reservation.name}`;
      const text = `Reservation for ${reservation.name} on ${reservation.date} at ${formatTo12hr(reservation.time)} has been CANCELLED.`;
      await resend.emails.send({ from: "Me2U <hello@fromme2u.app>", to: adminEmail, subject, text });
      await resend.emails.send({ from: "Me2U <hello@fromme2u.app>", to: reservation.email, subject, text: `Hi ${reservation.name}, your reservation has been cancelled.` });
    }
  } catch (err) { console.error(err); }

  return { success: true };
}

export async function getReservedItemIds() {
  await dbConnect();
  const activeReservations = await Reservation.find({ status: { $in: ["pending", "confirmed"] }, isDeleted: { $ne: true } }).select("items.id");
  const reservedIds = new Set<string>();
  activeReservations.forEach(res => res.items.forEach((item: any) => reservedIds.add(item.id)));
  return Array.from(reservedIds);
}

export async function getAllReservations() {
  await dbConnect();
  const reservations = await Reservation.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(reservations));
}

export async function adminCancelReservation(id: string) {
  await dbConnect();
  await Reservation.updateOne({ _id: id }, { status: "cancelled" });
  return { success: true };
}

export async function deleteReservation(id: string) {
  await dbConnect();
  await Reservation.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
  return { success: true };
}

export async function restoreReservation(id: string) {
  await dbConnect();
  await Reservation.findByIdAndUpdate(id, { isDeleted: false, $unset: { deletedAt: 1 } });
  return { success: true };
}

export async function adminBulkCancelReservations(ids: string[]) {
  for (const id of ids) await adminCancelReservation(id);
  return { success: true };
}

export async function adminBulkDeleteReservations(ids: string[]) {
  await dbConnect();
  await Reservation.updateMany({ _id: { $in: ids } }, { isDeleted: true, deletedAt: new Date() });
  return { success: true };
}

export async function bulkRestoreReservations(ids: string[]) {
  await dbConnect();
  await Reservation.updateMany({ _id: { $in: ids } }, { isDeleted: false, $unset: { deletedAt: 1 } });
  return { success: true };
}
