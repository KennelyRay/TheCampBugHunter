"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BrandLink() {
  const [href, setHref] = useState("/");

  useEffect(() => {
    const readSession = () => {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("campUser");
      if (!raw) {
        setHref("/");
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        setHref(parsed?.isAdmin ? "/admin" : "/");
      } catch {
        setHref("/");
      }
    };
    readSession();
    const handler = () => readSession();
    window.addEventListener("storage", handler);
    window.addEventListener("camp-auth", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("camp-auth", handler);
    };
  }, []);

  return (
    <Link href={href} className="flex items-center gap-3">
      <Image src="/MasterCraftIcon.png" alt="MasterCraft" width={40} height={40} className="h-10 w-10 rounded-full border border-white/10 bg-black/20 p-1 object-contain" />
      <span className="sr-only">MasterCraft Bug Hunter</span>
    </Link>
  );
}
