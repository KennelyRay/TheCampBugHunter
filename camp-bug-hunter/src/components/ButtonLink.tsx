import Link from "next/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950";
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
