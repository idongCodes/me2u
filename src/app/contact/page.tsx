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
            <h1 className="text-3xl font-bold tracking-tight">Contact <span className="text-skyblue">FM2U</span></h1>
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

        <div className="flex justify-center gap-4 mt-2">
          <a 
            href="https://wa.me/message/TZ2JFH6NALZKC1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black/20 hover:text-[#25D366] transition-colors p-2"
            aria-label="Chat on WhatsApp"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.48-1.459-1.653-1.756-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
          <a 
            href="https://m.me/idngcodes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black/20 hover:text-[#0084FF] transition-colors p-2"
            aria-label="Chat on Messenger"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.243c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.11S18.627 0 12 0zm1.191 14.963-3.055-3.26-5.963 3.26 6.559-6.962 3.13 3.259 5.888-3.259-6.559 6.962z"/>
            </svg>
          </a>
        </div>

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
