import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(price).replace(/\u00A0/g, ' ');
}

export function categoryToSlug(category: string): string {
  const map: Record<string, string> = {
    'Bridal Gown': 'bridal',
    'Evening Dress': 'evening',
    'Accessory': 'accessories',
    'Fine Jewelry': 'jewelry',
  };
  return map[category] || category.toLowerCase().replace(/\s+/g, '-');
}