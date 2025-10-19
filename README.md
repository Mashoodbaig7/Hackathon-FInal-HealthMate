<img width="1920" height="1026" alt="image" src="https://github.com/user-attachments/assets/de0a8f56-1960-498d-842d-8cbdb94924c5" />


# HealthMate - Sehat ka Smart Dost 🏥

A bilingual (English + Roman Urdu) AI-powered personal health companion app built with React and Node.js, featuring Gemini AI for medical report analysis.

## 🌟 Features

- **AI-Powered Report Analysis**: Upload medical reports and get instant AI analysis in both English and Roman Urdu
- **Health Timeline**: Track your complete medical history with charts and trends
- **Vitals Tracking**: Record BP, Sugar, Weight, and other vital signs manually
- **Bilingual Support**: Full support for English and Roman Urdu explanations
- **Secure Storage**: Your data is encrypted and stored securely
- **Modern UI**: Beautiful, responsive design with smooth animations

## 🚀 Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary** for file storage
- **Google Gemini AI** for report analysis
- **Bcrypt** for password hashing
- **Multer** for file uploads

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Google Gemini API key

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthmate
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the HealthMate-Frontend directory:
```bash
cd HealthMate-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## 📱 Usage

1. **Registration**: Create a new account with your details
2. **Dashboard**: View your health overview and quick actions
3. **Upload Reports**: Upload medical reports (PDF/Images) for AI analysis
4. **Add Vitals**: Manually record vital signs like BP, Sugar, Weight
5. **View Timeline**: Track your health progress over time
6. **AI Analysis**: Get bilingual explanations of your medical reports

## 🔧 Configuration

### Getting API Keys

1. **Gemini AI API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

2. **Cloudinary**:
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get your cloud name, API key, and API secret
   - Add them to your `.env` file

3. **MongoDB**:
   - Use local MongoDB or [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Update the connection string in `.env`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Reports
- `GET /api/reports` - Get user reports
- `POST /api/reports/upload` - Upload new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Vitals
- `GET /api/vitals` - Get user vitals
- `POST /api/vitals` - Create new vital record
- `GET /api/vitals/:id` - Get specific vital
- `PUT /api/vitals/:id` - Update vital
- `DELETE /api/vitals/:id` - Delete vital

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/dashboard` - Get dashboard data

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload with type checking
- Environment variables for sensitive data

## 🌍 Internationalization

The app supports:
- **English**: Full interface and AI explanations
- **Roman Urdu**: AI explanations and key terms for better understanding

## 📊 AI Features

- **Medical Report Analysis**: Gemini AI reads and explains reports
- **Bilingual Summaries**: Explanations in both English and Roman Urdu
- **Key Findings**: Highlights important test results
- **Recommendations**: Suggests follow-up questions for doctors
- **Dietary Suggestions**: Food recommendations based on reports
- **Home Remedies**: Safe home care suggestions

## 🚧 Future Features

- [ ] Mobile app (React Native)
- [ ] Medication reminders
- [ ] Doctor appointment scheduling
- [ ] Family member access
- [ ] Health insurance integration
- [ ] Voice input for vitals
- [ ] WhatsApp integration
- [ ] PDF report generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ for the healthcare community.

## 📞 Support

For support, email mashoodbaig567@gmail.com or join our community chat.

---

**Disclaimer**: HealthMate is for educational and informational purposes only. Always consult healthcare professionals for medical advice.
"# Hackathon-FInal-HealthMate" 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4b92e34f-8617-4a40-b174-a3d7a284ce3b" />

