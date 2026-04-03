import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Phone, Globe, ChevronRight, Loader2 } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

interface CategoryProductSectionProps {
  title: string;
  bannerImage: string;
  categorySlug: string;
}

export default function CategoryProductSection({ title, bannerImage, categorySlug }: CategoryProductSectionProps) {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Try JSON Cache first (zero cost)
        const response = await fetch('/data/products.json');
        if (response.ok) {
          const allProducts = await response.json();
          const filtered = allProducts
            .filter((p: Product) => p.categoryId === categorySlug)
            .slice(0, 6);
          
          if (filtered.length > 0) {
            setProducts(filtered);
            setLoading(false);
            console.log(`Products for ${categorySlug} loaded from JSON cache`);
            return;
          }
        }
      } catch (err) {
        console.log('JSON products not found, falling back to Firestore');
      }

      // 2. Fallback to Firestore
      try {
        // Fetch products for this category
        const q = query(
          collection(db, 'products'),
          where('categoryId', '==', categorySlug),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const productSnapshot = await getDocs(q);
        const fetchedProducts = productSnapshot.docs.map(doc => {
          const data = doc.data();
          let createdAt = data.createdAt;
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdAt = createdAt.toDate().toISOString();
          }
          return { id: doc.id, ...data, createdAt } as Product;
        });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching category products:', error);
        // Fallback if index is missing or other error
        try {
          const qFallback = query(
            collection(db, 'products'),
            where('categoryId', '==', categorySlug),
            limit(6)
          );
          const fallbackSnapshot = await getDocs(qFallback);
          setProducts(fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        } catch (err) {
          console.error('Fallback fetch failed:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Banner Sidebar */}
          <div className="lg:w-1/4 flex flex-col">
            <div className="bg-primary text-white py-4 px-6 text-center font-bold uppercase tracking-wider text-sm">
              {title}
            </div>
            <div className="relative flex-grow group overflow-hidden">
              <img 
                src={bannerImage} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary">
                    <ChevronRight size={24} />
                  </div>
                  <span className="font-bold uppercase text-sm">Liên hệ ngay</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    <span className="font-bold text-lg">{settings?.phone || '0976.73.8585'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    <span className="text-sm opacity-80">phuthanhgold.vn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="relative aspect-square mb-4 overflow-hidden">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link to={`/san-pham/${product.slug}`} className="p-2 bg-white text-gray-900 rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 text-center mb-2 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold text-center">
                    {product.price && product.price > 0 ? `${product.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Link 
                to={`/san-pham?cat=${categorySlug}`}
                className="text-sm font-bold text-gray-600 hover:text-primary transition-colors flex items-center gap-2 group"
              >
                Xem thêm {title} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
