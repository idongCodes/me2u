"use client";

import { useState } from "react";
import Link from "next/link";

interface HeaderBrandProps {
  isLoggedIn?: boolean;
}

export default function HeaderBrand({ isLoggedIn = false }: HeaderBrandProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100/50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link 
          href="/" 
          className="text-skyblue font-bold text-lg hover:underline drop-shadow-sm"
          onClick={() => setIsMenuOpen(false)}
        >
          From Me 2 U
        </Link>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 text-black/70 hover:text-skyblue transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Backdrop for closing menu on click outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-md flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <Link
          href="/about"
          className="px-6 py-4 border-b border-gray-100/50 text-black/80 hover:bg-gray-50 hover:text-skyblue transition-colors font-medium"
          onClick={() => setIsMenuOpen(false)}
        >
          About Us
        </Link>
        <Link
          href="/shop"
          className="px-6 py-4 border-b border-gray-100/50 text-black/80 hover:bg-gray-50 hover:text-skyblue transition-colors font-medium"
          onClick={() => setIsMenuOpen(false)}
        >
          Shop
        </Link>
        <Link
          href="/contact"
          className="px-6 py-4 border-b border-gray-100/50 text-black/80 hover:bg-gray-50 hover:text-skyblue transition-colors font-medium"
          onClick={() => setIsMenuOpen(false)}
        >
          Contact <span className="text-skyblue">FM2U</span>
        </Link>
        {isLoggedIn && (
          <Link
            href="/admin"
            className="px-6 py-4 text-skyblue/90 hover:bg-gray-50 hover:text-skyblue transition-colors font-semibold"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
