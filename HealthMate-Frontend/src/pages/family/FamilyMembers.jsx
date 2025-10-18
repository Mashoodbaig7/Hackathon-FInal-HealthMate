import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Calendar,
  Heart,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Save,
  FileText,
  Activity,
  MapPin,
  Shield,
  Stethoscope,
  Baby,
  UserCheck
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { familyMembersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const FamilyMembers = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    phoneNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    medicalConditions: [],
    allergies: [],
    currentMedications: []
  });

  const relationships = [
    { value: 'mother', label: 'Mother', icon: '👩', color: 'bg-pink-100 text-pink-700' },
    { value: 'father', label: 'Father', icon: '👨', color: 'bg-blue-100 text-blue-700' },
    { value: 'wife', label: 'Wife', icon: '👩‍💼', color: 'bg-purple-100 text-purple-700' },
    { value: 'husband', label: 'Husband', icon: '👨‍💼', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'son', label: 'Son', icon: '👦', color: 'bg-green-100 text-green-700' },
    { value: 'daughter', label: 'Daughter', icon: '👧', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'brother', label: 'Brother', icon: '👨‍🦱', color: 'bg-teal-100 text-teal-700' },
    { value: 'sister', label: 'Sister', icon: '👩‍🦱', color: 'bg-orange-100 text-orange-700' },
    { value: 'grandfather', label: 'Grandfather', icon: '👴', color: 'bg-gray-100 text-gray-700' },
    { value: 'grandmother', label: 'Grandmother', icon: '👵', color: 'bg-red-100 text-red-700' },
    { value: 'other', label: 'Other', icon: '👤', color: 'bg-slate-100 text-slate-700' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const response = await familyMembersAPI.getFamilyMembers();
      console.log('Family members response:', response.data);
      
      if (response.data.success) {
        setFamilyMembers(response.data.data.familyMembers || []);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      phoneNumber: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      },
      medicalConditions: [],
      allergies: [],
      currentMedications: []
    });
    setEditingMember(null);
    setShowAddModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data according to schema
      const memberData = {
        name: formData.name.trim(),
        relationship: formData.relationship,
        gender: formData.gender || undefined,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
        emergencyContact: (formData.emergencyContact.name || formData.emergencyContact.phone) ? formData.emergencyContact : undefined,
        medicalConditions: formData.medicalConditions.length > 0 ? formData.medicalConditions : undefined,
        allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
        currentMedications: formData.currentMedications.length > 0 ? formData.currentMedications : undefined
      };

      // Remove undefined values and empty strings
      Object.keys(memberData).forEach(key => {
        if (memberData[key] === undefined || memberData[key] === '' || memberData[key] === null) {
          delete memberData[key];
        }
      });

      console.log('Sending member data:', memberData);

      if (editingMember) {
        const response = await familyMembersAPI.updateFamilyMember(editingMember._id, memberData);
        if (response.data.success) {
          toast.success('Family member updated successfully');
          setFamilyMembers(prev => 
            prev.map(member => 
              member._id === editingMember._id ? response.data.data.familyMember : member
            )
          );
        }
      } else {
        const response = await familyMembersAPI.createFamilyMember(memberData);
        if (response.data.success) {
          toast.success('Family member added successfully');
          setFamilyMembers(prev => [...prev, response.data.data.familyMember]);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving family member:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save family member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      relationship: member.relationship || '',
      dateOfBirth: member.dateOfBirth ? format(new Date(member.dateOfBirth), 'yyyy-MM-dd') : '',
      gender: member.gender || '',
      bloodGroup: member.bloodGroup || '',
      phoneNumber: member.phoneNumber || '',
      emergencyContact: member.emergencyContact || { name: '', phone: '', relation: '' },
      medicalConditions: member.medicalConditions || [],
      allergies: member.allergies || [],
      currentMedications: member.currentMedications || []
    });
    setShowAddModal(true);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this family member?')) {
      return;
    }

    try {
      await familyMembersAPI.deleteFamilyMember(memberId);
      toast.success('Family member deleted successfully');
      setFamilyMembers(prev => prev.filter(member => member._id !== memberId));
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast.error('Failed to delete family member');
    }
  };

  const getRelationshipInfo = (relationship) => {
    return relationships.find(r => r.value === relationship) || relationships[relationships.length - 1];
  };

  const filteredMembers = familyMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.relationship.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || member.relationship === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
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
              <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
              <p className="text-gray-600 mt-1">اپنے خاندان کے افراد کی صحت کا خیال رکھیں</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{familyMembers.length} members</span>
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Family Member</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search family members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Relations</option>
                  {relationships.map(rel => (
                    <option key={rel.value} value={rel.value}>{rel.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Family Members Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No matching family members' : 'No family members added yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first family member to start managing their health records'
                }
              </p>
              <p className="text-gray-500 text-sm mb-6 italic">
                Apne ghar walon ko add karen unki sehat ka khayal rakhne ke liye
              </p>
              {!searchTerm && filterBy === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  Add First Family Member
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => {
                const relationshipInfo = getRelationshipInfo(member.relationship);
                const age = calculateAge(member.dateOfBirth);
                
                return (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Member Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full ${relationshipInfo.color} flex items-center justify-center text-xl`}>
                          {relationshipInfo.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{member.relationship}</p>
                          {age && (
                            <p className="text-xs text-gray-500">{age} years old</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="space-y-3">
                      {member.gender && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="capitalize">{member.gender}</span>
                        </div>
                      )}
                      
                      {member.bloodGroup && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{member.bloodGroup}</span>
                        </div>
                      )}
                      
                      {member.phoneNumber && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{member.phoneNumber}</span>
                        </div>
                      )}
                      
                      {member.dateOfBirth && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(member.dateOfBirth), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Health Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                            <FileText className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-gray-600">Reports</p>
                          <p className="text-sm font-medium text-gray-900">{member.totalReports || 0}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                            <Activity className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-gray-600">Vitals</p>
                          <p className="text-sm font-medium text-gray-900">{member.totalVitals || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    {member.medicalConditions && member.medicalConditions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-2">Medical Conditions:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.medicalConditions.slice(0, 2).map((condition, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              {condition.condition}
                            </span>
                          ))}
                          {member.medicalConditions.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{member.medicalConditions.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Allergies */}
                    {member.allergies && member.allergies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-2">Allergies:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.allergies.slice(0, 2).map((allergy, idx) => (
                            <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              {allergy}
                            </span>
                          ))}
                          {member.allergies.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{member.allergies.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship *
                        </label>
                        <select
                          required
                          value={formData.relationship}
                          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select relationship</option>
                          {relationships.map(rel => (
                            <option key={rel.value} value={rel.value}>
                              {rel.icon} {rel.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          {genderOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Group
                        </label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select blood group</option>
                          {bloodGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., +92300-1234567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContact.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Contact person name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.emergencyContact.phone}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Emergency contact number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContact.relation}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Friend, Neighbor"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingMember ? 'Update Member' : 'Add Member'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FamilyMembers;
