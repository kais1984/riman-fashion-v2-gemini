export type ProductType = "sale" | "rent" | "both";
export type Category = "Bridal Gown" | "Evening Dress" | "Accessory" | "Fine Jewelry";

export interface Product {
  id: string;
  name: string;
  description: string;
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
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
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
}