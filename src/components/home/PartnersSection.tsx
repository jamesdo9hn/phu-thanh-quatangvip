import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const DEFAULT_PARTNERS = [
  { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png' },
  { name: 'Vietcombank', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Vietcombank_logo.svg/2560px-Vietcombank_logo.svg.png' },
  { name: 'Viettel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Viettel_logo_2021.svg/2560px-Viettel_logo_2021.svg.png' },
  { name: 'Vingroup', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Vingroup_logo.svg/2560px-Vingroup_logo.svg.png' },
  { name: 'FPT', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo.svg/2560px-FPT_logo.svg.png' },
  { name: 'Techcombank', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Techcombank_logo.svg/2560px-Techcombank_logo.svg.png' },
  { name: 'Vinamilk', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Vinamilk_logo.svg/2560px-Vinamilk_logo.svg.png' },
  { name: 'Petrolimex', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Petrolimex_logo.svg/2560px-Petrolimex_logo.svg.png' },
];

export default function PartnersSection() {
  const { settings } = useSettings();
  const [partners, setPartners] = useState<{name: string, logo: string}[]>(DEFAULT_PARTNERS);

  useEffect(() => {
    if (settings) {
      if (settings.partnerLogos && settings.partnerLogos.filter(Boolean).length > 0) {
        const customPartners = settings.partnerLogos
          .filter(Boolean)
          .map((logo: string, index: number) => ({
            name: `Partner ${index + 1}`,
            logo
          }));
        setPartners(customPartners);
      }
    }
  }, [settings]);

  return (
    <section className="py-12 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Đối tác tin cậy</h2>
          <p className="text-4xl font-bold text-gray-900">Đối Tác <span className="text-primary">Của Chúng Tôi</span></p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {partners.map((partner, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-32 grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
