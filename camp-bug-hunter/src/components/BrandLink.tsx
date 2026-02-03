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
      <Image src="/Thecamplogo.png" alt="The Camp" width={160} height={36} className="h-7 w-auto object-contain sm:h-8" />
      <span className="sr-only">The Camp Bug Hunter</span>
    </Link>
  );
}
