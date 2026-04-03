import { Link } from 'react-router-dom';

const PRICE_RANGES = [
  { label: 'QUÀ TẶNG DƯỚI 100K', href: '/san-pham?price=0-100000' },
  { label: 'QUÀ TẶNG TỪ 100K - 200K', href: '/san-pham?price=100000-200000' },
  { label: 'QUÀ TẶNG TỪ 200K - 300K', href: '/san-pham?price=200000-300000' },
  { label: 'QUÀ TẶNG TỪ 300K - 500K', href: '/san-pham?price=300000-500000' },
  { label: 'QUÀ TẶNG TỪ 500K - 800K', href: '/san-pham?price=500000-800000' },
  { label: 'QUÀ TẶNG TỪ 800K - 1200K', href: '/san-pham?price=800000-1200000' },
];

export default function PriceRangeGrid() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRICE_RANGES.map((range) => (
            <Link
              key={range.label}
              to={range.href}
              className="bg-primary text-white py-4 px-6 text-center font-bold text-sm hover:bg-primary-dark transition-colors shadow-md"
            >
              {range.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
