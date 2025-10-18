import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Brain, 
  Upload, 
  BarChart3, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Upload Medical Reports',
      description: 'Apni medical reports upload karen aur AI se instant analysis hasil karen',
      englishDesc: 'Upload your medical reports and get instant AI analysis'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Gemini AI aapko simple words mein samjhata hai ke report ka kya matlab hai',
      englishDesc: 'Gemini AI explains your reports in simple terms'
    },
    {
      icon: BarChart3,
      title: 'Health Timeline',
      description: 'Apni poori health history ek jagah dekhen - charts aur trends ke saath',
      englishDesc: 'View your complete health history with charts and trends'
    },
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Aapka data bilkul safe hai - encrypted aur private',
      englishDesc: 'Your data is completely secure - encrypted and private'
    },
    {
      icon: Heart,
      title: 'Vitals Tracking',
      description: 'BP, Sugar, Weight track karen aur AI recommendations paaen',
      englishDesc: 'Track BP, Sugar, Weight and get AI recommendations'
    },
    {
      icon: Globe,
      title: 'Bilingual Support',
      description: 'English aur Roman Urdu dono mein explanations',
      englishDesc: 'Explanations in both English and Roman Urdu'
    }
  ];

  const testimonials = [
    {
      name: 'Ahmed Hassan',
      role: 'Software Engineer',
      quote: 'HealthMate ne meri family ke medical records organize karne mein bohat madad ki hai. Ab doctor ke paas jaate waqt sab kuch ready hota hai.',
      rating: 5
    },
    {
      name: 'Dr. Fatima Khan',
      role: 'Family Physician',
      quote: 'My patients love how HealthMate explains their reports in simple terms. It makes my consultations more effective.',
      rating: 5
    },
    {
      name: 'Sana Ali',
      role: 'Mother of 2',
      quote: 'Bachon ke vaccination records aur regular checkups track karna ab itna easy ho gaya hai. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-heading font-bold text-gray-900">
                Health<span className="text-primary-600">Mate</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
                Sehat ka <span className="text-yellow-300">Smart Dost</span>
              </h1>
              
              <p className="text-xl lg:text-2xl mb-4 text-blue-100">
                Your AI-powered health companion
              </p>
              
              <p className="text-lg mb-8 text-blue-100">
                Medical reports ko samjhna ab itna easy! AI ke saath apni health ko track karen,
                insights payen aur doctor ke saath behtar communication karen.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-center"
                >
                  Start Your Health Journey
                </Link>
                <button className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Watch Demo
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:text-right"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg p-4 mb-3">
                      <Upload className="h-8 w-8 mx-auto text-white" />
                    </div>
                    <p className="text-sm font-medium">Upload Reports</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg p-4 mb-3">
                      <Brain className="h-8 w-8 mx-auto text-white" />
                    </div>
                    <p className="text-sm font-medium">AI Analysis</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg p-4 mb-3">
                      <BarChart3 className="h-8 w-8 mx-auto text-white" />
                    </div>
                    <p className="text-sm font-medium">Track Trends</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg p-4 mb-3">
                      <Heart className="h-8 w-8 mx-auto text-white" />
                    </div>
                    <p className="text-sm font-medium">Stay Healthy</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Kyun Choose Karen HealthMate?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Health management ko simple, smart aur secure banane ke liye modern technology ka best use
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  {feature.description}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {feature.englishDesc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Kaise Kaam Karta Hai?
            </h2>
            <p className="text-xl text-gray-600">
              Sirf 3 simple steps mein apni health ko manage karen
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Your Reports',
                description: 'Medical reports ya test results upload karen - PDF, images, kuch bhi'
              },
              {
                step: '2',
                title: 'Get AI Analysis',
                description: 'Gemini AI aapko simple words mein explain karega ke report ka matlab kya hai'
              },
              {
                step: '3',
                title: 'Track & Improve',
                description: 'Timeline dekhen, trends samjhen aur better health decisions len'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
                {index < 2 && (
                  <ArrowRight className="h-6 w-6 text-primary-600 mx-auto mt-6 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Users Kya Kehte Hain?
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from our happy users
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who trust HealthMate for their health management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Create Free Account
            </Link>
            <Link
              to="/auth/login"
              className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Already have account? Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-heading font-bold">
                  Health<span className="text-primary-400">Mate</span>
                </span>
              </div>
              <p className="text-gray-400">
                Sehat ka smart dost - AI-powered health companion for everyone
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HealthMate. All rights reserved. Made with ❤️ for better health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
