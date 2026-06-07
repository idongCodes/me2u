import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col p-6 items-center justify-center text-center">
      <div className="flex flex-col items-center gap-6 max-w-sm">
        
        {/* Hero Illustration */}
        <div className="relative w-64 h-64 mb-4">
          <Image 
            src="/undraw_family_6gj8.svg" 
            alt="Happy Family Illustration" 
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
          className="mt-8 px-10 py-4 bg-black text-white rounded-full font-black text-sm uppercase tracking-widest w-full hover:bg-skyblue hover:text-black transition-all active:scale-95 shadow-xl"
        >
          Shop FM2U
        </Link>
      </div>
    </main>
  );
}
