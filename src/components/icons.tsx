import type { LucideProps } from 'lucide-react';

export const Icons = {
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 7L6 4" />
      <circle cx="5.5" cy="3" r="1" fill="currentColor" />
      <path d="M17 7L18 4" />
      <circle cx="18.5" cy="3" r="1" fill="currentColor" />
      <rect x="2" y="7" width="20" height="12" rx="3" />
      <path d="M9 11L15 14L9 17V11Z" />
      <path d="M7 19V21" />
      <path d="M17 19V21" />
    </svg>
  ),
};
