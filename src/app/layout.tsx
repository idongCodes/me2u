import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora-base",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "From Me 2 U",
  description: "A mobile-first web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} antialiased`}>
      {/* 
        Mobile optimized wrapper: 
        On desktop, it restricts width to max-w-md and centers it like a mobile screen. 
        On mobile, it fills the width seamlessly. 
      */}
      <body className="min-h-screen bg-gray-100 flex justify-center font-lora text-foreground selection:bg-skyblue selection:text-white">
        <div className="w-full max-w-md min-h-screen bg-background shadow-xl flex flex-col relative">
          {children}
          <footer className="p-4 text-center text-xs text-black/50 mt-auto">
            &copy; {new Date().getFullYear()} From Me 2 U. All rights reserved.<br />
            Web app made by{" "}
            <a 
              href="https://www.facebook.com/idngcodes/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-skyblue hover:underline"
            >
              @idongcodes
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
