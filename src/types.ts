export interface SEO {
  title: string;
  metaDescription: string;
  keywords: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
}

export interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price?: number;
  images: string[];
  categoryId: string;
  featured: boolean;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  images?: string[];
  author: string;
  status: 'draft' | 'published';
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  footerText?: string;
  facebookUrl?: string;
  zaloUrl?: string;
  messengerUrl?: string;
  bannerQuangCao?: string;
  bannerDoanhNghiep?: string;
  bannerLuuNiem?: string;
  slideshowImages?: string[];
  partnerLogos?: string[];
  seoDefault: {
    title: string;
    description: string;
    keywords: string;
  };
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}
