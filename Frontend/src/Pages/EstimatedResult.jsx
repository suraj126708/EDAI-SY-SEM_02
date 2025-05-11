import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const EstimatedResult = ({ prediction, safetyData, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(num);
  };

  // Materials Distribution Chart
  const materialsData = {
    labels: Object.keys(prediction.stage_model.materials).map(key => 
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Quantity',
        data: Object.values(prediction.stage_model.materials),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Cost Distribution Chart
  const costData = {
    labels: ['Materials', 'Labor', 'Equipment', 'Overhead', 'Contingency'],
    datasets: [
      {
        label: 'Cost Distribution',
        data: [
          prediction.stage_model.estimated_stage_cost_inr * 0.4,
          prediction.stage_model.estimated_stage_cost_inr * 0.3,
          prediction.stage_model.estimated_stage_cost_inr * 0.15,
          prediction.stage_model.estimated_stage_cost_inr * 0.1,
          prediction.stage_model.estimated_stage_cost_inr * 0.05,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  // Timeline Chart
  const timelineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        label: 'Progress',
        data: [20, 40, 60, 80, 100],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Construction Project Report', 105, 20, { align: 'center' });
    
    // Overall Project Details
    doc.setFontSize(16);
    doc.text('Overall Project Details', 20, 40);
    doc.setFontSize(12);
    doc.text(`Total Estimated Cost: ${formatCurrency(prediction.building_model.estimated_cost_inr)}`, 20, 50);
    doc.text(`Estimated Duration: ${Math.round(prediction.building_model.estimated_days)} days`, 20, 60);
    
    // Current Stage Details
    doc.setFontSize(16);
    doc.text('Current Stage Details', 20, 80);
    doc.setFontSize(12);
    doc.text(`Stage Cost: ${formatCurrency(prediction.stage_model.estimated_stage_cost_inr)}`, 20, 90);
    doc.text(`Stage Duration: ${Math.round(prediction.stage_model.estimated_stage_days)} days`, 20, 100);
    
    // Materials Required
    doc.setFontSize(16);
    doc.text('Materials Required', 20, 120);
    doc.setFontSize(12);
    const materials = prediction.stage_model.materials;
    doc.text(`Aggregates: ${formatNumber(materials.aggregates_cubic_meters)} cubic meters`, 20, 130);
    doc.text(`Bricks: ${formatNumber(materials.bricks_units)} units`, 20, 140);
    doc.text(`Cement: ${formatNumber(materials.cement_bags)} bags`, 20, 150);
    doc.text(`Sand: ${formatNumber(materials.sand_cubic_meters)} cubic meters`, 20, 160);
    doc.text(`Steel: ${formatNumber(materials.steel_kg)} kg`, 20, 170);
    
    // Safety Concerns
    if (safetyData && safetyData.missing_items && safetyData.missing_items.length > 0) {
      doc.setFontSize(16);
      doc.text('Safety Concerns', 20, 190);
      doc.setFontSize(12);
      doc.text('Missing Safety Equipment:', 20, 200);
      safetyData.missing_items.forEach((item, index) => {
        doc.text(`• ${item}`, 30, 210 + (index * 10));
      });
    }
    
    doc.save('construction-report.pdf');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-7xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Construction Project Report
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Project Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overall Project Details
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Total Estimated Cost</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(prediction.building_model.estimated_cost_inr)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Estimated Duration</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(prediction.building_model.estimated_days)} days
                </p>
              </div>
            </div>
          </div>

          {/* Current Stage Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Current Stage Details
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Stage Cost</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(prediction.stage_model.estimated_stage_cost_inr)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Stage Duration</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(prediction.stage_model.estimated_stage_days)} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Materials Distribution</h3>
            <div className="h-64">
              <Bar
                data={materialsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Cost Distribution</h3>
            <div className="h-64">
              <Doughnut
                data={costData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Project Timeline</h3>
            <div className="h-64">
              <Line
                data={timelineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Materials Required */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Materials Required
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(prediction.stage_model.materials).map(([material, quantity]) => (
              <div key={material} className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 capitalize">
                  {material.replace(/_/g, ' ')}
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {formatNumber(quantity)} {material.includes('cubic_meters') ? 'm³' : 
                    material.includes('kg') ? 'kg' : 
                    material.includes('bags') ? 'bags' : 
                    material.includes('units') ? 'units' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Concerns */}
        {safetyData && safetyData.missing_items && safetyData.missing_items.length > 0 && (
          <div className="mt-8 bg-red-50 rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Safety Concerns
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-lg font-semibold text-red-600 mb-4">Missing Safety Equipment</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyData.missing_items.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Download Report Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={generatePDF}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstimatedResult;
