import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Send } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.companyName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                PT
              </div>
            )}
            <span className="text-xl font-bold tracking-tight">{settings?.companyName || 'PHÚ THÀNH GOLD'}</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            {settings?.footerText || 'Chuyên cung cấp các giải pháp quà tặng doanh nghiệp cao cấp, độc đáo và ý nghĩa. Chúng tôi cam kết mang đến giá trị tốt nhất cho thương hiệu của bạn.'}
          </p>
          <div className="flex gap-4">
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
            )}
            <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
              <Send size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-primary pl-4">Liên kết nhanh</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
            <li><Link to="/san-pham" className="hover:text-white transition-colors">Sản phẩm</Link></li>
            <li><Link to="/tin-tuc" className="hover:text-white transition-colors">Tin tức</Link></li>
            <li><Link to="/lien-he" className="hover:text-white transition-colors">Liên hệ</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-primary pl-4">Danh mục</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/san-pham" className="hover:text-white transition-colors">Quà tặng doanh nghiệp</Link></li>
            <li><Link to="/san-pham" className="hover:text-white transition-colors">Quà tặng sự kiện - hội nghị</Link></li>
            <li><Link to="/san-pham" className="hover:text-white transition-colors">Quà tặng cá nhân hoá</Link></li>
            <li><Link to="/san-pham" className="hover:text-white transition-colors">Quà tặng văn phòng</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-primary pl-4">Liên hệ</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex gap-3">
              <MapPin size={18} className="text-primary shrink-0" />
              <span>{settings?.address || 'Số nhà 29, Ngách 8/11/186, Tổ 4, Đường Lê Quang Đạo, Hà Nội'}</span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="text-primary shrink-0" />
              <span>{settings?.phone || '0976 73 85 85'}</span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="text-primary shrink-0" />
              <span>{settings?.email || 'phuthanhpetros9985@gmail.com'}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} {settings?.companyName || 'CÔNG TY TNHH PHÚ THÀNH GOLD'}. All rights reserved.</p>
      </div>
    </footer>
  );
}
