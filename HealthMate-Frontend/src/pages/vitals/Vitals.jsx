import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  Thermometer,
  Scale,
  Ruler,
  Droplets,
  Plus,
  Calendar,
  User,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { vitalsAPI, familyMembersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Vitals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vitals, setVitals] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    familyMemberId: '',
    startDate: '',
    endDate: '',
    vitalType: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const vitalTypes = [
    { key: 'bloodPressure', label: 'Blood Pressure', icon: Heart, color: 'text-red-600' },
    { key: 'bloodSugar', label: 'Blood Sugar', icon: Droplets, color: 'text-blue-600' },
    { key: 'weight', label: 'Weight', icon: Scale, color: 'text-green-600' },
    { key: 'height', label: 'Height', icon: Ruler, color: 'text-purple-600' },
    { key: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-orange-600' },
    { key: 'heartRate', label: 'Heart Rate', icon: Activity, color: 'text-pink-600' },
    { key: 'oxygenSaturation', label: 'Oxygen Saturation', icon: Heart, color: 'text-cyan-600' },
    { key: 'cholesterol', label: 'Cholesterol', icon: Droplets, color: 'text-yellow-600' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchVitals();
  }, [filters]);

  const fetchData = async () => {
    await Promise.all([fetchVitals(), fetchFamilyMembers()]);
  };

  const fetchVitals = async () => {
    try {
      console.log('🔍 Fetching vitals...');
      setLoading(true);
      const params = {};
      
      // Apply filters
      if (filters.search) params.search = filters.search;
      if (filters.familyMemberId && filters.familyMemberId !== 'all') {
        params.familyMemberId = filters.familyMemberId === 'self' ? null : filters.familyMemberId;
      }
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.vitalType) params.vitalType = filters.vitalType;

      console.log('📋 Request params:', params);
      const response = await vitalsAPI.getVitals(params);
      console.log('📊 Vitals API response:', response.data);
      
      if (response.data.success) {
        const vitalsList = response.data.data.vitals || [];
        console.log('✅ Vitals loaded:', vitalsList.length);
        setVitals(vitalsList);
      } else {
        console.log('❌ API returned unsuccessful response');
        toast.error('Failed to load vitals');
      }
    } catch (error) {
      console.error('❌ Error fetching vitals:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load vitals');
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

  const getFamilyMemberName = (vital) => {
    if (!vital.familyMemberId) return 'Myself';
    const member = familyMembers.find(m => m._id === vital.familyMemberId);
    return member ? member.name : 'Unknown';
  };

  const getVitalValue = (vital, type) => {
    const vitalData = vital[type];
    if (!vitalData) return null;

    switch (type) {
      case 'bloodPressure':
        return vitalData.systolic && vitalData.diastolic 
          ? `${vitalData.systolic}/${vitalData.diastolic} ${vitalData.unit || 'mmHg'}`
          : null;
      case 'bloodSugar':
        if (vitalData.fasting) return `${vitalData.fasting} ${vitalData.unit || 'mg/dL'} (Fasting)`;
        if (vitalData.postMeal) return `${vitalData.postMeal} ${vitalData.unit || 'mg/dL'} (Post-meal)`;
        if (vitalData.random) return `${vitalData.random} ${vitalData.unit || 'mg/dL'} (Random)`;
        if (vitalData.hba1c) return `${vitalData.hba1c}% (HbA1c)`;
        return null;
      case 'cholesterol':
        if (vitalData.total) return `${vitalData.total} ${vitalData.unit || 'mg/dL'} (Total)`;
        return null;
      default:
        return vitalData.value ? `${vitalData.value} ${vitalData.unit || ''}` : null;
    }
  };

  const getVitalStatus = (vital, type) => {
    const value = getVitalValue(vital, type);
    if (!value) return null;

    // Simple status logic (can be enhanced)
    switch (type) {
      case 'bloodPressure':
        const bp = vital[type];
        if (bp.systolic > 140 || bp.diastolic > 90) {
          return { status: 'high', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
        } else if (bp.systolic < 90 || bp.diastolic < 60) {
          return { status: 'low', color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle };
        }
        return { status: 'normal', color: 'text-green-600 bg-green-100', icon: CheckCircle };
      default:
        return { status: 'recorded', color: 'text-blue-600 bg-blue-100', icon: CheckCircle };
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      familyMemberId: '',
      startDate: '',
      endDate: '',
      vitalType: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const handleDeleteVital = async (vitalId) => {
    if (!window.confirm('Are you sure you want to delete this vital record?')) {
      return;
    }

    try {
      await vitalsAPI.deleteVital(vitalId);
      toast.success('Vital record deleted successfully');
      fetchVitals();
    } catch (error) {
      console.error('Error deleting vital:', error);
      toast.error('Failed to delete vital record');
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Health Vitals</h1>
              <p className="text-gray-600 mt-1">صحت کی بنیادی معلومات اور پیمائشیں</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center space-x-2 ${showFilters ? 'bg-gray-100' : ''}`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <Link to="/vitals/add" className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Vitals</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search vitals..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
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
                        {member.name} ({member.relationship === 'self' ? 'Self' : member.relationship})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vital Type
                  </label>
                  <select
                    value={filters.vitalType}
                    onChange={(e) => setFilters({ ...filters, vitalType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All types</option>
                    {vitalTypes.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
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
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {vitals.length} result{vitals.length !== 1 ? 's' : ''} found
                  </span>
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Vitals List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : vitals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No vitals recorded yet</h3>
              <p className="text-gray-600 mb-6">Record your first vital signs to start tracking your health</p>
              <p className="text-gray-500 text-sm mb-6 italic">Apni pehli vital signs record karen health tracking shuru karne ke liye</p>
              <Link to="/vitals/add" className="btn-primary">
                Record First Vital
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {vitals.map((vital) => (
                <motion.div
                  key={vital._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Health Vitals Record
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{getFamilyMemberName(vital)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(vital.recordDate), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {vitalTypes.map((type) => {
                          const value = getVitalValue(vital, type.key);
                          const status = getVitalStatus(vital, type.key);
                          
                          if (!value) return null;

                          const IconComponent = type.icon;
                          const StatusIcon = status?.icon || CheckCircle;

                          return (
                            <div key={type.key} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <IconComponent className={`w-4 h-4 ${type.color}`} />
                                  <span className="text-sm font-medium text-gray-900">
                                    {type.label}
                                  </span>
                                </div>
                                {status && (
                                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    <span>{status.status}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 font-medium">{value}</p>
                            </div>
                          );
                        })}
                      </div>

                      {vital.notes && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {vital.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/vitals/${vital._id}/edit`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit vital"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVital(vital._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete vital"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Vitals;
