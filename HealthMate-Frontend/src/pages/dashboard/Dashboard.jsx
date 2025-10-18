import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Activity,
  Upload,
  Plus,
  TrendingUp,
  Heart,
  Calendar,
  AlertCircle,
  BarChart3,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import FamilyMembersSection from '../../components/family/FamilyMembersSection';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, reportsAPI, vitalsAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await userAPI.getDashboard();
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      name: 'Total Reports',
      value: dashboardData?.summary?.totalReports || 0,
      change: `+${dashboardData?.summary?.recentReports || 0} this month`,
      icon: FileText,
      color: 'bg-blue-500',
      href: '/reports'
    },
    {
      name: 'Vitals Recorded',
      value: dashboardData?.summary?.totalVitals || 0,
      change: `+${dashboardData?.summary?.recentVitals || 0} this month`,
      icon: Activity,
      color: 'bg-green-500',
      href: '/vitals'
    },
    {
      name: 'Health Score',
      value: '85%',
      change: '+5% from last month',
      icon: Heart,
      color: 'bg-red-500',
      href: '/profile'
    },
    {
      name: 'Days Active',
      value: '12',
      change: 'Current streak',
      icon: Calendar,
      color: 'bg-purple-500',
      href: '/profile'
    }
  ];

  const quickActions = [
    {
      name: 'Upload Report',
      description: 'Upload karo aur AI analysis pao',
      icon: Upload,
      href: '/reports/upload',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      name: 'Add Vitals',
      description: 'BP, Sugar, Weight record karen',
      icon: Plus,
      href: '/vitals/add',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'View Timeline',
      description: 'Complete health history dekhen',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2">
                  Assalam-o-Alaikum, {user?.name}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Aaj aapki sehat kaise hai? Let's check your health dashboard.
                </p>
                <p className="text-blue-200 text-sm mt-2">
                  Today is {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </p>
              </div>
              <div className="hidden lg:block">
                <Heart className="h-24 w-24 text-white opacity-20" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Health Overview
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Link
                key={stat.name}
                to={stat.href}
                className="card-hover transform hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.name}
                to={action.href}
                className="group"
              >
                <div className={`${action.color} text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 transform group-hover:scale-105`}>
                  <action.icon className="h-8 w-8 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{action.name}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                  <ArrowRight className="h-5 w-5 mt-3 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <Link to="/reports" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            
            {dashboardData?.recent?.latestReport ? (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">
                      {dashboardData.recent.latestReport.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {dashboardData.recent.latestReport.reportType.replace('_', ' ')} • {' '}
                      {format(new Date(dashboardData.recent.latestReport.reportDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No reports uploaded yet</p>
                <Link to="/reports/upload" className="btn-primary">
                  Upload First Report
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recent Vitals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Latest Vitals</h3>
              <Link to="/vitals" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            
            {dashboardData?.recent?.latestVital ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {dashboardData.recent.latestVital.bloodPressure && (
                      <div>
                        <p className="text-sm text-gray-500">Blood Pressure</p>
                        <p className="font-semibold">
                          {dashboardData.recent.latestVital.bloodPressure.systolic}/
                          {dashboardData.recent.latestVital.bloodPressure.diastolic}
                        </p>
                      </div>
                    )}
                    {dashboardData.recent.latestVital.weight && (
                      <div>
                        <p className="text-sm text-gray-500">Weight</p>
                        <p className="font-semibold">
                          {dashboardData.recent.latestVital.weight.value} {dashboardData.recent.latestVital.weight.unit}
                        </p>
                      </div>
                    )}
                    {dashboardData.recent.latestVital.heartRate && (
                      <div>
                        <p className="text-sm text-gray-500">Heart Rate</p>
                        <p className="font-semibold">
                          {dashboardData.recent.latestVital.heartRate.value} bpm
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {format(new Date(dashboardData.recent.latestVital.recordDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No vitals recorded yet</p>
                <Link to="/vitals/add" className="btn-primary">
                  Add First Reading
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Health Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Today's Health Tip
              </h3>
              <p className="text-gray-700">
                <span className="font-medium">Stay Hydrated!</span> پانی زیادہ پیئیں - کم از کم 8 گلاس روزانہ۔ 
                Proper hydration helps maintain healthy blood pressure and supports overall well-being.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-1 text-red-500" />
                <span>Recommended by HealthMate AI</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Family Members Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
        >
          <FamilyMembersSection />
        </motion.div>

        {/* Report Types Analytics */}
        {dashboardData?.analytics?.reportTypes?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Report Types Distribution
            </h3>
            <div className="space-y-3">
              {dashboardData.analytics.reportTypes.slice(0, 5).map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 bg-primary-${(index + 1) * 100}`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
