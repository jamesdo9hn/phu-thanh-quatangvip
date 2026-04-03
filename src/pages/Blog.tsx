import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { formatDate } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronRight, ChevronLeft } from 'lucide-react';

const POSTS_PER_PAGE = 10;

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const coll = collection(db, 'posts');
        const snapshot = await getCountFromServer(coll);
        setTotalPosts(snapshot.data().count);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'posts');
      }
    };
    fetchTotalCount();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // 1. Try JSON Cache first (zero cost)
        const response = await fetch('/data/posts.json');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
          setLoading(false);
          console.log('Posts loaded from JSON cache');
          return;
        }
      } catch (err) {
        console.log('JSON posts not found, falling back to Firestore');
      }

      // 2. Fallback to Firestore
      try {
        let q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(POSTS_PER_PAGE)
        );

        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map(doc => {
          const data = doc.data();
          let createdAt = data.createdAt;
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdAt = createdAt.toDate().toISOString();
          }
          return {
            id: doc.id,
            ...data,
            createdAt: createdAt || new Date().toISOString()
          } as Post;
        });
        
        setPosts(fetchedPosts);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } catch (error) {
        console.error('Error fetching posts in Blog page:', error);
        // Fallback without orderBy
        try {
          const q = query(collection(db, 'posts'), limit(POSTS_PER_PAGE));
          const snapshot = await getDocs(q);
          const fetchedPosts = snapshot.docs.map(doc => {
            const data = doc.data();
            let createdAt = data.createdAt;
            if (createdAt && typeof createdAt.toDate === 'function') {
              createdAt = createdAt.toDate().toISOString();
            }
            return {
              id: doc.id,
              ...data,
              createdAt: createdAt || new Date().toISOString()
            } as Post;
          });
          setPosts(fetchedPosts);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'posts');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, [currentPage]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (loading && posts.length === 0) {
    return <div className="pt-32 pb-20 text-center">Đang tải tin tức...</div>;
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-900 py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tin tức & Sự kiện</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Cập nhật những xu hướng quà tặng mới nhất, các dự án tiêu biểu và tin tức từ Phú Thành Gold.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            {posts.map((post, index) => {
              const date = new Date(post.createdAt || Date.now());
              const isValid = !isNaN(date.getTime());
              const day = isValid ? date.getDate() : '--';
              const month = isValid ? date.toLocaleString('en-US', { month: 'short' }) : '---';

              return (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col md:flex-row group"
                >
                  {/* Left: Thumbnail with Date */}
                  <Link to={`/tin-tuc/${post.slug}`} className="md:w-1/3 relative overflow-hidden shrink-0">
                    <img 
                      src={post.thumbnail} 
                      alt={post.title} 
                      className="w-full h-full object-cover aspect-[4/3] md:aspect-auto group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-center w-14 h-14 flex flex-col justify-center rounded-lg shadow-lg">
                      <span className="text-xl font-bold leading-none">{day}</span>
                      <span className="text-xs uppercase font-medium">{month}</span>
                    </div>
                  </Link>

                  {/* Right: Content */}
                  <div className="p-6 md:p-8 flex flex-col justify-center flex-grow">
                    <Link to={`/tin-tuc/${post.slug}`}>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-primary" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-primary" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <Link 
                        to={`/tin-tuc/${post.slug}`}
                        className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Xem thêm <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {posts.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-gray-500">Chưa có bài viết nào được đăng.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-12">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-all",
                      currentPage === i + 1 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
