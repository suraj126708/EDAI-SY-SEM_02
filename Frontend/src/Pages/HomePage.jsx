import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Smart Construction Monitoring
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Advanced solutions for cost estimation, safety compliance, and project management
            </p>
            <Link
              to="/upload"
              className="bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cost Estimation */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-blue-600 text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-4">Cost Estimation</h3>
              <p className="text-gray-600">
                Detailed cost analysis for each level and overall building, including materials, labor, and timeline projections.
              </p>
            </div>

            {/* Safety Compliance */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-blue-600 text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-4">Safety Compliance</h3>
              <p className="text-gray-600">
                AI-powered analysis of photos and videos to ensure construction safety standards are met.
              </p>
            </div>

            {/* Progress Reports */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-4">Detailed Reports</h3>
              <p className="text-gray-600">
                Comprehensive reports on project progress, costs, and safety compliance for informed decision-making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Data</h3>
              <p className="text-gray-600">Submit your construction photos and project details</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">Analysis</h3>
              <p className="text-gray-600">Our AI processes your data for safety and compliance</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Estimation</h3>
              <p className="text-gray-600">Get detailed cost and time estimates</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">4</span>
              </div>
              <h3 className="font-semibold mb-2">Report</h3>
              <p className="text-gray-600">Receive comprehensive project reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Construction Project?</h2>
          <p className="text-xl mb-8">Get started with our advanced monitoring solutions today</p>
          
            <a 
              href="https://wa.me/919860126708?text=Hello%20I%20would%20like%20to%20know%20more%20about%20your%20construction%20analysis%20services" 
              target="_blank" 
              rel="noopener noreferrer" 
            className="bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-100 transition duration-300"

            >
              Contact Us
            </a>
          
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
