import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col p-6 items-center justify-center text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-40 mb-2">
          <Image 
            src="/shopping.svg" 
            alt="Web shopping illustration" 
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          About <span className="text-skyblue">FM2U</span>
        </h1>
        <div className="text-black/80 text-base max-w-2xl space-y-4 text-left leading-relaxed">
          <p>
            Welcome to From Me 2 U. What started as my good friend and his wife, a fairly new mom of two, asking me to help sell off a plethora of items that were bought for and gifted or donated to her - has turned into an exciting idea to build a custom digital shop to showcase and sell off all the unused, barely used, and no longer used: baby and toddler clothes, shoes, strollers, onesies, cribs, etc., and more from around the home.
          </p>
          <p>
            A wonderful smoke free, pet free, and regularly, professionally cleaned home at that. Conveniently and locally, located in The Outher of Worcester, between Webster Sq and Tatnuck Sq - you will not find overused, tattered, broken items here and we are dedicated to providing a beautiful and seamless experience.
          </p>
          <p>
            So shop around, come by and grab things while they're still hot!
          </p>
          <div className="pt-4 flex justify-center">
            <p className="text-xs text-black/50 text-center italic max-w-sm">
              This is a cash only shopping experience in an effort to deter scammers!
            </p>
          </div>
        </div>

        <Link 
          href="/shop" 
          className="mt-6 px-8 py-3 bg-black text-white rounded-full font-medium w-full max-w-xs hover:bg-skyblue hover:text-black transition-colors active:scale-95 shadow-md text-center"
        >
          Shop <span className="text-skyblue">FM2U</span>
        </Link>
      </div>
    </main>
  );
}