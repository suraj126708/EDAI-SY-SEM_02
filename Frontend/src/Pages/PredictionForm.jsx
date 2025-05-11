import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { costEstimationAPI, workerSafetyAPI } from "./Routes";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import EstimatedResult from './EstimatedResult';

const ALLOWED_FILE_TYPES = {
  'image/png': true,
  'image/jpeg': true,
  'image/jpg': true,
  'video/mp4': true,
  'video/avi': true,
  'video/quicktime': true, // for .mov files
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function PredictionForm() {
  const [formData, setFormData] = useState({
    areaSqft: "",
    floors: "",
    buildingType: "",
    structureType: "",
    wallMaterial: "",
    startDate: ""
  });

  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [stageDetected, setStageDetected] = useState(false);
  const [safety, setSafety] = useState("");
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [safetyData, setSafetyData] = useState(null);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    // Filter files based on allowed types
    const mediaFiles = Array.from(files).filter(file => {
      const fileType = file.type.toLowerCase();
      return ALLOWED_FILE_TYPES[fileType] || 
             file.name.toLowerCase().endsWith('.png') ||
             file.name.toLowerCase().endsWith('.jpg') ||
             file.name.toLowerCase().endsWith('.jpeg') ||
             file.name.toLowerCase().endsWith('.mp4') ||
             file.name.toLowerCase().endsWith('.avi') ||
             file.name.toLowerCase().endsWith('.mov');
    });
    
    if (mediaFiles.length === 0) {
      alert("Please upload files in the following formats: PNG, JPG, JPEG, MP4, AVI, or MOV");
      return;
    }
    
    if (images.length + mediaFiles.length > 10) {
      alert("You can only upload up to 10 files in total.");
      return;
    }

    // Process media for safety analysis
    setSafetyLoading(true);
    let retryCount = 0;

    const processWithRetry = async () => {
      try {
        console.log("Starting safety analysis with files:", mediaFiles);
        const formData = new FormData();
        mediaFiles.forEach(file => {
          formData.append('files', file);
        });

        console.log("FormData contents:", Array.from(formData.entries()));

        // First check if server is healthy
        try {
          const healthCheck = await axios.get('http://localhost:5000/health');
          console.log("Server health check:", healthCheck.data);
          if (healthCheck.data.status !== 'healthy') {
            throw new Error('Server is not healthy');
          }
        } catch (error) {
          console.error("Server health check failed:", error);
          throw new Error('Server is not responding. Please check if the server is running.');
        }

        // Set a longer timeout for video processing
        const response = await axios.post(`http://localhost:5000/process-media`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 2 minutes timeout for video processing
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        });

        console.log("Safety analysis response:", response);

        if (!response.data || !response.data.results) {
          throw new Error('Invalid response format from safety analysis API');
        }

        const processedResults = await Promise.all(
          response.data.results.map(async (result) => {
            if (!result) {
              throw new Error('Invalid result format in safety analysis response');
            }
            
            if (result.status === 'success') {
              try {
                const mediaResponse = await axios.get(
                  `http://localhost:5000/get-processed-media/${result.processed_filename}`,
                  { 
                    responseType: 'blob',
                    timeout: 30000 // 30 seconds timeout for fetching processed media
                  }
                );
                
                const mediaUrl = URL.createObjectURL(mediaResponse.data);
            
                return {
                  ...result,
                  processedMediaUrl: mediaUrl,
                  type: result.type || 'image'
                };
              } catch (error) {
                console.error('Error fetching processed media:', error);
                return {
                  ...result,
                  error: 'Failed to fetch processed media'
                };
              }
            }
            return result;
          })
        );
        
        console.log("Processed results:", processedResults);
        setProcessedImages(prev => [...prev, ...processedResults]);
        retryCount = 0; // Reset retry count on success
      } catch (error) {
        console.error('Error processing safety analysis:', error);
        let errorMessage = 'Failed to process safety analysis for media';
        
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
        } else if (error.request) {
          console.error('No response received:', error.request);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying... Attempt ${retryCount} of ${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return processWithRetry();
          }
          errorMessage = 'No response received from server. Please check your connection and try again.';
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        if (retryCount >= MAX_RETRIES) {
          alert(errorMessage);
        }
      }
    };

    try {
      await processWithRetry();
    } catch (error) {
      console.error('Final error:', error);
    } finally {
      setSafetyLoading(false);
    }

    // Add media to the form
    mediaFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prevImages => [...prevImages, {
          id: Date.now() + Math.random(),
          file: file,
          preview: reader.result,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prevImages => prevImages.filter(img => img.id !== id));
  };

  const detectConstructionStage = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image of the construction site.");
      return null;
    }

    const prompt = `Analyze these construction site images and provide the construction stage in a strict JSON format. The response must be a valid JSON object with the following structure:
    {
      "construction_stage": "stage_name",
    }
    
    The stage_name must be one of these exact values:
    - "Excavation"
    - "Foundation"
    - "Framing"
    - "Plastering"
    - "Roofing"
    - "Wiring / Plumbing"
    - "Flooring"
    - "Finishing"
    
    Provide ONLY the JSON object, no additional text or explanation.`;

    const parts = images.map(image => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: image.preview.split(",")[1],
      },
    }));

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, ...parts] }],
      });
      const responseText = result.response.text();
      const cleanedResponse = responseText.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      const jsonMatch = cleanedResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || [null, cleanedResponse];
      const jsonString = jsonMatch[1];
      
      try {
        const parsedResponse = JSON.parse(jsonString);
        if (parsedResponse.construction_stage) {
          const stage = parsedResponse.construction_stage;
          setFormData(prev => ({ ...prev, constructionStage: stage }));
          setSafety(parsedResponse.safety_concerns || []);
          setStageDetected(true);
          return stage;
        } else {
          throw new Error("Response missing construction_stage field");
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        console.error("Failed to parse response:", jsonString);
        alert("Failed to parse construction stage response. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("Error detecting construction stage:", error);
      alert("Failed to detect construction stage. Please try again.");
      return null;
    }
  };

  const getPrediction = async (stage) => {
    try {
      const predictionResponse = await costEstimationAPI.predictAll({
        area_sqft: formData.areaSqft,
        floors: formData.floors,
        building_type: formData.buildingType,
        structure_type: formData.structureType,
        wall_material: formData.wallMaterial,
        construction_stage: stage,
      });

      console.log("Prediction response:", predictionResponse);
      return predictionResponse;
    } catch (error) {
      console.error("Error fetching prediction:", error);
      throw new Error("Failed to get prediction from server");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setPrediction(null);
    setShowResults(false);

    try {
      // Step 1: Detect construction stage from images
      const stage = await detectConstructionStage();
      if (!stage) {
        setLoading(false);
        return;
      }

      // Step 2: Get prediction from cost estimation model
      const predictionData = await costEstimationAPI.predictAll({
        area_sqft: formData.areaSqft,
        floors: formData.floors,
        building_type: formData.buildingType,
        structure_type: formData.structureType,
        wall_material: formData.wallMaterial,
        construction_stage: stage,
      });

      // Step 3: Set prediction data and safety data
      setPrediction(predictionData);
      
      // Step 4: Process safety data from processed images
      const safetyConcerns = processedImages.reduce((acc, result) => {
        if (result.missing_items && result.missing_items.length > 0) {
          acc.missing_items = [...new Set([...(acc.missing_items || []), ...result.missing_items])];
        }
        return acc;
      }, { missing_items: [] });

      setSafetyData(safetyConcerns);
      setShowResults(true);
    } catch (error) {
      console.error("Error in processing:", error);
      alert(error.message || "An error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {!showResults ? (
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Construction Project Analysis
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your construction site images and provide project details to get a comprehensive analysis of your construction project.
              </p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
              <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Project Details Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Project Details
                    </h3>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="areaSqft" className="block text-sm font-medium text-gray-700 mb-1">
                            Built-up Area (sq ft)
                          </label>
                          <input
                            type="number"
                            id="areaSqft"
                            value={formData.areaSqft}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="e.g., 2500"
                          />
                        </div>

                        <div>
                          <label htmlFor="floors" className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Floors
                          </label>
                          <input
                            type="number"
                            id="floors"
                            value={formData.floors}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="e.g., 2"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700 mb-1">
                          Building Type
                        </label>
                        <select
                          id="buildingType"
                          value={formData.buildingType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                          <option value="">Select type</option>
                          <option value="residential">Residential</option>
                          <option value="commercial">Commercial</option>
                          <option value="industrial">Industrial</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="structureType" className="block text-sm font-medium text-gray-700 mb-1">
                          Structure Type
                        </label>
                        <select
                          id="structureType"
                          value={formData.structureType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                          <option value="">Select type</option>
                          <option value="rcc-framed">RCC</option>
                          <option value="load-bearing">Load Bearing</option>
                          <option value="steel-structure">Steel Frame</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="wallMaterial" className="block text-sm font-medium text-gray-700 mb-1">
                          Wall Material
                        </label>
                        <select
                          id="wallMaterial"
                          value={formData.wallMaterial}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                          <option value="">Select material</option>
                          <option value="brick">Brick</option>
                          <option value="concrete-block">Concrete Block</option>
                          <option value="aac-block">AAC Block</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Project Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Construction Site Images Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Construction Site Images
                    </h3>
                    
                    <div
                      ref={dropZoneRef}
                      className={`border-3 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        accept=".png,.jpg,.jpeg,.mp4,.avi,.mov"
                        multiple
                        className="hidden"
                      />
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Browse Files
                        </button>
                        <p className="text-sm text-gray-500">
                          or drag and drop files here
                        </p>
                        <p className="text-xs text-gray-400">
                          Supported formats: PNG, JPG, JPEG, MP4, AVI, MOV
                          <br />
                          (Up to 10 files, {images.length}/10 uploaded)
                        </p>
                      </div>
                    </div>

                    {images.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-700">Uploaded Images</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {images.map((image) => (
                            <div key={image.id} className="relative group">
                              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                                {image.type === 'video' ? (
                                  <video
                                    src={image.preview}
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={image.preview}
                                    alt="Construction site"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {safetyLoading && (
                      <div className="mt-6 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-blue-600 font-medium">Processing safety analysis...</span>
                        </div>
                      </div>
                    )}

                    {processedImages.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-700">Safety Analysis Results</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {processedImages.map((result, index) => (
                            <div key={index} className="relative group">
                              {result.status === 'success' ? (
                                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                                  {result.type === 'video' ? (
                                    <video
                                      src={result.processedMediaUrl}
                                      controls
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={result.processedMediaUrl}
                                      alt="Safety analysis"
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                  {result.missing_items && result.missing_items.length > 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-red-500 bg-opacity-90 text-white p-2 text-sm">
                                      Missing: {result.missing_items.join(', ')}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                  <p className="text-red-600 text-sm">{result.error}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  {stageDetected && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-800">
                          <span className="font-semibold">Detected Construction Stage:</span>{" "}
                          {formData.constructionStage}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Analyze Construction
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <EstimatedResult
            prediction={prediction}
            safetyData={safetyData}
            onClose={() => setShowResults(false)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

export default PredictionForm;
