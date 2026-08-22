export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal?: number;
}

export interface PricedItem {
  intent: 'sale' | 'rent';
  salePrice?: number;
  rentalPrice?: number;
}

export function getItemUnitPrice(item: PricedItem): number {
  return item.intent === 'rent' ? (item.rentalPrice || 0) : (item.salePrice || 0);
}

export function calculateDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (coupon.minSubtotal != null && subtotal < coupon.minSubtotal) return 0;

  const raw =
    coupon.type === 'percent'
      ? (subtotal * coupon.value) / 100
      : Math.min(coupon.value, subtotal);

  return Math.max(0, Math.round(raw));
}

export function getFinalTotal(subtotal: number, coupon: Coupon | null): number {
  return Math.max(0, subtotal - calculateDiscount(subtotal, coupon));
}
