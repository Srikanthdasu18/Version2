import React from 'react';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AutoServe</h3>
              <p className="text-gray-400 text-sm">
                Your one-stop solution for vehicle parts and professional mechanic services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/products" className="hover:text-white transition-colors">
                    Products
                  </a>
                </li>
                <li>
                  <a href="/mechanics" className="hover:text-white transition-colors">
                    Find Mechanic
                  </a>
                </li>
                <li>
                  <a href="/services" className="hover:text-white transition-colors">
                    Request Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/vendor/signup" className="hover:text-white transition-colors">
                    Become a Vendor
                  </a>
                </li>
                <li>
                  <a href="/mechanic/signup" className="hover:text-white transition-colors">
                    Join as Mechanic
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition-colors">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} AutoServe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
