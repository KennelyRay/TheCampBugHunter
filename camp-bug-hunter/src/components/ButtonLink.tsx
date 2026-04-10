import Link from "next/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  openInNewTab?: boolean;
}

export default function ButtonLink({ href, children, variant = "primary", openInNewTab = false }: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950";
  const styles =
    variant === "primary"
      ? "bg-[#22d3ee] text-[#1f1a16] shadow-[#22d3ee]/30 hover:bg-[#06b6d4] hover:shadow-[#22d3ee]/40"
      : "border border-[#22d3ee]/60 text-[#22d3ee] hover:border-[#22d3ee] hover:bg-[#22d3ee]/10 hover:shadow-[#22d3ee]/30 dark:text-[#22d3ee]";
  return (
    <Link
      href={href}
      className={`${base} ${styles}`}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer" : undefined}
    >
      {children}
    </Link>
  );
}
