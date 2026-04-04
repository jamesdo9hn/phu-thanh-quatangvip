import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';

const NAV_LINKS = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Sản phẩm', href: '/san-pham' },
  { name: 'Tin tức', href: '/tin-tuc' },
  { name: 'Liên hệ', href: '/lien-he' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings, loading } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className="bg-primary text-white py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone size={14} />
              {loading ? (
                <div className="h-3 w-24 bg-white/20 animate-pulse rounded" />
              ) : (
                <span>{settings?.phone || '0976 73 85 85'}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} />
              {loading ? (
                <div className="h-3 w-32 bg-white/20 animate-pulse rounded" />
              ) : (
                <span>{settings?.email || 'phuthanhpetros9985@gmail.com'}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            {loading ? (
              <div className="h-3 w-48 bg-white/20 animate-pulse rounded" />
            ) : (
              <span>{settings?.address || 'Số nhà 29, Ngách 8/11/186, Tổ 4, Đường Lê Quang Đạo, Hà Nội'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={cn(
        "bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300 py-4",
        isScrolled ? "py-2" : "py-4"
      )}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
            ) : settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.companyName} className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                PT
              </div>
            )}
            <div className="flex flex-col">
              {loading ? (
                <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-1" />
              ) : (
                <span className="text-primary font-bold text-lg leading-tight uppercase">
                  {settings?.companyName?.split(' ').slice(-3).join(' ') || 'PHÚ THÀNH GOLD'}
                </span>
              )}
              <span className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">Corporate Gifts</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary",
                  location.pathname === link.href ? "text-primary" : "text-gray-700"
                )}
              >
                {link.name}
              </Link>
            ))}
            <button className="p-2 text-gray-700 hover:text-primary transition-colors">
              <Search size={20} />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 right-0 border-t shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-4 gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-lg font-medium text-gray-800 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
