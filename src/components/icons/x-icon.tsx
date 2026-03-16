import { cn } from "@/lib/utils";

export function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("size-4", className)}
    >
      <path
        fill="currentColor"
        d="M14.11 10.95 21.64 2h-1.78l-6.54 7.77L8.1 2H2.09l7.9 11.5L2.09 22h1.78l6.91-8.22L16.42 22h6.01l-8.32-11.05ZM11.7 13.82l-.8-1.14L4.54 3.57h2.73l5.14 7.34.8 1.14 6.67 9.52h-2.73l-5.45-7.75Z"
      />
    </svg>
  );
}
