import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Download, Languages, Users, TrendingUp, FileText } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration using environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'your_supabase_url_here' && 
  SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here';

// Create Supabase client
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Database functions
const insertSurveyResponse = async (surveyData) => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage if Supabase is not configured
    const existingData = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const newResponse = {
      id: Date.now(),
      age: surveyData.age,
      gender: surveyData.gender,
      location: surveyData.location,
      income: surveyData.income,
      original_response: surveyData.response,
      translated_response: surveyData.translatedResponse,
      sentiment: surveyData.sentiment,
      language: surveyData.language,
      created_at: new Date().toISOString()
    };
    
    const updatedData = [newResponse, ...existingData];
    localStorage.setItem('surveyResponses', JSON.stringify(updatedData));
    return newResponse;
  }

  try {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{
        age: surveyData.age,
        gender: surveyData.gender,
        location: surveyData.location,
        income: surveyData.income,
        original_response: surveyData.response,
        translated_response: surveyData.translatedResponse,
        sentiment: surveyData.sentiment,
        language: surveyData.language,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error inserting survey response:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const fetchSurveyResponses = async () => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage if Supabase is not configured
    return JSON.parse(localStorage.getItem('surveyResponses') || '[]');
  }

  try {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching survey responses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const COLORS = ['#10B981', '#EF4444', '#6B7280'];

// Simulated translation function (replace with actual Google Translate API)
const translateText = async (text, targetLang) => {
  // Simulated translation - replace with actual API call
  const translations = {
    'en': {
      'What are your thoughts on the recent medicine price increase in Pakistan?': 'What are your thoughts on the recent medicine price increase in Pakistan?',
      'Submit Survey': 'Submit Survey',
      'Thank you for your response!': 'Thank you for your response!'
    },
    'ur': {
      'What are your thoughts on the recent medicine price increase in Pakistan?': 'پاکستان میں دواؤں کی قیمتوں میں حالیہ اضافے کے بارے میں آپ کا کیا خیال ہے؟',
      'Submit Survey': 'سروے جمع کریں',
      'Thank you for your response!': 'آپ کے جواب کے لیے شکریہ!'
    }
  };
  return translations[targetLang]?.[text] || text;
};

// Simulated sentiment analysis function (replace with OpenAI API)
const analyzeSentiment = async (text) => {
  // Simple keyword-based sentiment for demo (replace with actual AI)
  const positiveWords = ['good', 'excellent', 'great', 'positive', 'happy', 'satisfied', 'اچھا', 'بہترین', 'خوش'];
  const negativeWords = ['bad', 'terrible', 'awful', 'negative', 'sad', 'angry', 'برا', 'غصہ', 'ناراض'];
  
  const lowerText = text.toLowerCase();
  const hasPositive = positiveWords.some(word => lowerText.includes(word));
  const hasNegative = negativeWords.some(word => lowerText.includes(word));
  
  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
};

const SurveySystem = () => {
  const [currentView, setCurrentView] = useState('survey');
  const [language, setLanguage] = useState('en');
  const [surveyData, setSurveyData] = useState({
    age: '',
    gender: '',
    location: '',
    income: '',
    response: ''
  });
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load existing responses from database
  useEffect(() => {
    const loadResponses = async () => {
      try {
        const data = await fetchSurveyResponses();
        setResponses(data);
      } catch (error) {
        console.error('Error loading responses:', error);
      }
    };

    loadResponses();
  }, []);

  // Save responses to database
  const saveResponses = async (responseData) => {
    try {
      await insertSurveyResponse(responseData);
      // Refresh the responses list
      const updatedResponses = await fetchSurveyResponses();
      setResponses(updatedResponses);
    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!surveyData.age || !surveyData.gender || !surveyData.location || !surveyData.income || !surveyData.response) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Translate response to English if in Urdu
      let translatedResponse = surveyData.response;
      if (language === 'ur') {
        // In production, use Google Translate API
        translatedResponse = surveyData.response; // Keep original for demo
      }

      // Analyze sentiment
      const sentiment = await analyzeSentiment(translatedResponse);

      // Save to database
      await saveResponses({
        age: surveyData.age,
        gender: surveyData.gender,
        location: surveyData.location,
        income: surveyData.income,
        response: surveyData.response,
        translatedResponse,
        sentiment,
        language
      });

      // Reset form
      setSurveyData({
        age: '',
        gender: '',
        location: '',
        income: '',
        response: ''
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Data analysis functions
  const analyzeData = () => {
    if (responses.length === 0) return {};

    const segments = responses.reduce((acc, response) => {
      const ageGroup = response.age === '20-35' ? 'young' : 
                     response.age === '35-50' ? 'adult' : 'old';
      
      const segmentKeys = [
        `${response.location}_${response.gender}`,
        `age_${ageGroup}`,
        `income_${response.income}`,
        `overall`
      ];

      segmentKeys.forEach(key => {
        if (!acc[key]) {
          acc[key] = { positive: 0, negative: 0, neutral: 0, total: 0 };
        }
        acc[key][response.sentiment]++;
        acc[key].total++;
      });

      return acc;
    }, {});

    return segments;
  };

  const generateChartData = () => {
    const analysis = analyzeData();
    
    const locationGenderData = [
      { name: 'Urban Male', ...analysis['urban_male'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: 'Urban Female', ...analysis['urban_female'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: 'Rural Male', ...analysis['rural_male'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: 'Rural Female', ...analysis['rural_female'] || { positive: 0, negative: 0, neutral: 0 } }
    ];

    const ageData = [
      { name: 'Young (20-35)', ...analysis['age_young'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: 'Adult (35-50)', ...analysis['age_adult'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: 'Old (50+)', ...analysis['age_old'] || { positive: 0, negative: 0, neutral: 0 } }
    ];

    const incomeData = [
      { name: '<20k', ...analysis['income_<20k'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: '20-50k', ...analysis['income_20-50k'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: '50-100k', ...analysis['income_50-100k'] || { positive: 0, negative: 0, neutral: 0 } },
      { name: '>100k', ...analysis['income_>100k'] || { positive: 0, negative: 0, neutral: 0 } }
    ];

    const overallSentiment = analysis['overall'] || { positive: 0, negative: 0, neutral: 0 };
    const pieData = [
      { name: 'Positive', value: overallSentiment.positive, color: '#10B981' },
      { name: 'Negative', value: overallSentiment.negative, color: '#EF4444' },
      { name: 'Neutral', value: overallSentiment.neutral, color: '#6B7280' }
    ];

    return { locationGenderData, ageData, incomeData, pieData, overallSentiment };
  };

  const exportData = () => {
    const analysis = analyzeData();
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Segment,Positive,Negative,Neutral,Total\n" +
      Object.entries(analysis).map(([key, data]) => 
        `${key},${data.positive},${data.negative},${data.neutral},${data.total}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medicine_survey_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    const { overallSentiment } = generateChartData();
    const total = overallSentiment.positive + overallSentiment.negative + overallSentiment.neutral;
    
    if (total === 0) return "No data available for analysis.";
    
    const positivePercent = ((overallSentiment.positive / total) * 100).toFixed(1);
    const negativePercent = ((overallSentiment.negative / total) * 100).toFixed(1);
    const neutralPercent = ((overallSentiment.neutral / total) * 100).toFixed(1);

    return `
## Medicine Price Increase Survey Analysis

**Overall Sentiment Distribution:**
- Positive responses: ${positivePercent}% (${overallSentiment.positive} responses)
- Negative responses: ${negativePercent}% (${overallSentiment.negative} responses)
- Neutral responses: ${neutralPercent}% (${overallSentiment.neutral} responses)

**Total Responses:** ${total}

**Key Insights:**
${negativePercent > 50 ? 
  "The majority of respondents express negative sentiment towards the medicine price increase, indicating significant public concern." : 
  positivePercent > 50 ? 
  "Surprisingly, most respondents show positive sentiment, which may indicate acceptance or understanding of the price increase." :
  "Public opinion is divided, with no clear majority sentiment emerging from the responses."
}

**Demographic Analysis:**
The data shows varying sentiments across different segments of society, with notable differences between urban and rural populations, age groups, and income levels.
    `.trim();
  };

  if (currentView === 'survey') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {language === 'en' ? 'Medicine Price Survey' : 'دواؤں کی قیمت کا سروے'}
              </h1>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Users className="w-4 h-4 inline mr-2" />
                {language === 'en' ? 'View Results' : 'نتائج دیکھیں'}
              </button>
            </div>

            {showSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {language === 'en' ? 'Thank you for your response!' : 'آپ کے جواب کے لیے شکریہ!'}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Languages className="w-4 h-4 inline mr-2" />
                {language === 'en' ? 'Choose Language' : 'زبان منتخب کریں'}
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ur')}
                  className={`px-4 py-2 rounded-lg ${language === 'ur' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  اردو
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Age Group' : 'عمر کا گروپ'}
                </label>
                <select
                  value={surveyData.age}
                  onChange={(e) => setSurveyData(prev => ({...prev, age: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">
                    {language === 'en' ? 'Select age group' : 'عمر کا گروپ منتخب کریں'}
                  </option>
                  <option value="20-35">20-35</option>
                  <option value="35-50">35-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Gender' : 'جنس'}
                </label>
                <select
                  value={surveyData.gender}
                  onChange={(e) => setSurveyData(prev => ({...prev, gender: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">
                    {language === 'en' ? 'Select gender' : 'جنس منتخب کریں'}
                  </option>
                  <option value="male">{language === 'en' ? 'Male' : 'مرد'}</option>
                  <option value="female">{language === 'en' ? 'Female' : 'عورت'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Location' : 'مقام'}
                </label>
                <select
                  value={surveyData.location}
                  onChange={(e) => setSurveyData(prev => ({...prev, location: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">
                    {language === 'en' ? 'Select location' : 'مقام منتخب کریں'}
                  </option>
                  <option value="urban">{language === 'en' ? 'Urban' : 'شہری'}</option>
                  <option value="rural">{language === 'en' ? 'Rural' : 'دیہی'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Monthly Income (PKR)' : 'ماہانہ آمدنی (روپے)'}
                </label>
                <select
                  value={surveyData.income}
                  onChange={(e) => setSurveyData(prev => ({...prev, income: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">
                    {language === 'en' ? 'Select income range' : 'آمدنی کی رینج منتخب کریں'}
                  </option>
                  <option value="<20k">
                    {language === 'en' ? 'Less than 20,000' : '20,000 سے کم'}
                  </option>
                  <option value="20-50k">20,000 - 50,000</option>
                  <option value="50-100k">50,000 - 100,000</option>
                  <option value=">100k">
                    {language === 'en' ? 'More than 100,000' : '100,000 سے زیادہ'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' 
                    ? 'What are your thoughts on the recent medicine price increase in Pakistan?' 
                    : 'پاکستان میں دواؤں کی قیمتوں میں حالیہ اضافے کے بارے میں آپ کا کیا خیال ہے؟'
                  }
                </label>
                <textarea
                  value={surveyData.response}
                  onChange={(e) => setSurveyData(prev => ({...prev, response: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                  placeholder={language === 'en' ? 'Please share your thoughts...' : 'براہ کرم اپنے خیالات شیئر کریں...'}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting 
                  ? (language === 'en' ? 'Submitting...' : 'جمع کر رہے ہیں...')
                  : (language === 'en' ? 'Submit Survey' : 'سروے جمع کریں')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  const { locationGenderData, ageData, incomeData, pieData, overallSentiment } = generateChartData();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Survey Analysis Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('survey')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Survey
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold">{responses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Positive</p>
                <p className="text-2xl font-bold text-green-600">{overallSentiment.positive}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-red-600 transform rotate-180" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Negative</p>
                <p className="text-2xl font-bold text-red-600">{overallSentiment.negative}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Neutral</p>
                <p className="text-2xl font-bold text-gray-600">{overallSentiment.neutral}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Overall Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Location & Gender Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationGenderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill="#10B981" />
                <Bar dataKey="negative" fill="#EF4444" />
                <Bar dataKey="neutral" fill="#6B7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Age Group Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill="#10B981" />
                <Bar dataKey="negative" fill="#EF4444" />
                <Bar dataKey="neutral" fill="#6B7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Income Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill="#10B981" />
                <Bar dataKey="negative" fill="#EF4444" />
                <Bar dataKey="neutral" fill="#6B7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analysis Report</h3>
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
              {generateReport()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveySystem;
