import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  Plus,
  Brain,
  Globe,
  MessageSquare,
  Lightbulb,
  Heart,
  Stethoscope,
  Utensils,
  Home,
  Shield,
  Eye
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { reportsAPI, familyMembersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ReportUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [uploadedReport, setUploadedReport] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    reportType: '',
    reportDate: '',
    familyMemberId: '',
    description: '',
    doctorName: '',
    hospitalName: ''
  });

  const reportTypes = [
    'blood_test', 'urine_test', 'xray', 'mri', 'ct_scan',
    'ultrasound', 'ecg', 'prescription', 'consultation', 'vaccination', 'other'
  ];

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const response = await familyMembersAPI.getFamilyMembers();
      console.log('Family members API response:', response.data);
      
      if (response.data.success) {
        // Add self as an option
        const selfMember = {
          _id: 'self',
          name: user?.name || 'Myself',
          relationship: 'self'
        };
        
        // Use correct response structure
        const familyMembersList = response.data.data.familyMembers || response.data.data || [];
        setFamilyMembers([selfMember, ...familyMembersList]);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      
      // Auto-fill title if not set
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.split('.')[0].replace(/[_-]/g, ' ')
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.familyMemberId) {
      toast.error('Please select a family member');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    if (!formData.reportType) {
      toast.error('Please select a report type');
      return;
    }

    try {
      setUploading(true);
      
      const uploadData = new FormData();
      uploadData.append('reportFile', selectedFile);
      uploadData.append('title', formData.title.trim());
      uploadData.append('reportType', formData.reportType);
      uploadData.append('reportDate', formData.reportDate || new Date().toISOString().split('T')[0]);
      uploadData.append('description', formData.description.trim());
      uploadData.append('doctorName', formData.doctorName.trim());
      uploadData.append('hospitalName', formData.hospitalName.trim());
      
      // Only add familyMemberId if it's not 'self'
      if (formData.familyMemberId !== 'self') {
        uploadData.append('familyMemberId', formData.familyMemberId);
      }

      // Debug logging
      console.log('🚀 Upload data being sent:');
      for (let [key, value] of uploadData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await reportsAPI.uploadReport(uploadData);
      
      if (response.data.success) {
        const report = response.data.data.report;
        setUploadedReport(report);
        setShowAnalysisModal(true);
        toast.success('Report uploaded successfully!');
      }
    } catch (error) {
      console.error('❌ Error uploading report:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        // Show validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - Please check if backend server is running');
      } else {
        toast.error('Failed to upload report. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const closeAnalysisModal = () => {
    setShowAnalysisModal(false);
    setUploadedReport(null);
  };

  const handleViewFullReport = () => {
    if (uploadedReport) {
      closeAnalysisModal();
      navigate(`/reports/${uploadedReport._id}`);
    }
  };

  const handleViewAllReports = () => {
    closeAnalysisModal();
    navigate('/reports');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upload Medical Report
            </h1>
            <p className="text-gray-600">
              میڈیکل رپورٹ اپلوڈ کریں اور AI کا تجزیہ حاصل کریں
            </p>
          </div>

          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Family Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Family Member *
                </label>
                <select
                  required
                  value={formData.familyMemberId}
                  onChange={(e) => setFormData({ ...formData, familyMemberId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose family member</option>
                  {familyMembers.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.relationship === 'self' ? 'Self' : member.relationship})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File *
                </label>
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports JPEG, PNG, and PDF files up to 10MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Blood Test Report"
                  />
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type *
                  </label>
                  <select
                    required
                    value={formData.reportType}
                    onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Report Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.reportDate}
                    onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Doctor Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Dr. John Smith"
                  />
                </div>
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic Name
                </label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City Hospital"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description/Notes
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="4"
                  placeholder="Any additional notes or symptoms..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/reports')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI Analysis Modal */}
          {showAnalysisModal && uploadedReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">AI Analysis Complete!</h2>
                        <p className="text-blue-100 text-sm">AI نے آپ کی رپورٹ کا تجزیہ مکمل کر دیا ہے</p>
                      </div>
                    </div>
                    <button
                      onClick={closeAnalysisModal}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="space-y-6">
                    {/* Report Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Report Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Title:</span>
                          <span className="ml-2 font-medium">{uploadedReport.title}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium">{uploadedReport.reportType?.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis Results */}
                    {uploadedReport.aiAnalysis ? (
                      <div className="space-y-6">
                        {/* Summary */}
                        {uploadedReport.aiAnalysis.summary && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Brain className="w-5 h-5 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-bold text-blue-900">AI Analysis Summary</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {uploadedReport.aiAnalysis.summary.english && (
                                <div className="p-4 bg-white rounded-lg border border-blue-100">
                                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <Globe className="w-4 h-4" />
                                    <span>English Summary</span>
                                  </h4>
                                  <p className="text-gray-700 text-sm">{uploadedReport.aiAnalysis.summary.english}</p>
                                </div>
                              )}
                              
                              {uploadedReport.aiAnalysis.summary.urdu && (
                                <div className="p-4 bg-white rounded-lg border border-purple-100">
                                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Roman Urdu Summary</span>
                                  </h4>
                                  <p className="text-gray-700 text-sm italic">{uploadedReport.aiAnalysis.summary.urdu}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Key Findings */}
                        {uploadedReport.aiAnalysis.keyFindings && uploadedReport.aiAnalysis.keyFindings.length > 0 && (
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span>Key Findings</span>
                            </h3>
                            <div className="space-y-3">
                              {uploadedReport.aiAnalysis.keyFindings.slice(0, 3).map((finding, idx) => (
                                <div key={idx} className="p-3 border border-gray-100 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm">{finding.parameter}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      finding.status === 'normal' ? 'text-green-600 bg-green-100' :
                                      finding.status === 'high' || finding.status === 'low' ? 'text-yellow-600 bg-yellow-100' :
                                      finding.status === 'critical' ? 'text-red-600 bg-red-100' :
                                      'text-gray-600 bg-gray-100'
                                    }`}>
                                      {finding.status?.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Value:</span> {finding.value} | 
                                    <span className="font-medium ml-2">Normal:</span> {finding.normalRange}
                                  </div>
                                </div>
                              ))}
                              {uploadedReport.aiAnalysis.keyFindings.length > 3 && (
                                <p className="text-sm text-gray-500 text-center">
                                  +{uploadedReport.aiAnalysis.keyFindings.length - 3} more findings available in detailed view
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recommendations Preview */}
                        {uploadedReport.aiAnalysis.recommendations && (
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <Lightbulb className="w-5 h-5 text-yellow-600" />
                              <span>Top Recommendations</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {uploadedReport.aiAnalysis.recommendations.english && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">English</h4>
                                  <ul className="space-y-1">
                                    {uploadedReport.aiAnalysis.recommendations.english.slice(0, 3).map((rec, idx) => (
                                      <li key={idx} className="flex items-start space-x-2">
                                        <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700 text-xs">{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {uploadedReport.aiAnalysis.recommendations.urdu && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Roman Urdu</h4>
                                  <ul className="space-y-1">
                                    {uploadedReport.aiAnalysis.recommendations.urdu.slice(0, 3).map((rec, idx) => (
                                      <li key={idx} className="flex items-start space-x-2">
                                        <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700 text-xs italic">{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick Health Tips */}
                        {(uploadedReport.aiAnalysis.homeRemedies || uploadedReport.aiAnalysis.dietarySuggestions) && (
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <Heart className="w-5 h-5 text-green-600" />
                              <span>Health Tips</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {uploadedReport.aiAnalysis.homeRemedies?.english && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                                    <Home className="w-4 h-4" />
                                    <span>Home Remedies</span>
                                  </h4>
                                  <ul className="space-y-1">
                                    {uploadedReport.aiAnalysis.homeRemedies.english.slice(0, 2).map((remedy, idx) => (
                                      <li key={idx} className="text-xs text-gray-700">• {remedy}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {uploadedReport.aiAnalysis.dietarySuggestions?.recommendedFoods && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                                    <Utensils className="w-4 h-4" />
                                    <span>Dietary Tips</span>
                                  </h4>
                                  <ul className="space-y-1">
                                    {uploadedReport.aiAnalysis.dietarySuggestions.recommendedFoods.slice(0, 2).map((food, idx) => (
                                      <li key={idx} className="text-xs text-gray-700">• {food}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Disclaimer */}
                        {uploadedReport.aiAnalysis.disclaimer && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                              <Shield className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-900 mb-1 text-sm">Important Disclaimer</h4>
                                <p className="text-yellow-800 text-xs">{uploadedReport.aiAnalysis.disclaimer.english}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis in Progress</h3>
                        <p className="text-gray-600 mb-1">Gemini AI is analyzing your medical report...</p>
                        <p className="text-sm text-gray-500 italic">AI آپ کی میڈیکل رپورٹ کا تجزیہ کر رہا ہے...</p>
                        <div className="mt-6 max-w-md mx-auto">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 text-blue-700 text-sm">
                              <Lightbulb className="w-4 h-4" />
                              <span>AI will provide insights on key findings, recommendations, and health tips</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Upload successful! AI analysis available
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        closeAnalysisModal();
                        // Reset form for new upload
                        setFormData({
                          title: '',
                          reportType: '',
                          reportDate: '',
                          familyMemberId: '',
                          description: '',
                          doctorName: '',
                          hospitalName: ''
                        });
                        setSelectedFile(null);
                      }}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Another</span>
                    </button>
                    <button
                      onClick={handleViewAllReports}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      View All Reports
                    </button>
                    <button
                      onClick={handleViewFullReport}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Full Analysis</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">
                  Tips for better AI analysis:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure the image is clear and well-lit</li>
                  <li>• All text should be readable</li>
                  <li>• Include complete report pages</li>
                  <li>• PDF format is preferred for text reports</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ReportUpload;
