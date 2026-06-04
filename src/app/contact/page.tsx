"use client";

import { useState } from "react";
import Image from "next/image";
import { submitContactForm } from "@/app/actions/contact";

export default function ContactPage() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await submitContactForm(formData);
      
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res.success) {
        setMessage({ type: "success", text: "Your message has been sent successfully!" });
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-sm space-y-6 mt-8 mb-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative w-48 h-40 mb-2">
            <Image 
              src="/phone-hero.svg" 
              alt="Person talking on phone" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
            <p className="text-black/70">
              We'd love to hear from you.
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md text-sm font-medium border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-black/80">Name <span className="text-red-500">*</span></label>
            <input 
              required
              id="name"
              name="name"
              type="text" 
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue transition-shadow"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-black/80">Email <span className="text-red-500">*</span></label>
            <input 
              required
              id="email"
              name="email"
              type="email" 
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue transition-shadow"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium text-black/80">Phone (Optional)</label>
            <input 
              id="phone"
              name="phone"
              type="tel" 
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue transition-shadow"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="subject" className="text-sm font-medium text-black/80">Subject (Optional)</label>
            <input 
              id="subject"
              name="subject"
              type="text" 
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue transition-shadow"
              placeholder="How can we help?"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="text-sm font-medium text-black/80">Message <span className="text-red-500">*</span></label>
            <textarea 
              required
              id="message"
              name="message"
              rows={4}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue transition-shadow resize-none"
              placeholder="Your message here..."
            />
          </div>

          <button 
            type="submit" 
            disabled={pending}
            className="w-full p-3 bg-black text-white rounded-lg font-medium hover:bg-skyblue hover:text-black transition-colors active:scale-95 disabled:opacity-50 disabled:active:scale-100 mt-4 shadow-md"
          >
            {pending ? "Sending..." : "Send Message"}
          </button>
        </form>

        <div className="w-full mt-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <iframe
            title="Location Map"
            width="100%"
            height="250"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?q=200-220+May+Street,+Worcester,+MA+01602&t=&z=15&ie=UTF8&iwloc=&output=embed"
          ></iframe>
        </div>
      </div>
    </main>
  );
}
