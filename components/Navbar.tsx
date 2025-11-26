import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

interface NavbarProps {
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogoClick }) => {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <button 
          onClick={onLogoClick} 
          className="flex items-center gap-2 focus:outline-none group"
        >
          <div className="w-8 h-8 bg-[#0a24e0] rounded-md flex items-center justify-center group-hover:bg-blue-800 transition-colors">
            <LinkIcon className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <span className="text-xl font-bold text-[#0a24e0] tracking-tight">SEO Analyser</span>
        </button>
      </div>
    </nav>
  );
};