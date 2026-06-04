"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeaderBrand() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const hideText = () => {
      setIsVisible(false);
    };

    const handleScroll = () => {
      setIsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(hideText, 2000);
    };

    // Initial timeout to hide after mounting
    timeout = setTimeout(hideText, 2000);

    // Listen to window scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full h-0">
      <div 
        className={`absolute top-4 left-6 transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link 
          href="/" 
          className="text-skyblue font-bold text-lg hover:underline drop-shadow-sm"
        >
          From Me 2 U
        </Link>
      </div>
    </div>
  );
}
