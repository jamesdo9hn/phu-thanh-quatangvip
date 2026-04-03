import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const CATEGORIES = [
  { name: 'QUÀ TẶNG DOANH NGHIỆP', href: '/san-pham', catId: 'doanh-nghiep' },
  { name: 'QUÀ TẶNG SỰ KIỆN - HỘI NGHỊ', href: '/san-pham', catId: 'su-kien' },
  { name: 'QUÀ TẶNG CÁ NHÂN HOÁ', href: '/san-pham', catId: 'ca-nhan' },
  { name: 'QUÀ TẶNG VĂN PHÒNG', href: '/san-pham', catId: 'van-phong' },
  { name: 'QUÀ TẶNG THƯƠNG HIỆU, TRUYỀN THÔNG', href: '/san-pham', catId: 'thuong-hieu' },
  { name: 'BỘ QUÀ TẶNG CAO CẤP', href: '/san-pham', catId: 'cao-cap' },
];

export default function CategorySidebar() {
  return (
    <div className="hidden lg:block w-full bg-white relative">
      <div className="bg-primary text-white py-2 px-4 flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </div>
        <span className="font-bold text-sm uppercase tracking-wider">Kho Quà Tặng</span>
      </div>
      <ul className="divide-y divide-gray-100">
        {CATEGORIES.map((cat) => (
          <li key={cat.name}>
            <Link 
              to={cat.href} 
              className="flex items-center justify-between px-4 py-3 text-[13px] font-bold text-gray-600 hover:text-primary hover:bg-gray-50 transition-all group"
            >
              <span>{cat.name}</span>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
