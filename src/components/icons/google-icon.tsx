import { cn } from "@/lib/utils";

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("size-4", className)}
    >
      <path
        fill="currentColor"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61v2.99h3.86c2.26-2.08 3.58-5.15 3.58-8.84Z"
      />
      <path
        fill="currentColor"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.89l-3.86-2.99c-1.07.72-2.45 1.14-4.09 1.14-3.14 0-5.8-2.12-6.75-4.98H1.27v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="currentColor"
        d="M5.25 14.28A7.2 7.2 0 0 1 4.87 12c0-.79.14-1.56.38-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.93.46 3.75 1.27 5.37l3.98-3.09Z"
      />
      <path
        fill="currentColor"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.2 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.63l3.98 3.09C6.2 6.89 8.86 4.77 12 4.77Z"
      />
    </svg>
  );
}
