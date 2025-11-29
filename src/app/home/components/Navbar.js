'use client';

import { useState } from 'react';
import Link from 'next/link';
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (

    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="text-2xl font-bold font-serif text-gray-900" data-testid="text-logo">
            Stitch3D
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md transition-colors" data-testid="link-home">
              Home
            </a>
            <a href="#gallery" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md transition-colors" data-testid="link-gallery">
              Gallery
            </a>
            <a href="#customize" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md transition-colors" data-testid="link-customize">
              Customize
            </a>
            <a href="#about" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md transition-colors" data-testid="link-about">
              About
            </a>
            <a href="#contact" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md transition-colors" data-testid="link-contact">
              Contact
            </a>
          </div>

          <div className="hidden md:block">
    <Link href="/signup">
        <button className="px-6 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors" data-testid="button-start-designing">
            Sign Up
        </button>
    </Link>
</div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
            <a href="#home" className="block px-4 py-2 hover:bg-gray-100 rounded-md" data-testid="link-mobile-home">
              Home
            </a>
            <a href="#gallery" className="block px-4 py-2 hover:bg-gray-100 rounded-md" data-testid="link-mobile-gallery">
              Gallery
            </a>
            <a href="#customize" className="block px-4 py-2 hover:bg-gray-100 rounded-md" data-testid="link-mobile-customize">
              Customize
            </a>
            <a href="#about" className="block px-4 py-2 hover:bg-gray-100 rounded-md" data-testid="link-mobile-about">
              About
            </a>
            <a href="#contact" className="block px-4 py-2 hover:bg-gray-100 rounded-md" data-testid="link-mobile-contact">
              Contact
            </a>
            <div className="px-4 pt-2">
              <button className="w-full px-6 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors" data-testid="button-mobile-start-designing">
                Start Designing
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
