import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  User, 
  Calendar, 
  Phone, 
  Edit3, 
  Trash2, 
  FileText, 
  Activity,
  UserPlus,
  Heart,
  AlertCircle
} from 'lucide-react';
import { familyMembersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FamilyMembersSection = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    bloodGroup: '',
    medicalConditions: [],
    allergies: [],
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  const relationships = [
    { value: 'self', label: 'Self' },
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'wife', label: 'Wife' },
    { value: 'husband', label: 'Husband' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const response = await familyMembersAPI.getFamilyMembers();
      if (response.data.success) {
        setFamilyMembers(response.data.data.familyMembers);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
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
        medicalConditions: formData.medicalConditions.length > 0 ? formData.medicalConditions : undefined,
        allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
        emergencyContact: (formData.emergencyContact.name || formData.emergencyContact.phone) ? formData.emergencyContact : undefined
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
      name: member.name,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
      gender: member.gender || '',
      phoneNumber: member.phoneNumber || '',
      bloodGroup: member.bloodGroup || '',
      medicalConditions: member.medicalConditions || [],
      allergies: member.allergies || [],
      emergencyContact: member.emergencyContact || { name: '', phone: '', relation: '' }
    });
    setShowAddModal(true);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this family member?')) return;
    
    try {
      const response = await familyMembersAPI.deleteFamilyMember(memberId);
      if (response.data.success) {
        toast.success('Family member deleted successfully');
        setFamilyMembers(prev => prev.filter(member => member._id !== memberId));
      }
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast.error('Failed to delete family member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      bloodGroup: '',
      medicalConditions: [],
      allergies: [],
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      }
    });
    setEditingMember(null);
    setShowAddModal(false);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Family Members</h2>
          <p className="text-gray-600">خاندانی اراکین کی فہرست</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Family Members Grid */}
      {familyMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Member Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-primary-100 text-sm">{member.relationship}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Member Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Age: {calculateAge(member.dateOfBirth)}</span>
                  </div>
                  {member.bloodGroup && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{member.bloodGroup}</span>
                    </div>
                  )}
                  {member.phoneNumber && (
                    <div className="flex items-center space-x-2 text-gray-600 col-span-2">
                      <Phone className="w-4 h-4" />
                      <span>{member.phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* Medical Conditions */}
                {member.medicalConditions && member.medicalConditions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>Medical Conditions</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {member.medicalConditions.map((condition, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                        >
                          {typeof condition === 'string' ? condition : condition.condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-100 flex space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Reports</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Vitals</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
        >
          <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Family Members Added</h3>
          <p className="text-gray-600 mb-6">
            Start by adding your family members to track their health records
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add First Member
          </button>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
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
                        <option key={rel.value} value={rel.value}>{rel.label}</option>
                      ))}
                    </select>
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
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
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
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+92 300 1234567"
                    />
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
                      Medical Conditions
                    </label>
                    <textarea
                      value={formData.medicalConditions.map(mc => typeof mc === 'string' ? mc : mc.condition).join(', ')}
                      onChange={(e) => {
                        const conditions = e.target.value.split(',').map(condition => condition.trim()).filter(c => c);
                        setFormData({ 
                          ...formData, 
                          medicalConditions: conditions.map(condition => ({
                            condition,
                            diagnosedDate: new Date(),
                            status: 'active'
                          }))
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows="2"
                      placeholder="Enter conditions separated by commas (e.g., Diabetes, Hypertension)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    <textarea
                      value={formData.allergies.join(', ')}
                      onChange={(e) => {
                        const allergies = e.target.value.split(',').map(allergy => allergy.trim()).filter(a => a);
                        setFormData({ ...formData, allergies });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows="2"
                      placeholder="Enter allergies separated by commas (e.g., Peanuts, Shellfish)"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {editingMember ? 'Update' : 'Add'} Member
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyMembersSection;
