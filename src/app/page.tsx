"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Home as HomeIcon, 
  Clock, 
  CalendarCheck, 
  Heart, 
  Plus, 
  ArrowRight
} from "lucide-react";
import { getApprovedTestimonials } from "@/app/actions/testimonials";
import LeaveTestimonialModal from "@/components/LeaveTestimonialModal";

export default function Home() {
  const [liveTestimonials, setLiveTestimonials] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await getApprovedTestimonials();
        setLiveTestimonials(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTestimonials();
  }, []);

  const benefits = [
    {
      icon: <ShieldCheck className="text-skyblue" size={24} />,
      title: "Safe & Simple Handshake Deals",
      description: "No tricky digital payments or scams. Meet a neighbor, inspect your find, and pay cash only when you're 100% happy."
    },
    {
      icon: <HomeIcon className="text-skyblue" size={24} />,
      title: "From One Loving Home to Another",
      description: "Every item comes from a verified smoke-free, pet-free, and professionally cleaned local home right here in Worcester."
    },
    {
      icon: <Clock className="text-skyblue" size={24} />,
      title: "First Dibs Without the Stress",
      description: "See something you love? Claim it instantly with our 'Reserve' feature. It locks the item just for you while you finalize pickup."
    },
    {
      icon: <CalendarCheck className="text-skyblue" size={24} />,
      title: "Pickup Made Easy",
      description: "One-tap calendar buttons in your confirmation email save the time and our 212 May St address directly to your phone."
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center p-6 text-center py-12 bg-white">
        <div className="flex flex-col items-center gap-6 max-w-sm">
          <div className="relative w-64 h-64 mb-4">
            <Image 
              src="/undraw_for-sale_7qjb.svg" 
              alt="For Sale Illustration" 
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter">
              Welcome to <span className="text-skyblue">Me2U</span>
            </h1>
            <p className="text-black/70 text-lg font-medium leading-tight">
              Gently used items from one home to another.
            </p>
          </div>

          <Link 
            href="/shop" 
            className="mt-4 px-10 py-4 bg-black text-white rounded-full font-black text-sm uppercase tracking-widest w-full hover:bg-skyblue hover:text-black transition-all active:scale-95 shadow-xl"
          >
            Shop FM2U
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full bg-gray-50/50 p-6 py-16 border-y border-gray-100">
        <div className="max-w-md mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Why Shop With Us?</h2>
            <p className="text-2xl font-black tracking-tight text-gray-900">Better for you, better for the neighborhood.</p>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-5 items-start">
                <div className="flex-shrink-0 p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  {benefit.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 leading-snug">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full p-6 py-16 bg-white overflow-hidden">
        <div className="max-w-md mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Neighborhood Love</h2>
              <p className="text-2xl font-black tracking-tight text-gray-900 leading-tight">What your neighbors are saying.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-skyblue bg-skyblue/5 border border-skyblue/10 px-4 py-2 rounded-full hover:bg-skyblue hover:text-black transition-all active:scale-95"
            >
              <Plus size={12} strokeWidth={3} />
              Leave Testimonial
            </button>
          </div>

          <div className="space-y-6">
            {/* Hardcoded Testimonial (Jessica S.) */}
            <div className="bg-gray-50 p-8 rounded-3xl relative border border-gray-100 shadow-sm animate-in fade-in duration-700">
              <div className="absolute -top-4 left-8 text-6xl text-skyblue opacity-20 font-serif leading-none">&ldquo;</div>
              <div className="space-y-4 relative z-10">
                <p className="text-gray-700 font-medium leading-relaxed italic text-sm">
                  &quot;I found the most beautiful crib for my son here! The process was so easy, and knowing it came from a clean, smoke-free home meant the world to me. Pickup was a breeze!&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-skyblue/10 rounded-full flex items-center justify-center text-skyblue font-black text-xs">JS</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Jessica S.</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Worcester County</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Testimonials */}
            {liveTestimonials.map((t) => (
              <div key={t._id} className="bg-white p-8 rounded-3xl relative border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                <div className="absolute -top-4 left-8 text-6xl text-skyblue opacity-20 font-serif leading-none">&ldquo;</div>
                <div className="space-y-4 relative z-10">
                  <p className="text-gray-700 font-medium leading-relaxed italic text-sm">
                    &quot;{t.content}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-black text-xs uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 text-center">
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-black hover:text-skyblue transition-colors group"
            >
              Start Browsing
              <ArrowRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full p-6 py-16 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Our Location</h2>
            <p className="text-2xl font-black tracking-tight text-gray-900 leading-tight">Serving Worcester County</p>
          </div>
          
          <div className="w-full rounded-3xl overflow-hidden border border-gray-200 shadow-lg bg-white animate-in fade-in zoom-in duration-700">
            <iframe
              title="Location Map"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=200-220+May+Street,+Worcester,+MA+01602&t=&z=15&ie=UTF8&iwloc=&output=embed"
            ></iframe>
          </div>
          
          <p className="text-center text-gray-500 text-sm font-medium leading-relaxed">
            We are locally based in Worcester, MA, providing safe and convenient pickups for all our neighbors.
          </p>
        </div>
      </section>

      <LeaveTestimonialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
}
