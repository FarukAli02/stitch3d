export default function Footer() {
  return (
    <footer id="contact" className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold font-serif mb-4" data-testid="text-footer-company">
              Stitch3D
            </h3>
            <p className="text-gray-600 mb-4" data-testid="text-footer-tagline">
              Premium handcrafted leather jackets tailored to perfection since 2025.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-quick-links">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-footer-home">
                  Home
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-footer-gallery">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#customize" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-footer-customize">
                  Customize
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-footer-about">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-contact">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span data-testid="text-footer-address">Szabist 100</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span data-testid="text-footer-phone">021 345678908</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span data-testid="text-footer-email">info@Stitch3D.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
          <p data-testid="text-footer-copyright">
            &copy; 2025 Stitch3D. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
