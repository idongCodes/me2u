import type { Metadata } from "next";
import { Lora } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import HeaderBrand from "@/components/HeaderBrand";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { logout } from "@/app/actions/admin-auth";
import { CartProvider } from "@/components/CartProvider";
import { ModalProvider } from "@/components/ModalProvider";
import { ToastProvider } from "@/components/ToastProvider";

const lora = Lora({
  variable: "--font-lora-base",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FromMe2U",
  description: "A custom digital shop in Worcester, MA, showcasing and selling gently used baby and toddler clothes, strollers, cribs, and more from a smoke-free, pet-free home.",
  icons: {
    icon: "/shopping.svg",
    apple: "/shopping.svg",
  },
  openGraph: {
    title: "FromMe2U",
    description: "A custom digital shop in Worcester, MA, showcasing and selling gently used baby and toddler clothes, strollers, cribs, and more from a smoke-free, pet-free home.",
    url: "https://fromme2u.app",
    siteName: "FromMe2U",
    images: [
      {
        url: "/shopping.svg",
        width: 800,
        height: 600,
        alt: "FromMe2U Shopping",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FromMe2U",
    description: "Shop for gently used baby clothes, strollers, and more in Worcester, MA.",
    images: ["/shopping.svg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  const session = await verifySession(sessionCookie);
  const isLoggedIn = !!session;

  return (
    <html lang="en" className={`${lora.variable} antialiased`}>
      {/* 
        Mobile optimized wrapper: 
        On desktop, it restricts width to max-w-md and centers it like a mobile screen. 
        On mobile, it fills the width seamlessly. 
      */}
      <body className="min-h-screen bg-gray-100 flex justify-center font-lora text-foreground selection:bg-skyblue selection:text-white">
        <div className="w-full max-w-md min-h-screen bg-background shadow-xl flex flex-col relative">
          <CartProvider>
            <ModalProvider>
              <ToastProvider>
                <HeaderBrand isLoggedIn={isLoggedIn} />
            {children}
            <footer className="p-4 text-center text-xs text-black/50 mt-auto flex flex-col items-center gap-3">
              <div>
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
              </div>
              
              {/* Admin Login/Logout Button */}
              {isLoggedIn ? (
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-skyblue hover:text-black/50 transition-colors p-2"
                    aria-label="Admin Logout"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                  </button>
                </form>
              ) : (
                <Link
                  href="/admin"
                  className="text-black/20 hover:text-skyblue transition-colors p-2"
                  aria-label="Admin Login"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </Link>
              )}
            </footer>
          </ToastProvider>
          </ModalProvider>
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
