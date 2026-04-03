import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Star } from 'lucide-react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // 1. Try JSON Cache first (zero cost)
        const response = await fetch('/data/products.json');
        if (response.ok) {
          const allProducts = await response.json();
          const featured = allProducts
            .filter((p: Product) => p.featured === true)
            .slice(0, 4);
          
          if (featured.length > 0) {
            setProducts(featured);
            setLoading(false);
            console.log('Featured products loaded from JSON cache');
            return;
          }
        }
      } catch (err) {
        console.log('JSON products not found, falling back to Firestore');
      }

      // 2. Fallback to Firestore
      try {
        const q = query(
          collection(db, 'products'), 
          where('featured', '==', true), 
          limit(4)
        );
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Sản phẩm nổi bật</h2>
          <p className="text-4xl font-bold text-gray-900">Quà Tặng <span className="text-primary">Đẳng Cấp</span></p>
          <div className="w-24 h-1 bg-primary mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 hidden md:flex">
                  <Link to={`/san-pham/${product.slug}`} className="p-3 bg-white text-gray-900 rounded-full hover:bg-primary hover:text-white transition-colors">
                    <Eye size={20} />
                  </Link>
                </div>
                <div className="absolute top-2 left-2 md:top-4 md:left-4">
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary text-white text-[8px] md:text-[10px] font-bold uppercase rounded-full">
                    Nổi bật
                  </span>
                </div>
              </div>
              <div className="p-3 md:p-6 text-center">
                <h3 className="text-xs md:text-base font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2 h-8 md:h-12 flex items-center justify-center">
                  {product.name}
                </h3>
                <div className="flex justify-center mb-1 md:mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-primary font-bold text-sm md:text-lg">
                  {product.price && product.price > 0 ? `${product.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/san-pham" className="inline-block px-10 py-4 border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
}
