import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Home as HomeIcon, Clock, CalendarCheck } from "lucide-react";

export default function Home() {
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

          <div className="pt-8">
            <Link 
              href="/shop" 
              className="group flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-black hover:text-skyblue transition-colors"
            >
              Start Browsing
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
