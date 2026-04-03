import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Phone, MessageCircle, Share2, ZoomIn, Mail, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { useSettings } from '../contexts/SettingsContext';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { settings } = useSettings();

  const CATEGORIES = [
    { id: 'doanh-nghiep', name: 'Quà tặng doanh nghiệp' },
    { id: 'su-kien', name: 'Quà tặng sự kiện - hội nghị' },
    { id: 'ca-nhan', name: 'Quà tặng cá nhân hoá' },
    { id: 'van-phong', name: 'Quà tặng văn phòng' },
    { id: 'thuong-hieu', name: 'Quà tặng thương hiệu, truyền thông' },
    { id: 'cao-cap', name: 'Bộ quà tặng cao cấp' },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      
      try {
        // 1. Try JSON Cache first (zero cost)
        const response = await fetch('/data/products.json');
        if (response.ok) {
          const allProducts = await response.json();
          const foundProduct = allProducts.find((p: Product) => p.slug === slug);
          
          if (foundProduct) {
            setProduct(foundProduct);
            // Get related products from cache too
            const related = allProducts
              .filter((p: Product) => p.categoryId === foundProduct.categoryId && p.id !== foundProduct.id)
              .slice(0, 4);
            setRelatedProducts(related);
            setLoading(false);
            console.log('Product details loaded from JSON cache');
            return;
          }
        }
      } catch (err) {
        console.log('JSON product not found, falling back to Firestore');
      }

      // 2. Fallback to Firestore
      try {
        const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const productData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
          setProduct(productData);
          
          // Fetch related products
          const relatedQ = query(
            collection(db, 'products'), 
            where('categoryId', '==', productData.categoryId),
            limit(5)
          );
          const relatedSnapshot = await getDocs(relatedQ);
          setRelatedProducts(
            relatedSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Product))
              .filter(p => p.id !== productData.id)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
        <Link to="/san-pham" className="text-primary font-bold hover:underline">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/san-pham" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={24} className="text-gray-900" />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={24} className="text-gray-900" />
                  </button>
                </>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      activeImage === idx ? "border-primary shadow-md" : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="text-primary font-bold uppercase tracking-widest text-sm mb-2">
                {CATEGORIES.find(c => c.id === product.categoryId)?.name || product.categoryId}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold text-primary">
                  {product.price ? `${product.price.toLocaleString('vi-VN')} đ` : 'Liên hệ báo giá'}
                </div>
                {product.featured && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Sản phẩm nổi bật
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                Phú Thành Gold cam kết mang đến những món quà tặng tinh tế, sang trọng và ý nghĩa nhất cho doanh nghiệp và cá nhân.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <a 
                href={`tel:${settings?.phone || '0976738585'}`} 
                className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                <Phone size={20} />
                Gọi ngay
              </a>
              <a 
                href={`https://zalo.me/${settings?.zaloUrl || settings?.phone || '0976738585'}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                <MessageCircle size={20} />
                Chat Zalo
              </a>
            </div>

            <div className="border-t border-gray-100 pt-8 space-y-6">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Share2 size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Giao hàng toàn quốc</p>
                  <p>Hỗ trợ vận chuyển nhanh chóng, an toàn</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <ZoomIn size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Kiểm tra hàng</p>
                  <p>Được kiểm tra sản phẩm trước khi thanh toán</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Content */}
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-gray-100 mb-12">
            <div className="inline-block border-b-2 border-primary pb-4 text-xl font-bold text-gray-900">
              Chi tiết sản phẩm
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-img:rounded-2xl prose-a:text-primary">
            <Markdown>{product.description}</Markdown>
          </div>

          {/* Additional Images from Description if any */}
          <div className="mt-12 grid grid-cols-1 gap-8">
            {product.images.slice(1).map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${product.name} detail ${idx + 1}`} 
                className="w-full rounded-2xl shadow-sm"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Sản phẩm liên quan</h2>
              <Link to="/san-pham" className="text-primary font-bold hover:underline">
                Xem tất cả
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link 
                  key={p.id} 
                  to={`/san-pham/${p.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-primary font-bold">
                      {p.price ? `${p.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
