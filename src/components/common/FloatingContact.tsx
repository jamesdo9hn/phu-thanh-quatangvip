import { Phone, MessageCircle, Facebook, Mail } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export default function FloatingContact() {
  const { settings: contextSettings } = useSettings();
  
  const settings = {
    phone: contextSettings?.phone || '0976738585',
    zaloUrl: contextSettings?.zaloUrl || '0976738585',
    messengerUrl: contextSettings?.messengerUrl || 'phuthanhgold',
    email: contextSettings?.email || 'phuthanhpetros9985@gmail.com'
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Zalo */}
      <a
        href={`https://zalo.me/${settings.zaloUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 group"
      >
        <span className="bg-white px-3 py-1 rounded-lg shadow-md text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Zalo
        </span>
        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <MessageCircle size={24} />
        </div>
      </a>

      {/* Messenger */}
      <a
        href={`https://m.me/${settings.messengerUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 group"
      >
        <span className="bg-white px-3 py-1 rounded-lg shadow-md text-sm font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Messenger
        </span>
        <div className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <Facebook size={24} />
        </div>
      </a>

      {/* Email */}
      <a
        href={`mailto:${settings.email}`}
        className="flex items-center gap-3 group"
      >
        <span className="bg-white px-3 py-1 rounded-lg shadow-md text-sm font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Email
        </span>
        <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <Mail size={24} />
        </div>
      </a>

      {/* Hotline */}
      <a
        href={`tel:${settings.phone}`}
        className="flex items-center gap-3 group"
      >
        <span className="bg-white px-3 py-1 rounded-lg shadow-md text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Hotline
        </span>
        <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-bounce">
          <Phone size={24} />
        </div>
      </a>
    </div>
  );
}
