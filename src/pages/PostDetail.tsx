import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Calendar, User, ChevronLeft, Share2 } from 'lucide-react';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // 1. Try JSON Cache first (zero cost)
        const response = await fetch('/data/posts.json');
        if (response.ok) {
          const allPosts = await response.json();
          const foundPost = allPosts.find((p: Post) => p.slug === slug);
          
          if (foundPost) {
            setPost(foundPost);
            setLoading(false);
            console.log('Post details loaded from JSON cache');
            return;
          }
        }
      } catch (err) {
        console.log('JSON post not found, falling back to Firestore');
      }

      // 2. Fallback to Firestore
      try {
        const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setPost({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Post);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy bài viết</div>;

  return (
    <article className="pt-32 pb-24 bg-white">
      {/* SEO Meta would go here */}
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/tin-tuc" className="inline-flex items-center gap-2 text-[#B8860B] font-bold mb-8 hover:-translate-x-2 transition-transform">
          <ChevronLeft size={20} /> Quay lại tin tức
        </Link>

        <div className="space-y-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#B8860B]" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#B8860B]" />
              <span>{post.author}</span>
            </div>
            <button className="flex items-center gap-2 hover:text-[#B8860B] transition-colors">
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-12 shadow-xl">
          <img 
            src={post.thumbnail} 
            alt={post.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-xl prose-a:text-[#B8860B]">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {post.images && post.images.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {post.images.map((img, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={img} 
                  alt={`${post.title} - ${idx + 1}`} 
                  className="w-full h-full object-cover aspect-video"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        )}

        {/* SEO Keywords display (optional for admin/debug) */}
        {post.seo?.keywords && (
          <div className="mt-16 pt-8 border-t flex flex-wrap gap-2">
            {post.seo.keywords.split(',').map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
