import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('cat') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const CATEGORIES = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'doanh-nghiep', name: 'Quà tặng doanh nghiệp' },
    { id: 'ca-nhan', name: 'Quà tặng cá nhân hoá' },
    { id: 'cao-cap', name: 'Bộ quà tặng cao cấp' },
    { id: 'su-kien', name: 'Quà tặng sự kiện - hội nghị' },
    { id: 'van-phong', name: 'Quà tặng văn phòng' },
    { id: 'thuong-hieu', name: 'Quà tặng thương hiệu, truyền thông' },
  ];

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    if (catId === 'all') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', catId);
    }
    setSearchParams(searchParams);
    setSelectedCategory(catId);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // 1. Try JSON Cache first (zero cost)
        const response = await fetch('/data/products.json');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setLoading(false);
          console.log('Products loaded from JSON cache');
          return;
        }
      } catch (err) {
        console.log('JSON products not found, falling back to Firestore');
      }

      // 2. Fallback to Firestore
      try {
        const q = query(
          collection(db, 'products'), 
          orderBy('createdAt', 'desc'),
          limit(100) // Limit initial fetch to 100 products to save quota
        );
        const snapshot = await getDocs(q);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        console.error('Error fetching products in Products page:', error);
        // Final fallback without orderBy
        try {
          const q = query(collection(db, 'products'), limit(100));
          const snapshot = await getDocs(q);
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        } catch (err) {
          console.error('Final fallback error:', err);
          if (err instanceof Error && err.message.includes('Quota exceeded')) {
             toast.error('Hệ thống đang quá tải (Quota exceeded). Vui lòng quay lại sau.');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  return (
    <main className="pt-32 pb-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-32">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Filter size={20} className="text-primary" />
                Danh mục
              </h2>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-all flex justify-between items-center group",
                      selectedCategory === cat.id 
                        ? "bg-primary text-white font-bold shadow-md" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                    )}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight size={16} className={cn(
                      "transition-transform",
                      selectedCategory === cat.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                    )} />
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Tìm kiếm</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Tên sản phẩm..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </h1>
                <p className="text-gray-500">
                  {filteredProducts.length} sản phẩm được tìm thấy
                </p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentProducts.length > 0 ? currentProducts.map((product, idx) => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <Link to={`/san-pham/${product.slug}`} className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold hover:bg-primary hover:text-white transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300">
                            Xem chi tiết
                          </Link>
                        </div>
                        {product.featured && (
                          <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            Nổi bật
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                          {CATEGORIES.find(c => c.id === product.categoryId)?.name}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-primary font-bold text-lg">
                            {product.price ? `${product.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Không tìm thấy sản phẩm</h3>
                      <p className="text-gray-500">Thử thay đổi danh mục hoặc từ khóa tìm kiếm</p>
                      <button 
                        onClick={() => { handleCategoryChange('all'); setSearchQuery(''); }}
                        className="mt-6 text-primary font-bold hover:underline"
                      >
                        Xem tất cả sản phẩm
                      </button>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors font-medium text-gray-700"
                    >
                      Trang trước
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all",
                            currentPage === page 
                              ? "bg-primary text-white shadow-md" 
                              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors font-medium text-gray-700"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
