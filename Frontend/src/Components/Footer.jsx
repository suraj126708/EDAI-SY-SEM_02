import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">BuildMonitor</h3>
            <p className="text-gray-400">
              Advanced construction monitoring and safety compliance solutions for modern construction projects.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/estimation" className="text-gray-400 hover:text-white">Cost Estimation</Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-400 hover:text-white">Safety Compliance</Link>
              </li>
              <li>
                <Link to="/reports" className="text-gray-400 hover:text-white">Reports</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Cost Estimation</li>
              <li className="text-gray-400">Time Management</li>
              <li className="text-gray-400">Material Planning</li>
              <li className="text-gray-400">Safety Compliance</li>
              <li className="text-gray-400">Progress Reports</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <span className="mr-2">📞</span> +91 9860126708
              </li>
              <li className="text-gray-400">
                <span className="mr-2">✉️</span> suraj@gmail.com
              </li>
              <li className="text-gray-400">
                <span className="mr-2">📍</span> Upper indiranagar vit pune
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BuildMonitor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
