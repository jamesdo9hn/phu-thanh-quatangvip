import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  ChevronRight,
  Globe,
  Upload,
  Loader2,
  MessageSquare,
  Filter,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Star,
  Users
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { cn, slugify, formatDate } from '../lib/utils';
import { toast } from 'sonner';
import { Post, Product, Category, Settings, Message } from '../types';

// --- Components ---

const ImageUpload = ({ 
  value, 
  onChange, 
  label = "Tải ảnh lên",
  aspectRatio = "aspect-video",
  size = "normal"
}: { 
  value: string; 
  onChange: (val: string) => void;
  label?: string;
  aspectRatio?: string;
  size?: "normal" | "small";
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh');
      return;
    }

    setUploading(true);
    try {
      // Compression options
      const options = {
        maxSizeMB: 0.1, // 100KB
        maxWidthOrHeight: 1200,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);
      
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onChange(base64data);
        setUploading(false);
        toast.success('Tải ảnh thành công');
      };
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xử lý ảnh');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      {label && <label className="block text-[10px] font-bold uppercase text-gray-500">{label}</label>}
      <div className={cn(
        "relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-primary",
        aspectRatio,
        size === "small" ? "p-2" : "p-4"
      )}>
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(value);
                  toast.success('Đã sao chép URL ảnh');
                }}
                className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-all"
                title="Sao chép URL"
              >
                <ImageIcon size={14} />
              </button>
              <button 
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all"
                title="Xóa ảnh"
              >
                <X size={14} />
              </button>
            </div>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-gray-100 transition-colors">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <>
                <Upload className={cn("text-gray-400 group-hover:text-primary transition-colors", size === "small" ? "w-4 h-4" : "w-8 h-8")} />
                {size !== "small" && <span className="text-[10px] font-medium text-gray-500 mt-2">Click để tải lên</span>}
              </>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        )}
      </div>
    </div>
  );
};

