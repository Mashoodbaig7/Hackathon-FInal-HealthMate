import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  Droplets,
  User,
  Calendar,
  Save,
  ArrowLeft
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { vitalsAPI, familyMembersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const VitalAdd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    familyMemberId: '',
    recordDate: new Date().toISOString().split('T')[0],
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    bloodSugar: {
      fasting: '',
      postMeal: '',
      random: ''
    },
    weight: {
      value: '',
      unit: 'kg'
    },
    height: {
      value: '',
      unit: 'cm'
    },
    temperature: {
      value: '',
      unit: 'fahrenheit'
    },
    heartRate: {
      value: ''
    },
    oxygenSaturation: {
      value: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const response = await familyMembersAPI.getFamilyMembers();
      console.log('Vitals - Family members API response:', response.data);
      
      if (response.data.success) {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.familyMemberId) {
      toast.error('Please select a family member');
      return;
    }

    // Check if at least one vital is filled
    const hasVitals = formData.bloodPressure.systolic || 
                     formData.bloodSugar.fasting || 
                     formData.weight.value || 
                     formData.heartRate.value ||
                     formData.temperature.value ||
                     formData.oxygenSaturation.value;

    if (!hasVitals) {
      toast.error('Please fill at least one vital measurement');
      return;
    }

    try {
      setLoading(true);
      
      // Clean up empty values
      const cleanedData = { ...formData };
      
      // Remove empty blood pressure
      if (!cleanedData.bloodPressure.systolic && !cleanedData.bloodPressure.diastolic) {
        delete cleanedData.bloodPressure;
      }
      
      // Remove empty blood sugar
      if (!cleanedData.bloodSugar.fasting && !cleanedData.bloodSugar.postMeal && !cleanedData.bloodSugar.random) {
        delete cleanedData.bloodSugar;
      }
      
      // Remove empty weight
      if (!cleanedData.weight.value) {
        delete cleanedData.weight;
      }
      
      // Remove empty height
      if (!cleanedData.height.value) {
        delete cleanedData.height;
      }
      
      // Remove empty temperature
      if (!cleanedData.temperature.value) {
        delete cleanedData.temperature;
      }
      
      // Remove empty heart rate
      if (!cleanedData.heartRate.value) {
        delete cleanedData.heartRate;
      }
      
      // Remove empty oxygen saturation
      if (!cleanedData.oxygenSaturation.value) {
        delete cleanedData.oxygenSaturation;
      }

      // Handle self selection
      if (cleanedData.familyMemberId === 'self') {
        delete cleanedData.familyMemberId;
      }

      const response = await vitalsAPI.createVital(cleanedData);
      
      if (response.data.success) {
        toast.success('Vitals recorded successfully!');
        navigate('/vitals');
      }
    } catch (error) {
      console.error('Error saving vitals:', error);
      toast.error(error.response?.data?.message || 'Failed to save vitals');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/vitals')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Record Vitals</h1>
              <p className="text-gray-600 mt-2">صحت کی پیمائشیں ریکارڈ کریں</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Member *
                  </label>
                  <select
                    required
                    value={formData.familyMemberId}
                    onChange={(e) => handleInputChange(null, 'familyMemberId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select family member</option>
                    {familyMembers.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.relationship === 'self' ? 'Self' : member.relationship})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.recordDate}
                    onChange={(e) => handleInputChange(null, 'recordDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Vital Signs Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Blood Pressure */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Blood Pressure</h3>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Systolic (mmHg)
                        </label>
                        <input
                          type="number"
                          min="80"
                          max="250"
                          value={formData.bloodPressure.systolic}
                          onChange={(e) => handleInputChange('bloodPressure', 'systolic', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diastolic (mmHg)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="150"
                          value={formData.bloodPressure.diastolic}
                          onChange={(e) => handleInputChange('bloodPressure', 'diastolic', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="80"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Heart Rate</h3>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beats per minute (BPM)
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="200"
                        value={formData.heartRate.value}
                        onChange={(e) => handleInputChange('heartRate', 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="72"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Weight</h3>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="300"
                          step="0.1"
                          value={formData.weight.value}
                          onChange={(e) => handleInputChange('weight', 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="70"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit
                        </label>
                        <select
                          value={formData.weight.unit}
                          onChange={(e) => handleInputChange('weight', 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Height */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Ruler className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Height</h3>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Height
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="250"
                          step="0.1"
                          value={formData.height.value}
                          onChange={(e) => handleInputChange('height', 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="170"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit
                        </label>
                        <select
                          value={formData.height.unit}
                          onChange={(e) => handleInputChange('height', 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="cm">cm</option>
                          <option value="ft">ft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Temperature</h3>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature
                        </label>
                        <input
                          type="number"
                          min="90"
                          max="110"
                          step="0.1"
                          value={formData.temperature.value}
                          onChange={(e) => handleInputChange('temperature', 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="98.6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit
                        </label>
                        <select
                          value={formData.temperature.unit}
                          onChange={(e) => handleInputChange('temperature', 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="fahrenheit">°F</option>
                          <option value="celsius">°C</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oxygen Saturation */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-5 h-5 text-teal-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Oxygen Saturation</h3>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SpO2 (%)
                      </label>
                      <input
                        type="number"
                        min="70"
                        max="100"
                        value={formData.oxygenSaturation.value}
                        onChange={(e) => handleInputChange('oxygenSaturation', 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="98"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Sugar */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Blood Sugar</h3>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fasting (mg/dL)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="400"
                        value={formData.bloodSugar.fasting}
                        onChange={(e) => handleInputChange('bloodSugar', 'fasting', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post Meal (mg/dL)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="400"
                        value={formData.bloodSugar.postMeal}
                        onChange={(e) => handleInputChange('bloodSugar', 'postMeal', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="140"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Random (mg/dL)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="400"
                        value={formData.bloodSugar.random}
                        onChange={(e) => handleInputChange('bloodSugar', 'random', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="120"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="4"
                  placeholder="Any symptoms, medications taken, or additional notes..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/vitals')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Save Vitals'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default VitalAdd;
