"use server";

import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import { Resend } from "resend";
import twilio from "twilio";

// Generate times from 10:00 to 17:00 in 30-min intervals
// 15 min block + 15 min buffer = 30 min spacing
const ALL_TIMES = [
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
];

export async function getAvailableTimes(date: string) {
  await dbConnect();
  
  // Find all reservations for this date
  const reservations = await Reservation.find({ date }).select("time");
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

  const reservation = await Reservation.create(data);

  // Send Notifications asynchronously
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "idongcodes@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    const adminPhone = "+17743126471";

    const itemsList = data.items.map(i => `${i.name} ($${i.price})`).join(", ");
    
    // --- NOTIFY ADMIN ---
    const adminNotificationText = `New Reservation from ${data.name} (${data.phone}, ${data.email}) for ${data.date} at ${data.time}.\nItems: ${itemsList}\nTotal: $${data.totalPrice}`;

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
    const customerNotificationText = `Hi ${data.name}, your reservation at Me2U for ${data.date} at ${data.time} is confirmed! Total: $${data.totalPrice} (Cash Only). We look forward to seeing you.`;

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