const AdminSidebar = ({ username, onLogout }: { username: string, onLogout: () => void }) => {
  const location = useLocation();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Đồng bộ thành công! (${data.counts.products} sản phẩm, ${data.counts.posts} bài viết)`);
      } else {
        toast.error('Lỗi đồng bộ: ' + data.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Lỗi kết nối máy chủ khi đồng bộ');
    } finally {
      setSyncing(false);
    }
  };

  const menuItems = [
    { name: 'Sản phẩm', icon: Package, href: '/admin/products' },
    { name: 'Bài viết', icon: FileText, href: '/admin/posts' },
    { name: 'Tin nhắn', icon: MessageSquare, href: '/admin/messages' },
    { name: 'Cài đặt', icon: SettingsIcon, href: '/admin/settings' },
    { name: 'Quản trị viên', icon: Users, href: '/admin/users' },
  ];

  return (
    <div className="w-64 flex-shrink-0 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold">PT</div>
          <span className="font-bold tracking-tight">Admin Panel</span>
        </div>
      </div>
      
      <nav className="flex-grow p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === item.href ? "bg-primary text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <SettingsIcon size={16} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate">{username}</span>
            <span className="text-[10px] text-gray-500 truncate">Quản trị viên</span>
          </div>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors mb-2 disabled:opacity-50"
        >
          {syncing ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
          <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ JSON'}</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

// --- Pages ---

const DashboardHome = () => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Sản phẩm', value: '24', color: 'bg-blue-500' },
        { label: 'Bài viết', value: '12', color: 'bg-green-500' },
        { label: 'Lượt truy cập', value: '1,240', color: 'bg-purple-500' },
      ].map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-2">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

const PostManager = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    thumbnail: '',
    status: 'draft',
    seo: { title: '', metaDescription: '', keywords: '' }
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts with orderBy...');
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      console.log('Snapshot empty?', snapshot.empty, 'Docs length:', snapshot.docs.length);
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
      console.log('Fetched posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts with orderBy:', error);
      // If orderBy fails (e.g. no documents or missing field), try without it
      try {
        console.log('Fetching posts without orderBy...');
        const q = query(collection(db, 'posts'));
        const snapshot = await getDocs(q);
        console.log('Fallback snapshot empty?', snapshot.empty, 'Docs length:', snapshot.docs.length);
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      } catch (fallbackError) {
        console.error('Error fetching posts in fallback:', fallbackError);
      }
    }
  };

  const handleSave = async () => {
    if (!currentPost.title || !currentPost.content) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const data = {
        ...currentPost,
        slug: currentPost.slug || slugify(currentPost.title),
        updatedAt: serverTimestamp(),
        images: currentPost.images || []
      };

      if (currentPost.id) {
        await updateDoc(doc(db, 'posts', currentPost.id), {
          ...data,
          createdAt: currentPost.createdAt || serverTimestamp()
        });
        toast.success('Cập nhật bài viết thành công');
      } else {
        await addDoc(collection(db, 'posts'), {
          ...data,
          createdAt: serverTimestamp(),
          author: auth.currentUser?.displayName || 'Admin'
        });
        toast.success('Đăng bài viết thành công');
      }
      
      // Auto-sync JSON
      fetch('/api/sync', { method: 'POST' }).catch(console.error);
      
      setIsEditing(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      await deleteDoc(doc(db, 'posts', id));
      toast.success('Đã xóa bài viết');
      // Auto-sync JSON
      fetch('/api/sync', { method: 'POST' }).catch(console.error);
      fetchPosts();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{currentPost.id ? 'Sửa bài viết' : 'Thêm bài viết mới'}</h1>
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
            <button onClick={handleSave} className="px-6 py-2 bg-[#B8860B] text-white font-bold rounded-lg flex items-center gap-2">
              <Save size={18} /> Lưu bài viết
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Tiêu đề bài viết</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B8860B]" 
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value, slug: slugify(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Đường dẫn (Slug)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50" 
                  value={currentPost.slug}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Nội dung (Markdown hỗ trợ H1-H4)</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg h-96 focus:ring-2 focus:ring-[#B8860B]" 
                  value={currentPost.content}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold border-b pb-2">Cài đặt SEO</h3>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">SEO Title</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  value={currentPost.seo?.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, seo: { ...currentPost.seo!, title: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Meta Description</label>
                <textarea 
                  className="w-full px-3 py-2 border rounded-lg text-sm h-24" 
                  value={currentPost.seo?.metaDescription}
                  onChange={(e) => setCurrentPost({ ...currentPost, seo: { ...currentPost.seo!, metaDescription: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Keywords (cách nhau bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  value={currentPost.seo?.keywords}
                  onChange={(e) => setCurrentPost({ ...currentPost, seo: { ...currentPost.seo!, keywords: e.target.value } })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border border-gray-100">
                <h3 className="font-bold text-sm border-b pb-2 text-gray-700">Ảnh đại diện (Thumbnail)</h3>
                <div className="w-40">
                  <ImageUpload 
                    label=""
                    aspectRatio="aspect-video"
                    size="small"
                    value={currentPost.thumbnail || ''} 
                    onChange={(val) => setCurrentPost({ ...currentPost, thumbnail: val })} 
                  />
                </div>
                <p className="text-[10px] text-gray-400 italic">* Ảnh này sẽ hiển thị ở danh sách tin tức.</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border border-gray-100">
                <h3 className="font-bold text-sm border-b pb-2">Ảnh trong bài viết</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(currentPost.images || []).map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button 
                        onClick={() => {
                          const newImages = [...(currentPost.images || [])];
                          newImages.splice(idx, 1);
                          setCurrentPost({ ...currentPost, images: newImages });
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square">
                    <ImageUpload 
                      label=""
                      aspectRatio="aspect-square"
                      size="small"
                      value="" 
                      onChange={(val) => setCurrentPost({ ...currentPost, images: [...(currentPost.images || []), val] })} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
        <button 
          onClick={() => {
            setCurrentPost({ title: '', slug: '', content: '', excerpt: '', thumbnail: '', status: 'draft', seo: { title: '', metaDescription: '', keywords: '' } });
            setIsEditing(true);
          }}
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:bg-primary-dark shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Viết bài mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Bài viết</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Ngày đăng</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={post.thumbnail} alt="" className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="font-bold text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-500">/{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase",
                    post.status === 'published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {post.status === 'published' ? 'Đã đăng' : 'Nháp'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setCurrentPost(post); setIsEditing(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    images: [''],
    categoryId: 'doanh-nghiep',
    featured: false,
    seo: { title: '', metaDescription: '', keywords: '' }
  });

  const CATEGORIES_LIST = [
    { id: 'doanh-nghiep', name: 'Quà tặng doanh nghiệp' },
    { id: 'ca-nhan', name: 'Quà tặng cá nhân hoá' },
    { id: 'cao-cap', name: 'Bộ quà tặng cao cấp' },
    { id: 'su-kien', name: 'Quà tặng sự kiện - hội nghị' },
    { id: 'van-phong', name: 'Quà tặng văn phòng' },
    { id: 'thuong-hieu', name: 'Quà tặng thương hiệu, truyền thông' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products with orderBy...');
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      console.log('Product snapshot empty?', snapshot.empty, 'Docs length:', snapshot.docs.length);
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
          createdAt = createdAt.toDate().toISOString();
        }
        return { 
          id: doc.id, 
          ...data,
          createdAt: createdAt || new Date().toISOString()
        } as Product;
      });
      console.log('Fetched products:', fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products with orderBy:', error);
      try {
        console.log('Fetching products without orderBy...');
        const q = query(collection(db, 'products'));
        const snapshot = await getDocs(q);
        console.log('Product fallback snapshot empty?', snapshot.empty, 'Docs length:', snapshot.docs.length);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (fallbackError) {
        console.error('Error fetching products in fallback:', fallbackError);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFeatured = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        featured: !product.featured
      });
      toast.success('Đã cập nhật trạng thái nổi bật');
      // Auto-sync JSON
      fetch('/api/sync', { method: 'POST' }).catch(console.error);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Lỗi khi cập nhật');
    }
  };

  const handleSave = async () => {
    if (!currentProduct.name || !currentProduct.categoryId) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const data = {
        ...currentProduct,
        slug: currentProduct.slug || slugify(currentProduct.name!),
        updatedAt: serverTimestamp(),
      };

      if (currentProduct.id) {
        await updateDoc(doc(db, 'products', currentProduct.id), {
          ...data,
          createdAt: currentProduct.createdAt || serverTimestamp()
        });
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.success('Thêm sản phẩm thành công');
      }
      
      // Auto-sync JSON
      fetch('/api/sync', { method: 'POST' }).catch(console.error);
      
      setIsEditing(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Đã xóa sản phẩm');
      // Auto-sync JSON
      fetch('/api/sync', { method: 'POST' }).catch(console.error);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">{currentProduct.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:bg-primary-dark shadow-lg transition-all">
              <Save size={18} /> Lưu sản phẩm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-gray-100">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Tiêu đề sản phẩm</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" 
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value, slug: slugify(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Giá (VNĐ)</label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 500000"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" 
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Danh mục</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
                    value={currentProduct.categoryId}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, categoryId: e.target.value })}
                  >
                    {CATEGORIES_LIST.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Mô tả ngắn</label>
                <textarea 
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                  className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-primary outline-none transition-all" 
                  value={currentProduct.shortDescription}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, shortDescription: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Bài viết (Mô tả chi tiết)</label>
                <textarea 
                  placeholder="Nội dung chi tiết về sản phẩm..."
                  className="w-full px-4 py-2 border rounded-lg h-64 focus:ring-2 focus:ring-primary outline-none transition-all" 
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-gray-100">
              <label className="block text-sm font-bold mb-2 text-gray-700">Ảnh bìa & Ảnh chi tiết</label>
              <div className="grid grid-cols-3 gap-3">
                {currentProduct.images?.map((img, index) => (
                  <div key={index} className="relative group aspect-square border rounded-lg overflow-hidden bg-gray-50">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded">
                      {index === 0 ? 'Bìa' : `Ảnh ${index}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...(currentProduct.images || [])];
                        newImages.splice(index, 1);
                        setCurrentProduct({ ...currentProduct, images: newImages });
                      }}
                      className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <div className="aspect-square">
                  <ImageUpload 
                    label=""
                    aspectRatio="aspect-square"
                    size="small"
                    value="" 
                    onChange={(val) => setCurrentProduct({ 
                      ...currentProduct, 
                      images: [...(currentProduct.images || []), val] 
                    })} 
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">* Ảnh đầu tiên sẽ được dùng làm ảnh bìa sản phẩm.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="featured"
                  checked={currentProduct.featured}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, featured: e.target.checked })}
                />
                <label htmlFor="featured" className="text-sm font-bold">Sản phẩm nổi bật</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <button 
          onClick={() => {
            setCurrentProduct({ name: '', slug: '', description: '', shortDescription: '', price: 0, images: [], categoryId: 'doanh-nghiep', featured: false, seo: { title: '', metaDescription: '', keywords: '' } });
            setIsEditing(true);
          }}
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:bg-primary-dark shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES_LIST.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Sản phẩm</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Danh mục</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-center">Nổi bật</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Giá</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {CATEGORIES_LIST.find(c => c.id === product.categoryId)?.name || product.categoryId}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => toggleFeatured(product)}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      product.featured ? "text-yellow-500 bg-yellow-50" : "text-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <Star size={20} fill={product.featured ? "currentColor" : "none"} className="mx-auto" />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-primary">
                  {product.price ? `${product.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setCurrentProduct(product); setIsEditing(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Không tìm thấy sản phẩm nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MessageManager = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: Message['status']) => {
    try {
      await updateDoc(doc(db, 'messages', id), { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      await deleteDoc(doc(db, 'messages', id));
      toast.success('Đã xóa tin nhắn');
      fetchMessages();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Quản lý tin nhắn liên hệ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Danh sách tin nhắn</div>
          <div className="flex-grow overflow-y-auto divide-y">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={cn(
                  "w-full text-left p-4 hover:bg-gray-50 transition-colors flex flex-col gap-1",
                  selectedMessage?.id === msg.id ? "bg-primary/5 border-l-4 border-primary" : "",
                  msg.status === 'new' ? "font-bold" : ""
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-900 truncate">{msg.name}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">{formatDate(msg.createdAt)}</span>
                </div>
                <span className="text-xs text-gray-500 truncate">{msg.subject || '(Không tiêu đề)'}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider",
                    msg.status === 'new' ? "bg-red-100 text-red-600" : 
                    msg.status === 'read' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                  )}>
                    {msg.status === 'new' ? 'Mới' : msg.status === 'read' ? 'Đã đọc' : 'Đã phản hồi'}
                  </span>
                </div>
              </button>
            ))}
            {messages.length === 0 && !loading && (
              <div className="p-10 text-center text-gray-400 text-sm">Chưa có tin nhắn nào.</div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject || 'Tin nhắn liên hệ'}</h2>
                  <p className="text-sm text-gray-500">Từ: {selectedMessage.name} ({selectedMessage.email})</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="text-sm border rounded-lg px-3 py-1 outline-none"
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage.id!, e.target.value as any)}
                  >
                    <option value="new">Mới</option>
                    <option value="read">Đã đọc</option>
                    <option value="replied">Đã phản hồi</option>
                  </select>
                  <button 
                    onClick={() => handleDelete(selectedMessage.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-grow p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Người gửi</p>
                    <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{selectedMessage.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedMessage.email || '(Không có)'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Thời gian</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Nội dung tin nhắn</p>
                  <div className="bg-gray-50 p-6 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-4">
                <a 
                  href={`mailto:${selectedMessage.email}`}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all flex items-center gap-2"
                >
                  <Mail size={18} /> Phản hồi qua Email
                </a>
                <a 
                  href={`tel:${selectedMessage.phone}`}
                  className="px-6 py-2 border-2 border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-white transition-all flex items-center gap-2"
                >
                  <Phone size={18} /> Gọi điện
                </a>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 gap-4">
              <MessageSquare size={48} className="opacity-20" />
              <p>Chọn một tin nhắn để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsManager = () => {
  const [settings, setSettings] = useState<Settings>({
    companyName: 'CÔNG TY TNHH PHÚ THÀNH GOLD',
    address: 'Số nhà 29, Ngách 8/11/186, Tổ 4, Đường Lê Quang Đạo, Phường Từ Liêm, Tp. Hà Nội',
    phone: '0976738585',
    email: 'phuthanhpetros9985@gmail.com',
    logoUrl: '',
    footerText: 'Chuyên cung cấp các giải pháp quà tặng doanh nghiệp cao cấp, độc đáo và ý nghĩa. Chúng tôi cam kết mang đến giá trị tốt nhất cho thương hiệu của bạn.',
    facebookUrl: '',
    zaloUrl: '0976738585',
    messengerUrl: 'phuthanhgold',
    slideshowImages: [],
    seoDefault: {
      title: 'Quà tặng Phú Thành Gold - Giải pháp quà tặng doanh nghiệp',
      description: 'Chuyên cung cấp quà tặng doanh nghiệp, quà tặng quảng cáo, quà tặng lưu niệm cao cấp.',
      keywords: 'quà tặng doanh nghiệp, quà tặng quảng cáo, phú thành gold'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const snapshot = await getDocs(collection(db, 'settings'));
    if (!snapshot.empty) {
      setSettings(snapshot.docs[0].data() as Settings);
    }
  };

  const handleSave = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'settings'));
      if (snapshot.empty) {
        await addDoc(collection(db, 'settings'), settings);
      } else {
        await updateDoc(doc(db, 'settings', snapshot.docs[0].id), settings as any);
      }
      toast.success('Cập nhật cài đặt thành công');
      // Auto-sync JSON
      fetch('/api/sync', { method: 'POST' }).catch(console.error);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <button 
          onClick={handleSave}
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:bg-primary-dark shadow-lg transition-all active:scale-95"
        >
          <Save size={20} /> Lưu cài đặt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Thông tin công ty</h3>
            <div>
              <label className="block text-sm font-bold mb-2">Tên công ty</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Địa chỉ</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Hotline</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Mô tả chân trang (Footer)</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-primary" 
                  value={settings.footerText}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Logo & Nhận diện</h3>
            <div className="w-1/2">
              <ImageUpload 
                label="Logo công ty"
                aspectRatio="aspect-square"
                value={settings.logoUrl || ''} 
                onChange={(val) => setSettings({ ...settings, logoUrl: val })} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Liên kết mạng xã hội (Popup)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Số điện thoại Zalo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                  value={settings.zaloUrl}
                  onChange={(e) => setSettings({ ...settings, zaloUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">ID Messenger (m.me/ID)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                  value={settings.messengerUrl}
                  onChange={(e) => setSettings({ ...settings, messengerUrl: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Facebook Page URL</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                  value={settings.facebookUrl}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Ảnh Bìa Slideshow (Trang chủ)</h3>
            <p className="text-xs text-gray-500">Tối đa 3 ảnh, tự động chuyển sau 5 giây. Nên chọn ảnh không có chữ.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((index) => (
                <ImageUpload 
                  key={index}
                  label={`Ảnh bìa ${index + 1}`}
                  aspectRatio="aspect-video"
                  value={settings.slideshowImages?.[index] || ''} 
                  onChange={(val) => {
                    const newImages = [...(settings.slideshowImages || [])];
                    newImages[index] = val;
                    setSettings({ ...settings, slideshowImages: newImages });
                  }} 
                />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Ảnh Banner Trang Chủ (Sidebar)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUpload 
                label="Banner Quà tặng doanh nghiệp"
                aspectRatio="aspect-[3/4]"
                value={settings.bannerQuangCao || ''} 
                onChange={(val) => setSettings({ ...settings, bannerQuangCao: val })} 
              />
              <ImageUpload 
                label="Banner Quà tặng cá nhân hoá"
                aspectRatio="aspect-[3/4]"
                value={settings.bannerDoanhNghiep || ''} 
                onChange={(val) => setSettings({ ...settings, bannerDoanhNghiep: val })} 
              />
              <ImageUpload 
                label="Banner Bộ quà tặng cao cấp"
                aspectRatio="aspect-[3/4]"
                value={settings.bannerLuuNiem || ''} 
                onChange={(val) => setSettings({ ...settings, bannerLuuNiem: val })} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">SEO Mặc định</h3>
            <div>
              <label className="block text-sm font-bold mb-2">Tiêu đề trang chủ</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                value={settings.seoDefault.title}
                onChange={(e) => setSettings({ ...settings, seoDefault: { ...settings.seoDefault, title: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Meta Description</label>
              <textarea 
                className="w-full px-4 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-primary" 
                value={settings.seoDefault.description}
                onChange={(e) => setSettings({ ...settings, seoDefault: { ...settings.seoDefault, description: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Keywords</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" 
                value={settings.seoDefault.keywords}
                onChange={(e) => setSettings({ ...settings, seoDefault: { ...settings.seoDefault, keywords: e.target.value } })}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Chỉnh sửa logo đối tác (Tối đa 8)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                <ImageUpload 
                  key={index}
                  label={`Đối tác ${index + 1}`}
                  aspectRatio="aspect-square"
                  size="small"
                  value={settings.partnerLogos?.[index] || ''} 
                  onChange={(val) => {
                    const newLogos = [...(settings.partnerLogos || [])];
                    newLogos[index] = val;
                    setSettings({ ...settings, partnerLogos: newLogos });
                  }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Manager Component ---

const AdminManager = () => {
  const [admins, setAdmins] = useState<{ id: string; username: string }[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'admins'));
      const adminList = snapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username
      }));
      setAdmins(adminList);
    } catch (error) {
      toast.error('Không thể tải danh sách quản trị viên');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (admins.some(a => a.username.toLowerCase() === newUsername.toLowerCase())) {
      toast.error('Tên đăng nhập này đã tồn tại');
      return;
    }

    try {
      await addDoc(collection(db, 'admins'), {
        username: newUsername.toLowerCase().trim(),
        password: newPassword,
        createdAt: serverTimestamp()
      });
      setNewUsername('');
      setNewPassword('');
      fetchAdmins();
      toast.success('Đã thêm quản trị viên mới');
    } catch (error) {
      toast.error('Không thể thêm quản trị viên');
    }
  };

  const handleDeleteAdmin = async (id: string, username: string) => {
    if (username.toLowerCase() === 'admin') {
      toast.error('Không thể xoá tài khoản admin hệ thống');
      return;
    }
    if (admins.length <= 1) {
      toast.error('Phải có ít nhất một quản trị viên');
      return;
    }

    try {
      await deleteDoc(doc(db, 'admins', id));
      fetchAdmins();
      toast.success('Đã xoá quản trị viên');
    } catch (error) {
      toast.error('Không thể xoá quản trị viên');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Quản trị viên</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4">Thêm quản trị viên mới</h3>
        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Tên đăng nhập..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Mật khẩu..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 justify-center"
          >
            <Plus size={20} /> Thêm tài khoản
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <SettingsIcon size={16} />
                    </div>
                    <span className="font-medium">{admin.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xoá"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Admin Component ---

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('adminUser');
    if (savedUser) {
      setIsLoggedIn(true);
      setAdminUsername(savedUser);
    }
    setLoading(false);
    
    // Initialize default admin if not exists
    initializeDefaultAdmin();
  }, []);

  const initializeDefaultAdmin = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'admins'));
      if (snapshot.empty) {
        await addDoc(collection(db, 'admins'), {
          username: 'admin',
          password: 'abc123@',
          createdAt: serverTimestamp()
        });
      }

      // Ensure Firebase Auth user exists for rules
      try {
        await createUserWithEmailAndPassword(auth, 'admin@phuthanh.vn', 'abc123@');
      } catch (e) {
        // Ignore if already exists
      }
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = query(
        collection(db, 'admins'), 
        where('username', '==', loginUsername.toLowerCase().trim())
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const adminData = snapshot.docs[0].data();
        if (adminData.password === loginPassword) {
          // Sign in to Firebase Auth to satisfy security rules
          try {
            const adminEmail = `${adminData.username}@phuthanh.vn`;
            await signInWithEmailAndPassword(auth, adminEmail, loginPassword);
          } catch (authError: any) {
            console.log('Firebase Auth login error, attempting to create user:', authError.code);
            // If user doesn't exist, create it
            if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
              try {
                await createUserWithEmailAndPassword(auth, `${adminData.username}@phuthanh.vn`, loginPassword);
              } catch (createError) {
                console.error('Failed to create auth user:', createError);
              }
            }
          }

          const username = adminData.username;
          setIsLoggedIn(true);
          setAdminUsername(username);
          sessionStorage.setItem('adminUser', username);
          toast.success('Đăng nhập thành công');
        } else {
          toast.error('Mật khẩu không đúng');
        }
      } else {
        toast.error('Tên đăng nhập không tồn tại');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Lỗi hệ thống khi đăng nhập');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setAdminUsername('');
      sessionStorage.removeItem('adminUser');
      toast.success('Đã đăng xuất');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center space-y-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto shadow-lg">PT</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản trị Phú Thành Gold</h1>
            <p className="text-gray-500 mt-2">Vui lòng đăng nhập bằng tài khoản quản trị</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Tên đăng nhập</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary focus:ring-0 transition-all outline-none"
                placeholder="Nhập tên đăng nhập..."
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Mật khẩu</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary focus:ring-0 transition-all outline-none"
                placeholder="Nhập mật khẩu..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all transform active:scale-95 shadow-lg shadow-primary/20"
            >
              Đăng nhập hệ thống
            </button>
          </form>
          
          <p className="text-[10px] text-gray-400">© 2026 Phú Thành Gold Admin Panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar username={adminUsername} onLogout={handleLogout} />
      <div className="flex-grow p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ProductManager />} />
          <Route path="/posts" element={<PostManager />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/messages" element={<MessageManager />} />
          <Route path="/settings" element={<SettingsManager />} />
          <Route path="/users" element={<AdminManager />} />
        </Routes>
      </div>
    </div>
  );
}
