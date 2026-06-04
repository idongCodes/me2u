"use client";

import Link from "next/link";

export default function HeaderBrand() {
  return (
    <div className="sticky top-0 z-50 w-full h-0">
      <div className="absolute top-4 left-6">
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
