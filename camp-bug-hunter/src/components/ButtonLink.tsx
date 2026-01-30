import Link from "next/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950";
  const styles =
    variant === "primary"
      ? "bg-[#f3a46b] text-[#1f1a16] shadow-[#f3a46b]/30 hover:bg-[#ee9960] hover:shadow-[#f3a46b]/40"
      : "border border-[#f3a46b]/60 text-[#f3a46b] hover:border-[#f3a46b] hover:bg-[#f3a46b]/10 hover:shadow-[#f3a46b]/30 dark:text-[#f3a46b]";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
