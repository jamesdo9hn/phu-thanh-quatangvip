import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FloatingContact from './components/common/FloatingContact';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import PostDetail from './pages/PostDetail';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import { cn } from './lib/utils';
import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!isAdminRoute && <Header />}
      <div className={cn("flex-grow", !isAdminRoute && "pt-0")}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/san-pham" element={<Products />} />
          <Route path="/san-pham/:slug" element={<ProductDetail />} />
          <Route path="/tin-tuc" element={<Blog />} />
          <Route path="/tin-tuc/:slug" element={<PostDetail />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingContact />}
      <Toaster position="top-right" richColors />
    </div>
  );
}
