import React from 'react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

function AboutInputs() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Understanding Our Construction Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our advanced AI-powered system transforms your construction inputs into comprehensive insights and predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Input Parameters Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Input Parameters
              </h2>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Project Dimensions</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-medium">Built-up Area:</span> Essential for calculating material quantities and labor requirements
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-medium">Number of Floors:</span> Critical for structural analysis and vertical cost distribution
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Construction Specifications</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-medium">Building Type:</span> Determines specific requirements and regulations for different building categories
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-medium">Structure Type:</span> Influences material selection and construction methodology
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-medium">Wall Material:</span> Affects cost, durability, and construction timeline
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Visual Analysis</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-medium">Construction Site Images:</span> Enables AI-powered stage detection and safety analysis
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-medium">Project Timeline:</span> Helps in scheduling and resource allocation
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Analysis Process Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                How We Process Your Data
              </h2>
              <div className="space-y-8">
                <div className="relative pl-8 border-l-2 border-blue-200">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. AI-Powered Image Analysis</h3>
                  <p className="text-gray-600">
                    Our advanced computer vision system analyzes your construction site images to:
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Detect the current construction stage</li>
                    <li>• Identify potential safety hazards</li>
                    <li>• Assess construction progress</li>
                    <li>• Validate site conditions</li>
                  </ul>
                </div>

                <div className="relative pl-8 border-l-2 border-green-200">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Cost Estimation Model</h3>
                  <p className="text-gray-600">
                    We process your project specifications through our sophisticated cost estimation model:
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Calculate material requirements</li>
                    <li>• Estimate labor costs</li>
                    <li>• Project timeline and milestones</li>
                    <li>• Generate detailed cost breakdowns</li>
                  </ul>
                </div>

                <div className="relative pl-8 border-l-2 border-purple-200">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 bg-purple-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Safety Analysis</h3>
                  <p className="text-gray-600">
                    Our system performs comprehensive safety analysis:
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Identify missing safety equipment</li>
                    <li>• Detect potential hazards</li>
                    <li>• Provide safety recommendations</li>
                    <li>• Generate compliance reports</li>
                  </ul>
                </div>

                <div className="relative pl-8 border-l-2 border-yellow-200">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 bg-yellow-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Comprehensive Report Generation</h3>
                  <p className="text-gray-600">
                    Finally, we compile all analyses into a detailed report including:
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Cost estimates and breakdowns</li>
                    <li>• Construction stage analysis</li>
                    <li>• Safety recommendations</li>
                    <li>• Timeline projections</li>
                    <li>• Risk assessment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/upload"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Start Your Analysis
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AboutInputs;
