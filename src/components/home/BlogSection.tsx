import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Post } from '../../types';
import { formatDate } from '../../lib/utils';

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 1. Try JSON Cache first (zero cost)
        const response = await fetch('/data/posts.json');
        if (response.ok) {
          const allPosts = await response.json();
          const latestPosts = allPosts.slice(0, 3);
          
          if (latestPosts.length > 0) {
            setPosts(latestPosts);
            console.log('Latest posts loaded from JSON cache');
            return;
          }
        }
      } catch (err) {
        console.log('JSON posts not found, falling back to Firestore');
      }

      // 2. Fallback to Firestore
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(3));
        const snapshot = await getDocs(q);
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      } catch (error) {
        console.error('Error fetching posts in BlogSection:', error);
        // Fallback without orderBy
        try {
          const q = query(collection(db, 'posts'), limit(3));
          const snapshot = await getDocs(q);
          setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
        } catch (err) {
          console.error('Final fallback error in BlogSection:', err);
        }
      }
    };
    fetchPosts();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Tin tức & Sự kiện</h2>
            <p className="text-4xl font-bold text-gray-900">Chia Sẻ <span className="text-primary">Kinh Nghiệm</span></p>
          </div>
          <Link to="/tin-tuc" className="text-primary font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
            Xem tất cả bài viết <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {posts.map((post, idx) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/tin-tuc/${post.slug}`} className="block relative aspect-video overflow-hidden rounded-lg mb-6">
                <img 
                  src={post.thumbnail} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-primary" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} className="text-primary" />
                    <span>{post.author}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  <Link to={`/tin-tuc/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link to={`/tin-tuc/${post.slug}`} className="inline-block text-sm font-bold text-gray-900 border-b-2 border-primary pb-1 hover:text-primary transition-colors">
                  Đọc tiếp
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
