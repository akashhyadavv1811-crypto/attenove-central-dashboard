import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns true if the given date string (YYYY-MM-DD) is at least 18 years ago. */
export function isDobAtLeast18(dateString: string): boolean {
  const s = dateString.trim();
  if (!s) return true;
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  const eighteenth = new Date(date);
  eighteenth.setFullYear(eighteenth.getFullYear() + 18);
  return eighteenth <= today;
}

/** Returns an error message if DOB is invalid or under 18; otherwise undefined. */
export function getDobValidationError(dateString: string): string | undefined {
  const s = dateString.trim();
  if (!s) return undefined;
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return "Please enter a valid date.";
  if (!isDobAtLeast18(s)) return "Must be 18 years or older.";
  return undefined;
}
