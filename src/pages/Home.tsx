import Hero from '@/src/components/home/Hero';
import FeaturedProducts from '@/src/components/home/FeaturedProducts';
import CategoryProductSection from '@/src/components/home/CategoryProductSection';
import PartnersSection from '@/src/components/home/PartnersSection';
import BlogSection from '@/src/components/home/BlogSection';
import { useSettings } from '../contexts/SettingsContext';

export default function Home() {
  const { settings } = useSettings();

  return (
    <main>
      <Hero />
      
      <FeaturedProducts />

      <CategoryProductSection 
        title="Quà tặng doanh nghiệp"
        categorySlug="doanh-nghiep"
        bannerImage={settings?.bannerQuangCao || "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop"}
      />

      <CategoryProductSection 
        title="Quà tặng cá nhân hoá"
        categorySlug="ca-nhan"
        bannerImage={settings?.bannerDoanhNghiep || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop"}
      />

      <CategoryProductSection 
        title="Bộ quà tặng cao cấp"
        categorySlug="cao-cap"
        bannerImage={settings?.bannerLuuNiem || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop"}
      />

      <PartnersSection />

      <BlogSection />
    </main>
  );
}
