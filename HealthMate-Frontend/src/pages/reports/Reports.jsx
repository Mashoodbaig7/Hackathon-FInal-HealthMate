import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Eye,
  Download,
  Calendar,
  User,
  Filter,
  Search,
  Plus,
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { reportsAPI, familyMembersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    reportType: '',
    familyMemberId: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const reportTypes = [
    'blood_test', 'urine_test', 'x_ray', 'ct_scan', 'mri_scan',
    'ultrasound', 'ecg', 'echo', 'stress_test', 'consultation',
    'prescription', 'vaccination', 'other'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchData = async () => {
    await Promise.all([fetchReports(), fetchFamilyMembers()]);
  };

  const fetchReports = async () => {
    try {
      console.log('🔍 Fetching reports...');
      setLoading(true);
      const params = {};
      
      // Apply filters
      if (filters.search) params.search = filters.search;
      if (filters.reportType) params.reportType = filters.reportType;
      if (filters.familyMemberId && filters.familyMemberId !== 'all') {
        params.familyMemberId = filters.familyMemberId === 'self' ? null : filters.familyMemberId;
      }
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      console.log('📋 Request params:', params);
      const response = await reportsAPI.getReports(params);
      console.log('📊 Reports API response:', response.data);
      
      if (response.data.success) {
        const reportsList = response.data.data.reports || [];
        console.log('✅ Reports loaded:', reportsList.length);
        setReports(reportsList);
      } else {
        console.log('❌ API returned unsuccessful response');
        toast.error('Failed to load reports');
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await familyMembersAPI.getFamilyMembers();
      console.log('Family members API response:', response.data);
      
      if (response.data.success) {
        const selfMember = {
          _id: 'self',
          name: user?.name || 'Myself',
          relationship: 'Self'
        };
        const familyMembersList = response.data.data.familyMembers || response.data.data || [];
        setFamilyMembers([selfMember, ...familyMembersList]);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const getAnalysisStatus = (report) => {
    if (report.aiAnalysis?.summary?.english || report.aiAnalysis?.summary?.urdu) {
      // Check confidence level for better status indication
      const confidence = report.aiAnalysis.confidence || 0;
      if (confidence > 70) {
        return { status: 'completed', color: 'text-green-600', icon: CheckCircle };
      } else if (confidence > 30) {
        return { status: 'partial', color: 'text-yellow-600', icon: AlertCircle };
      } else {
        return { status: 'basic', color: 'text-blue-600', icon: Brain };
      }
    } else if (report.aiAnalysis?.processing) {
      return { status: 'processing', color: 'text-yellow-600', icon: Clock };
    } else {
      return { status: 'pending', color: 'text-gray-600', icon: AlertCircle };
    }
  };

  const getFamilyMemberName = (report) => {
    if (!report.familyMemberId) return 'Myself';
    const member = familyMembers.find(m => m._id === report.familyMemberId);
    return member ? member.name : 'Unknown';
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      reportType: '',
      familyMemberId: '',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medical Reports</h1>
              <p className="text-gray-600 mt-2">میڈیکل رپورٹس اور AI تجزیہ</p>
            </div>
            <Link
              to="/reports/upload"
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Report</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <div className="flex items-center space-x-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Filter className="w-4 h-4" />
                  <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Search reports..."
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Member
                  </label>
                  <select
                    value={filters.familyMemberId}
                    onChange={(e) => setFilters({ ...filters, familyMemberId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All members</option>
                    {familyMembers.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={filters.reportType}
                    onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All types</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : reports.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {reports.map((report, index) => {
                const analysisStatus = getAnalysisStatus(report);
                const StatusIcon = analysisStatus.icon;
                
                return (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-primary-100 p-2 rounded-lg">
                              <FileText className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {report.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {report.reportType.replace('_', ' ').toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>{getFamilyMemberName(report)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(report.reportDate), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`w-4 h-4 ${analysisStatus.color}`} />
                              <span className={analysisStatus.color}>
                                AI Analysis {analysisStatus.status}
                              </span>
                            </div>
                          </div>

                          {report.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {report.description}
                            </p>
                          )}

                          {report.aiAnalysis?.summary && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <div className="flex items-start space-x-2">
                                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                                    <span>AI Analysis Summary</span>
                                    {report.aiAnalysis.confidence && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {report.aiAnalysis.confidence}% confidence
                                      </span>
                                    )}
                                  </h4>
                                  
                                  {/* English Summary */}
                                  {report.aiAnalysis.summary.english && (
                                    <div className="mb-2">
                                      <p className="text-blue-800 text-sm line-clamp-3">
                                        {report.aiAnalysis.summary.english}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Urdu Summary */}
                                  {report.aiAnalysis.summary.urdu && (
                                    <div className="mb-2">
                                      <p className="text-purple-700 text-sm italic line-clamp-2">
                                        {report.aiAnalysis.summary.urdu}
                                      </p>
                                    </div>
                                  )}

                                  {/* Key Findings Preview */}
                                  {report.aiAnalysis.keyFindings && report.aiAnalysis.keyFindings.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-blue-200">
                                      <p className="text-xs text-blue-700 font-medium mb-1">Key Findings:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {report.aiAnalysis.keyFindings.slice(0, 3).map((finding, idx) => (
                                          <span
                                            key={idx}
                                            className={`text-xs px-2 py-1 rounded-full ${
                                              finding.status === 'normal' ? 'bg-green-100 text-green-800' :
                                              finding.status === 'high' || finding.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                              finding.status === 'critical' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}
                                          >
                                            {finding.parameter}: {finding.status}
                                          </span>
                                        ))}
                                        {report.aiAnalysis.keyFindings.length > 3 && (
                                          <span className="text-xs text-blue-600">
                                            +{report.aiAnalysis.keyFindings.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Quick Recommendations */}
                                  {report.aiAnalysis.recommendations?.english && report.aiAnalysis.recommendations.english.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-blue-200">
                                      <p className="text-xs text-blue-700 font-medium mb-1">Quick Recommendations:</p>
                                      <ul className="text-xs text-blue-800 space-y-1">
                                        {report.aiAnalysis.recommendations.english.slice(0, 2).map((rec, idx) => (
                                          <li key={idx} className="flex items-start space-x-1">
                                            <span className="text-blue-500">•</span>
                                            <span className="line-clamp-1">{rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Link
                            to={`/reports/${report._id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          {report.fileUrl && (
                            <a
                              href={report.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
            >
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? 'No reports found' : 'No reports uploaded yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more results'
                  : 'Upload your first medical report to get started with AI analysis'
                }
              </p>
              {!hasActiveFilters && (
                <Link to="/reports/upload" className="btn-primary">
                  Upload First Report
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Reports;
