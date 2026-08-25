export type ProductType = "sale" | "rent" | "both";
export type Category = "Bridal Gown" | "Evening Dress" | "Accessory" | "Fine Jewelry";

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  productType: ProductType;
  salePrice?: number;
  rentalPrice?: number;
  securityDeposit?: number;
  images: string[];
  category: Category;
  style: string[];
  color: string[];
  fabric?: string;
  designer?: string;
  sizes: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  glbUrl?: string;
  videoUrl?: string;
  collectionYear?: number;
  silhouette?: string;
  sortOrder?: number;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
}

export interface GownRef {
  id: string;
  name: string;
  size?: string;
  intent: 'sale' | 'rent';
}

export interface Appointment {
  id?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service_type: string;
  notes?: string;
  status?: string;
  created_at?: string;
  interested_gowns?: GownRef[] | null;
}