import Link from "next/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      : "border border-neutral-300 text-black hover:bg-neutral-100 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
