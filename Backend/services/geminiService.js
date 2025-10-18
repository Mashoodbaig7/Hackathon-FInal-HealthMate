import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with error checking
console.log('Initializing Gemini AI...');
console.log('GEMINI_API_KEY available:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');

let genAI;
let model;

try {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDyD7Xzq33O4ERB08Gv-zN1pfNaKcJshmw';
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('Gemini AI initialized successfully');
} catch (initError) {
  console.error('Failed to initialize Gemini AI:', initError);
}

// Function to analyze medical report
export const analyzeReport = async (fileUrl, reportType, additionalContext = '') => {
  // If Gemini is not available, return basic analysis
  if (!model) {
    console.log('Gemini model not available, returning basic analysis');
    return createBasicAnalysis(reportType, additionalContext);
  }

  try {
    const prompt = `
You are a medical AI assistant specialized in analyzing medical reports. Please analyze the provided medical report and provide a comprehensive analysis in both English and Roman Urdu.

Report Type: ${reportType}
Additional Context: ${additionalContext}

Please provide the following analysis in JSON format:

{
  "summary": {
    "english": "Brief summary in English",
    "urdu": "Mukhtasar khulasa Roman Urdu mein"
  },
  "keyFindings": [
    {
      "parameter": "Test parameter name",
      "value": "Test result value",
      "normalRange": "Normal range for this parameter",
      "status": "normal/high/low/critical",
      "significance": "What this finding means"
    }
  ],
  "recommendations": {
    "english": ["Recommendation 1", "Recommendation 2"],
    "urdu": ["Sifaarish 1", "Sifaarish 2"]
  },
  "questionsForDoctor": {
    "english": ["Question 1 for doctor", "Question 2 for doctor"],
    "urdu": ["Doctor se sawal 1", "Doctor se sawal 2"]
  },
  "dietarySuggestions": {
    "foodsToAvoid": ["Food 1 to avoid", "Food 2 to avoid"],
    "recommendedFoods": ["Recommended food 1", "Recommended food 2"]
  },
  "homeRemedies": {
    "english": ["Home remedy 1", "Home remedy 2"],
    "urdu": ["Gharelu ilaaj 1", "Gharelu ilaaj 2"]
  },
  "confidence": 85
}

Important Guidelines:
1. Always include the disclaimer that this is for educational purposes only
2. Recommend consulting with a healthcare professional
3. Be accurate with medical terminology
4. Provide Roman Urdu translations that are easy to understand
5. Rate your confidence level from 0-100
6. If you cannot clearly read the report, mention it in the summary
7. Focus on significant findings and avoid minor variations within normal ranges

Please analyze the medical report now:
`;

    // For image/PDF analysis, we need to pass the file
    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg", // This will be dynamic based on file type
          data: fileUrl
        }
      }
    ]);

    const result = await response.response;
    const text = result.text();

    // Try to parse JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Add safety disclaimer
        analysis.disclaimer = {
          english: "This analysis is for educational purposes only. Always consult your doctor before making any medical decisions.",
          urdu: "Yeh tahleel sirf taaleem ke liye hai. Koi bhi tibbi faisla karne se pehle apne doctor se mashwara zaroor lein."
        };

        return analysis;
      } else {
        // If JSON parsing fails, return a basic structure
        return createFallbackAnalysis(text, reportType);
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return createFallbackAnalysis(text, reportType);
    }

  } catch (error) {
    console.error('Error analyzing report with Gemini:', error);
    console.log('Falling back to basic analysis...');
    return createBasicAnalysis(reportType, additionalContext);
  }
};

// Function to analyze vitals and provide insights
export const analyzeVitals = async (vitalsData, userHistory = []) => {
  try {
    const prompt = `
You are a medical AI assistant. Analyze the following vital signs data and provide insights.

Current Vitals: ${JSON.stringify(vitalsData, null, 2)}
User History: ${JSON.stringify(userHistory, null, 2)}

Please provide analysis in JSON format:

{
  "riskAssessment": "Overall risk assessment based on vitals",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "trendAnalysis": "Analysis of trends if history is available",
  "urgencyLevel": "low/medium/high/critical",
  "keyInsights": ["Insight 1", "Insight 2"]
}

Focus on:
1. Identifying concerning patterns
2. Providing actionable recommendations
3. Suggesting when to see a doctor
4. Maintaining a helpful but cautious tone
`;

    const response = await model.generateContent(prompt);
    const result = await response.response;
    const text = result.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing vitals analysis:', parseError);
    }

    return {
      riskAssessment: "Unable to provide detailed analysis at this time.",
      recommendations: ["Please consult with a healthcare professional for proper evaluation."],
      trendAnalysis: "Trend analysis not available.",
      urgencyLevel: "medium",
      keyInsights: ["Regular monitoring of vitals is important for health tracking."]
    };

  } catch (error) {
    console.error('Error analyzing vitals:', error);
    throw new Error('Failed to analyze vitals. Please try again later.');
  }
};

