"use server";

import { Resend } from "resend";
import { ContactFormEmail } from "@/emails/ContactFormEmail";
import connectToDatabase from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "Name, Email, and Message are required fields." };
  }

  try {
    // Save to database
    await connectToDatabase();
    await ContactMessage.create({
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      subject: subject || "No Subject",
      body: message,
    });

    const { error } = await resend.emails.send({
      from: "From Me 2 U App <hello@fromme2u.app>",
      to: ["i.d.essien@gmail.com"], // Fixed typo in gmail
      subject: subject ? `New Contact Submission: ${subject}` : "New Contact Submission",
      react: ContactFormEmail({ name, email, phone, subject, message }),
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to send email." };
  }
}
