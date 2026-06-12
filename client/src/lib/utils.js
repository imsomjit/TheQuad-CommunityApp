import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ShadCN utility for merging Tailwind CSS classes.
 * Intended exclusively for use within UI components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
