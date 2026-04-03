import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CategorySidebar from './CategorySidebar';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';

export default function Hero() {
  const { settings, loading } = useSettings();
  const [hotline, setHotline] = useState('0976.73.85.85');
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (settings) {
      if (settings.phone) setHotline(settings.phone);
      const slideshowImages = settings.slideshowImages?.filter(Boolean) || [];
      const newSlides = slideshowImages.length > 0 
        ? slideshowImages 
        : ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1974&auto=format&fit=crop"];
      
      // Only update if slides are different to avoid unnecessary re-renders
      if (JSON.stringify(newSlides) !== JSON.stringify(slides)) {
        setSlides(newSlides);
      }
    }
  }, [settings, slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]);

  return (
    <section className="pt-32 pb-4 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Header Bar (Mobile/Desktop) */}
        <div className="bg-primary text-white h-12 flex items-center justify-between px-4 lg:hidden mb-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
              <div className="w-5 h-0.5 bg-white"></div>
            </div>
            <span className="font-bold text-sm uppercase tracking-wider">Kho Quà Tặng</span>
          </div>
          <Search size={20} />
        </div>

        <div className="flex flex-col lg:flex-row gap-0 lg:h-[500px]">
          {/* Sidebar Area */}
          <div className="lg:w-1/4 flex flex-col border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CategorySidebar />
            
            {/* Hotline Section - Aligned with sidebar and banner */}
            <div className="mt-auto p-4 bg-gray-50 border-t border-gray-200 hidden lg:flex flex-col items-center text-center gap-3">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Hotline hỗ trợ 24/7</p>
                <p className="text-lg font-black text-primary">{hotline}</p>
              </div>
              <a 
                href={`tel:${hotline.replace(/\./g, '')}`} 
                className="w-full py-2.5 bg-primary text-white rounded-full font-bold text-xs hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={14} /> Gọi ngay
              </a>
            </div>
          </div>

          {/* Main Banner */}
          <div className="lg:w-3/4 relative overflow-hidden h-[300px] lg:h-full bg-gray-100">
            {loading || slides.length === 0 ? (
              <div className="w-full h-full animate-pulse bg-gray-200 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentSlide}
                    src={slides[currentSlide]} 
                    alt="Corporate Gifts" 
                    className="w-full h-full object-cover absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                
                {/* Dots */}
                {slides.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === currentSlide ? "bg-primary w-6" : "bg-white/50 hover:bg-white"
                        )}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