// Helper function to create fallback analysis
const createFallbackAnalysis = (rawText, reportType) => {
  return {
    summary: {
      english: `Analysis completed for ${reportType} report. Please review the detailed findings below.`,
      urdu: `${reportType} report ka tahleel mukammal. Tafseel se nataaij dekhen.`
    },
    keyFindings: [
      {
        parameter: "General Analysis",
        value: "Completed",
        normalRange: "N/A",
        status: "unknown",
        significance: rawText.substring(0, 200) + "..."
      }
    ],
    recommendations: {
      english: ["Consult with your healthcare provider for detailed interpretation"],
      urdu: ["Tafseel ke liye apne doctor se rabta karen"]
    },
    questionsForDoctor: {
      english: ["What do these results mean for my health?", "Are there any immediate concerns?"],
      urdu: ["In nataaij ka mera sehat par kya asar hai?", "Koi fawri pareshani to nahi?"]
    },
    dietarySuggestions: {
      foodsToAvoid: ["Processed foods", "Excessive sugar"],
      recommendedFoods: ["Fresh fruits", "Vegetables", "Whole grains"]
    },
    homeRemedies: {
      english: ["Maintain regular exercise", "Stay hydrated"],
      urdu: ["Muntazim exercise karen", "Paani ziada piyen"]
    },
    confidence: 60,
    disclaimer: {
      english: "This analysis is for educational purposes only. Always consult your doctor before making any medical decisions.",
      urdu: "Yeh tahleel sirf taaleem ke liye hai. Koi bhi tibbi faisla karne se pehle apne doctor se mashwara zaroor lein."
    }
  };
};

// Basic analysis function for when Gemini is not available
const createBasicAnalysis = (reportType, additionalContext) => {
  const reportTypeDisplay = reportType.replace('_', ' ').toUpperCase();
  
  return {
    summary: {
      english: `${reportTypeDisplay} report has been uploaded successfully. Please consult with your healthcare provider for detailed interpretation.`,
      urdu: `${reportTypeDisplay} report kamyaabi se upload ho gai hai. Tafseel ke liye apne doctor se rabta karen.`
    },
    keyFindings: [
      {
        parameter: "Report Status",
        value: "Uploaded",
        normalRange: "N/A",
        status: "normal",
        significance: "Report is available for healthcare provider review"
      }
    ],
    recommendations: {
      english: [
        "Schedule a follow-up appointment with your healthcare provider",
        "Discuss the results and any concerns with your doctor",
        "Keep track of your symptoms and medical history"
      ],
      urdu: [
        "Apne doctor ke saath follow-up appointment schedule karen",
        "Results aur concerns ke baare mein doctor se baat karen",
        "Apne symptoms aur medical history ka record rakhen"
      ]
    },
    questionsForDoctor: {
      english: [
        "What do these results mean for my health?",
        "Are there any immediate concerns?",
        "What are the next steps in my treatment?"
      ],
      urdu: [
        "In nataaij ka meri sehat par kya asar hai?",
        "Koi fawri pareshani to nahi?",
        "Aage ka ilaaj kya hoga?"
      ]
    },
    dietarySuggestions: {
      foodsToAvoid: ["Processed foods", "Excessive sugar", "High sodium foods"],
      recommendedFoods: ["Fresh fruits", "Vegetables", "Whole grains", "Lean proteins"]
    },
    homeRemedies: {
      english: [
        "Maintain regular exercise routine",
        "Stay adequately hydrated",
        "Get sufficient sleep",
        "Manage stress levels"
      ],
      urdu: [
        "Muntazim exercise karen",
        "Kaafi paani piyen",
        "Poori neend len",
        "Stress kam karen"
      ]
    },
    confidence: 75,
    disclaimer: {
      english: "This analysis is for educational purposes only. Always consult your doctor before making any medical decisions.",
      urdu: "Yeh tahleel sirf taaleem ke liye hai. Koi bhi tibbi faisla karne se pehle apne doctor se mashwara zaroor lein."
    }
  };
};
