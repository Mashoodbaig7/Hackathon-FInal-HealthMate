import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Download,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Activity,
  Stethoscope,
  Lightbulb,
  MessageSquare,
  Utensils,
  Home,
  Globe,
  Shield
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { reportsAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await reportsAPI.getReport(id);
      if (response.data.success) {
        setReport(response.data.data.report);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'high': case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  if (!report) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
          <button onClick={() => navigate('/reports')} className="btn-primary">
            Back to Reports
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-gray-600 mt-1">میڈیکل رپورٹ کی تفصیلی تجزیہ</p>
            </div>
            {report.fileUrl && (
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Analysis Summary */}
              {report.aiAnalysis?.summary && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-blue-900">AI Analysis Summary</h2>
                      {report.aiAnalysis.confidence && (
                        <p className="text-blue-700 text-sm">
                          Confidence: {report.aiAnalysis.confidence}%
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {report.aiAnalysis.summary.english && (
                      <div className="p-4 bg-white rounded-lg border border-blue-100">
                        <h3 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>English Summary</span>
                        </h3>
                        <p className="text-gray-700">{report.aiAnalysis.summary.english}</p>
                      </div>
                    )}
                    
                    {report.aiAnalysis.summary.urdu && (
                      <div className="p-4 bg-white rounded-lg border border-purple-100">
                        <h3 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Roman Urdu Summary</span>
                        </h3>
                        <p className="text-gray-700 italic">{report.aiAnalysis.summary.urdu}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {report.aiAnalysis?.keyFindings && report.aiAnalysis.keyFindings.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Activity className="w-6 h-6 text-green-600" />
                    <span>Key Findings</span>
                  </h2>
                  <div className="space-y-4">
                    {report.aiAnalysis.keyFindings.map((finding, idx) => (
                      <div key={idx} className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{finding.parameter}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(finding.status)}`}>
                            {finding.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">Value: </span>
                            <span>{finding.value}</span>
                          </div>
                          <div>
                            <span className="font-medium">Normal Range: </span>
                            <span>{finding.normalRange}</span>
                          </div>
                        </div>
                        {finding.significance && (
                          <p className="text-gray-700 text-sm">{finding.significance}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {report.aiAnalysis?.recommendations && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                    <span>Recommendations</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.aiAnalysis.recommendations.english && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">English</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.recommendations.english.map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.aiAnalysis.recommendations.urdu && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Roman Urdu</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.recommendations.urdu.map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm italic">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Questions for Doctor */}
              {report.aiAnalysis?.questionsForDoctor && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                    <span>Questions for Your Doctor</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.aiAnalysis.questionsForDoctor.english && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">English</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.questionsForDoctor.english.map((question, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.aiAnalysis.questionsForDoctor.urdu && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Roman Urdu</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.questionsForDoctor.urdu.map((question, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm italic">{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dietary Suggestions */}
              {report.aiAnalysis?.dietarySuggestions && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Utensils className="w-6 h-6 text-orange-600" />
                    <span>Dietary Suggestions</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.aiAnalysis.dietarySuggestions.foodsToAvoid?.length > 0 && (
                      <div>
                        <h3 className="font-medium text-red-900 mb-3">Foods to Avoid</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.dietarySuggestions.foodsToAvoid.map((food, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-gray-700 text-sm">{food}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.aiAnalysis.dietarySuggestions.recommendedFoods?.length > 0 && (
                      <div>
                        <h3 className="font-medium text-green-900 mb-3">Recommended Foods</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.dietarySuggestions.recommendedFoods.map((food, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-700 text-sm">{food}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Home Remedies */}
              {report.aiAnalysis?.homeRemedies && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Home className="w-6 h-6 text-purple-600" />
                    <span>Home Remedies</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.aiAnalysis.homeRemedies.english?.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">English</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.homeRemedies.english.map((remedy, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <Heart className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{remedy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.aiAnalysis.homeRemedies.urdu?.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Roman Urdu</h3>
                        <ul className="space-y-2">
                          {report.aiAnalysis.homeRemedies.urdu.map((remedy, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <Heart className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm italic">{remedy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {report.aiAnalysis?.disclaimer && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900 mb-2">Important Disclaimer</h3>
                      <p className="text-yellow-800 text-sm mb-2">{report.aiAnalysis.disclaimer.english}</p>
                      <p className="text-yellow-800 text-sm italic">{report.aiAnalysis.disclaimer.urdu}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Report Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Report Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Type</p>
                      <p className="text-sm text-gray-600">{report.reportType?.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date</p>
                      <p className="text-sm text-gray-600">{format(new Date(report.reportDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  {report.doctorName && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Doctor</p>
                        <p className="text-sm text-gray-600">{report.doctorName}</p>
                      </div>
                    </div>
                  )}
                  {report.hospitalName && (
                    <div className="flex items-center space-x-3">
                      <Hospital className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Hospital</p>
                        <p className="text-sm text-gray-600">{report.hospitalName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">File Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Filename</p>
                    <p className="text-sm text-gray-600">{report.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Type</p>
                    <p className="text-sm text-gray-600">{report.fileType?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Size</p>
                    <p className="text-sm text-gray-600">{(report.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ReportView;
