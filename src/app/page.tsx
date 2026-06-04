export default function Home() {
  return (
    <main className="flex-1 flex flex-col p-6 items-center justify-center text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-skyblue rounded-full flex items-center justify-center shadow-lg shadow-skyblue/30">
          <span className="text-white text-3xl font-bold">M2U</span>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            From Me 2 U
          </h1>
          <p className="text-black/70 text-lg max-w-xs mx-auto">
            A beautiful, mobile-optimized experience.
          </p>
        </div>

        <button className="mt-8 px-8 py-3 bg-black text-white rounded-full font-medium w-full max-w-xs hover:bg-skyblue hover:text-black transition-colors active:scale-95 shadow-md">
          Get Started
        </button>
      </div>
    </main>
  );
}
