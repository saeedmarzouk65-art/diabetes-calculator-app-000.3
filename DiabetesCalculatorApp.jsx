import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CHANGE 1: Import from Realtime Database instead of Firestore ---
import { initializeApp } from "firebase/app";
import {
  getDatabase, // Replaced getFirestore
  ref,         // Replaced collection
  push         // Replaced addDoc
} from "firebase/database"; // Changed from "firebase/firestore"
// --- END OF CHANGE ---

import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from "firebase/auth";

// --- START: Lucide Icons (UNCHANGED) ---
const Activity = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
);
const ArrowRight = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const RotateCcw = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L3 12" /></svg>
);
const Check = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>
);
const ArrowLeft = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
const HeartPulse = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25H21L16.5 16.5l-3.75-3.75Z" />
  </svg>
);
// --- END: Lucide Icons (UNCHANGED) ---

// --- START: shadcn/ui components (UNCHANGED) ---
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  return <button className={cn(baseStyles, className)} ref={ref} {...props} />;
});
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
// --- END: shadcn/ui components (UNCHANGED) ---


// --- START: GAUGE COMPONENT (UNCHANGED) ---
function ResultGauge({ score, quizType }) {
  const [rotation, setRotation] = useState(-90);
  const riskThreshold = quizType === 'cdc' ? 5 : 6;
  const maxScore = quizType === 'cdc' ? 11 : 10;
  useEffect(() => {
    const angle = (Math.min(score, maxScore) / maxScore) * 180 - 90;
    const timer = setTimeout(() => setRotation(angle), 300);
    return () => clearTimeout(timer);
  }, [score, maxScore]);
  return (
    <div className="flex justify-center mb-4">
      <div className="w-[200px] h-[100px] relative overflow-hidden">
        <div className="w-full h-full rounded-t-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80" />
        <div className="w-[160px] h-[80px] bg-white rounded-t-full absolute bottom-0 left-1/2 -translate-x-1/2" />
        <motion.div
          className="w-[3px] h-[90px] bg-gray-700 absolute bottom-[10px] left-1/2"
          style={{ originY: "100%", originX: "50%" }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}
// --- END: GAUGE COMPONENT (UNCHANGED) ---


// --- START: DATA CONSTANT (UNCHANGED) ---
const content = {
    ar: {
        headerTitle: "حاسبة السكري",
        langSwitch: "EN",
        backBtnText: "رجوع",
        toolSelectHeading: "اختر أداة التقييم",
        toolSelectDesc: "اختر أداة التقييم التي تفضل استخدامها لتقييم خطر الإصابة بالسكري.",
        cdcBtn: "أداة CDC (عالمي)",
        sadriscBtn: "أداة SADRISC (النموذج السعودي)",
        disclaimer: "إخلاء مسؤولية: هذه الأداة مخصصة للأغراض المعلوماتية فقط ولا تغني عن الاستشارة الطبية المتخصصة أو التشخيص أو العلاج.",
        heightLabel: "الطول (سم)",
        weightLabel: "الوزن (كجم)",
        waistLabel: "محيط الخصر (سم)",
        measurementSubmitBtn: "تأكيد",
        bmiError: "الوزن أو الطول المدخل غير صالح",
        waistError: "محيط الخصر المدخل غير صالح",
        ctaHeading: "الخطوة التالية؟",
        highRiskRecommendation: "نوصيك بزيارة أقرب مركز صحي أولي. سيقترح الطبيب فحص دم بسيط، مثل فحص السكر التراكمي (A1c) الذي يقيس متوسط السكر لآخر 3 أشهر، أو فحص سكر الدم الصيامي.",
        infoHeading: "نصائح للحفاظ على صحتك",
        healthAdvice: [
            { icon: '🥗', title: 'الأكل الصحي:', text: 'ركّز على الخضروات والحبوب الكاملة. استبدل الرز الأبيض بالأسمر أو البرغل، واختر الخبز الأسمر.' },
            { icon: '🚶‍♂️', title: 'النشاط البدني:', text: 'اجعل الحركة جزءاً من يومك، مثل المشي 30 دقيقة يومياً.' },
            { icon: '⚖️', title: 'الحفاظ على وزن صحي:', text: 'الأكل المتوازن مع الحركة هو أفضل طريقة للحفاظ على وزن صحي.' },
            { icon: '🩺', title: 'الفحص الدوري:', text: 'حتى مع الخطر المنخفض، من الجيد إجراء فحص دوري كل 1-3 سنوات للاطمئنان.' }
        ],
        restartBtn: "أعد الاختبار",
        ipNotice: "فكرة وتطوير: حملة توعوية لفرز السكري من طلاب طب سنة خامس بجامعة أم القرى (سعيد الزهراني، سلطان اللقماني، حسين الشريف، خالد الصاعدي، سعود اللهيبي، وعبدالمجيد السلمي).",
        cdc: {
            resultLowHeading: "خطر منخفض",
            resultLowDesc: "نتيجتك (أقل من 5 نقاط) تشير إلى مستوى خطر منخفض. استمر في الحفاظ على نمط حياتك الصحي.",
            resultHighHeading: "فرصة للاطمئنان على صحتك",
            resultHighDesc: "نتيجتك (5 نقاط أو أعلى) تشير لوجود بعض العوامل التي قد تزيد من احتمالية الإصابة. تحدث مع طبيبك.",
            sourceLink: `هذه الحاسبة مبنية على <a href="https://www.cdc.gov/prediabetes/risktest/index.html" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">أداة تقييم مخاطر السكري من CDC</a>.`,
            questions: [
                { text: "ما هي فئتك العمرية؟", type: 'options', options: [{ text: "أقل من 40 سنة", points: 0 }, { text: "40-49 سنة", points: 1 }, { text: "50-59 سنة", points: 2 }, { text: "60 سنة أو أكبر", points: 3 }] },
                { text: "ما هو جنسك؟", type: 'options', options: [{ text: "ذكر", points: 1, gender: 'male' }, { text: "أنثى", points: 0, gender: 'female' }] },
                { text: "إذا كنتِ امرأة، هل تم تشخيصك بسكري الحمل من قبل؟", for: 'female', type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                { text: "هل لديك تاريخ عائلي لمرض السكري (أم, أب, أخ, أخت)؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                { text: "هل تم تشخيصك بارتفاع ضغط الدم من قبل؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                { text: "هل أنت نشيط بدنياً؟", type: 'options', options: [{ text: "نعم", points: 0 }, { text: "لا", points: 1 }] },
                { text: "ما هو طولك ووزنك؟", type: 'bmi' },
            ]
        },
        sadrisc: {
            resultLowHeading: "خطر منخفض",
            resultLowDesc: "نتيجتك (أقل من 6 نقاط) تشير إلى مستوى خطر منخفض. استمر في الحفاظ على نمط حياتك الصحي.",
            resultHighHeading: "خطر مرتفع للإصابة بالسكري",
            resultHighDesc: "نتيجتك (6 نقاط أو أعلى) تشير إلى وجود خطر مرتفع للإصابة بالسكري خلال السنوات العشر القادمة. هذه فرصة جيدة للتحدث مع طبيبك.",
            sourceLink: `مبني على <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7378422/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">النموذج السعودي لمخاطر السكري (SADRISC)</a>.`,
            questions: [
                { text: "ما هي فئتك العمرية؟", type: 'options', options: [{ text: "أقل من 45 سنة", points: 0 }, { text: "45-54 سنة", points: 2 }, { text: "55 سنة أو أكبر", points: 3 }] },
                { text: "ما هو جنسك؟", type: 'options', options: [{ text: "ذكر", points: 1, gender: 'male' }, { text: "أنثى", points: 0, gender: 'female' }] },
                { text: "هل لديك تاريخ عائلي لمرض السكري (أحد الوالدين أو الأشقاء)؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                { text: "هل تم تشخيصك بارتفاع ضغط الدم أو تتناول أدوية له؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                { text: "هل تدخن السجائر حالياً؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                { text: "ما هو قياس محيط خصرك؟", type: 'waist' },
            ]
        }
    },
    en: {
        headerTitle: "Diabetes Calculator",
        langSwitch: "عربي",
        backBtnText: "Back",
        toolSelectHeading: "Choose Assessment Tool",
        toolSelectDesc: "Select the assessment tool you'd like to use to assess your diabetes risk.",
        cdcBtn: "CDC Tool (Global)",
        sadriscBtn: "SADRISC Tool (Saudi Model)",
        disclaimer: "Disclaimer: This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.",
        heightLabel: "Height (cm)",
        weightLabel: "Weight (kg)",
        waistLabel: "Waist Circumference (cm)",
        measurementSubmitBtn: "Confirm",
        bmiError: "Invalid weight or height provided",
        waistError: "Invalid waist circumference provided",
        ctaHeading: "What's the Next Step?",
        highRiskRecommendation: "We recommend visiting the nearest primary health facility. A doctor will suggest a simple blood test, like an A1c test or a fasting blood sugar test.",
        infoHeading: "Tips to Stay Healthy",
        healthAdvice: [
            { icon: '🥗', title: 'Healthy Eating:', text: 'Focus on vegetables and whole grains. Choose whole-wheat bread.' },
            { icon: '🚶‍♂️', title: 'Physical Activity:', text: 'Make movement a part of your day, like a 30-minute walk daily.' },
            { icon: '⚖️', title: 'Maintain a Healthy Weight:', text: 'A balanced diet and activity are the best way to maintain a healthy weight.' },
            { icon: '🩺', title: 'Regular Check-ups:', text: 'Even with low risk, getting a check-up every 1-3 years is a good practice.' }
        ],
        restartBtn: "Restart Test",
        ipNotice: "Concept & Development by: A diabetic screening campaign from 5th-year medical students at Umm Al Qura University (Saeed Al-Zahrani, Sultan Al-Luqmani, Hussain Al-Sharif, Khalid Al-Saadi, Saud Al-Luhaibi, and Abdulmajeed Al-Salami).",
        cdc: {
            resultLowHeading: "Low Risk",
            resultLowDesc: "Your score (less than 5) indicates a low risk. Keep up your healthy lifestyle.",
            resultHighHeading: "An Opportunity to Check on Your Health",
            resultHighDesc: "Your score (5 or higher) suggests some risk factors. This is a good opportunity to talk to your doctor.",
            sourceLink: `This calculator is based on the <a href="https://www.cdc.gov/prediabetes/risktest/index.html" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">CDC risk assessment tool</a>.`,
            questions: [
                { text: "What is your age group?", type: 'options', options: [{ text: "Younger than 40", points: 0 }, { text: "40-49", points: 1 }, { text: "50-59", points: 2 }, { text: "60 or older", points: 3 }] },
                { text: "What is your gender?", type: 'options', options: [{ text: "Male", points: 1, gender: 'male' }, { text: "Female", points: 0, gender: 'female' }] },
                { text: "If you are a woman, have you ever been diagnosed with gestational diabetes?", for: 'female', type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                { text: "Do you have a family history of diabetes (mother, father, sibling)?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                { text: "Have you ever been diagnosed with high blood pressure?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                { text: "Are you physically active?", type: 'options', options: [{ text: "Yes", points: 0 }, { text: "No", points: 1 }] },
                { text: "What is your height and weight?", type: 'bmi' },
            ]
        },
        sadrisc: {
            resultLowHeading: "Low Risk",
            resultLowDesc: "Your score (less than 6) indicates a low risk. Keep up your healthy lifestyle.",
            resultHighHeading: "High Risk for Diabetes",
            resultHighDesc: "Your score (6 or higher) indicates a high risk for developing diabetes in the next 10 years. This is a good opportunity to talk to your doctor.",
            sourceLink: `Based on the <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7378422/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Saudi Diabetes Risk Score (SADRISC)</a>.`,
            questions: [
                { text: "What is your age group?", type: 'options', options: [{ text: "Younger than 45", points: 0 }, { text: "45-54", points: 2 }, { text: "55 or older", points: 3 }] },
                { text: "What is your gender?", type: 'options', options: [{ text: "Male", points: 1, gender: 'male' }, { text: "Female", points: 0, gender: 'female' }] },
                { text: "Do you have a family history of diabetes (parent or sibling)?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                { text: "Have you been diagnosed with or take medication for high blood pressure?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                { text: "Do you currently smoke cigarettes?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                { text: "What is your waist circumference?", type: 'waist' },
            ]
        }
    }
};
// --- END: DATA CONSTANT (UNCHANGED) ---


// --- START: Main App Component ---
export default function App() {
  
  // --- State (UNCHANGED) ---
  const [language, setLanguage] = useState("ar");
  const [screen, setScreen] = useState("menu"); 
  const [quizType, setQuizType] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userGender, setUserGender] = useState(null);
  const [history, setHistory] = useState([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [measurementError, setMeasurementError] = useState(null);
  const [activeOption, setActiveOption] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [appId, setAppId] = useState('default-app-id');
  const [saving, setSaving] = useState(false);
  const isRTL = language === "ar";
  const t = content[language];

  // --- CHANGE 2: Firebase Initialization Effect ---
  useEffect(() => {
    let firebaseConfig;
    if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.log("Loading config from Vercel/production env variables...");
      firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        // --- Add the databaseURL from your Vercel keys ---
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
      };
    }
    else if (typeof __firebase_config !== 'undefined' && __firebase_config !== '{}') {
      console.log("Loading config from built-in environment...");
      const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
      firebaseConfig = JSON.parse(firebaseConfigStr);
    }
    else {
      console.error("Firebase config is missing!");
      return;
    }

    const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    setAppId(currentAppId);

    try {
      if (!firebaseConfig || !firebaseConfig.apiKey) {
        console.error("Firebase config is missing or invalid.");
        return;
      }
      const app = initializeApp(firebaseConfig);
      
      // --- Use getDatabase (for Realtime DB) instead of getFirestore ---
      const rtdb = getDatabase(app); 
      const firebaseAuth = getAuth(app);
      
      // --- Removed setLogLevel('Debug') as it was for Firestore ---
      
      setDb(rtdb); // --- Save the Realtime DB instance ---
      setAuth(firebaseAuth);

      onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          console.log("User authenticated with UID:", user.uid);
        } else {
          console.log("No user found, attempting sign in...");
          try {
            if (token) {
              await signInWithCustomToken(firebaseAuth, token);
              console.log("Signed in with custom token.");
            } else {
              await signInAnonymously(firebaseAuth);
              console.log("Signed in anonymously.");
            }
          } catch (authError) {
            console.error("Error during sign-in:", authError);
          }
        }
      });
    } catch (e) {
      console.error("Error parsing Firebase config:", e);
    }
  }, []);
  // --- END OF CHANGE ---
  
  // --- Effect to update document language (UNCHANGED) ---
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.title = t.headerTitle;
  }, [language, t]);

  // --- Helper Functions (UNCHANGED) ---
  const getFilteredQuestions = () => {
    if (!quizType) return [];
    const questions = t[quizType].questions;
    if (userGender === 'male') {
      return questions.filter(q => q.for !== 'female');
    }
    return questions;
  };
  const startQuiz = (tool) => {
    setQuizType(tool);
    setScreen("quiz");
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserGender(null);
    setHistory([]);
    setHeight("");
    setWeight("");
    setWaist("");
    setMeasurementError(null);
    setActiveOption(null);
  };
  const resetApp = () => {
    setScreen("menu");
    setQuizType(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserGender(null);
    setHistory([]);
    setHeight("");
    setWeight("");
    setWaist("");
    setMeasurementError(null);
    setActiveOption(null);
  };
  const handleBack = () => {
    if (history.length === 0) {
      resetApp();
      return;
    }
    const prevState = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentQuestionIndex(prevState.questionIndex);
    setScore(prevState.score);
    setUserGender(prevState.userGender);
    setHeight("");
    setWeight("");
    setWaist("");
    setMeasurementError(null);
    setActiveOption(null);
  };

  // --- CHANGE 3: `saveResult` function updated for Realtime Database ---
  const saveResult = async (finalScore) => {
    setSaving(true);
    
    if (!db || !userId) {
      // --- Updated error message for clarity ---
      console.error("Realtime DB or User ID not initialized. Cannot save.");
      setSaving(false);
      return;
    }
    
    const riskThreshold = quizType === 'cdc' ? 5 : 6;
    const riskLevel = finalScore >= riskThreshold ? "High" : "Low";
    const riskLevelText = finalScore >= riskThreshold 
      ? (language === 'ar' ? 'خطر مرتفع' : 'High Risk')
      : (language === 'ar' ? 'خطر منخفض' : 'Low Risk');

    const testResultData = {
      quiz_type: quizType,
      score: finalScore,
      risk_level: riskLevelText,
      language: language,
      timestamp: new Date().toISOString(), // RTDB prefers ISO strings
      user_id: userId,
      app_id: appId
    };

    try {
      // --- This is the new Realtime Database save logic ---
      // 1. Define the path (same as before, but as a string path)
      const dbPath = `/artifacts/${appId}/users/${userId}/TestResults`;
      
      // 2. Get a reference to that path in the database
      const dbRef = ref(db, dbPath);
      
      // 3. 'push' creates a new entry with a unique ID, just like 'addDoc'
      const newResultRef = await push(dbRef, testResultData);
      
      console.log("Result saved to Realtime Database with key: ", newResultRef.key);
    } catch (error) {
      console.error("Error saving result to Realtime Database:", error);
    }
    
    setSaving(false);
  };
  // --- END OF CHANGE ---

  // --- Quiz logic functions (UNCHANGED) ---
  const goToNextQuestion = (newScore, newGender) => {
    setHistory(h => [...h, {
      questionIndex: currentQuestionIndex,
      score: score,
      userGender: userGender
    }]);
    const questions = getFilteredQuestions();
    if (currentQuestionIndex + 1 >= questions.length) {
      setScreen("result");
      saveResult(newScore); 
    } else {
      setCurrentQuestionIndex(i => i + 1);
      setHeight("");
      setWeight("");
      setWaist("");
      setMeasurementError(null);
      setActiveOption(null);
    }
  };
  const handleOptionClick = (option) => {
    setActiveOption(option.text);
    const newScore = score + option.points;
    const newGender = option.gender || userGender;
    setScore(newScore);
    if (option.gender) {
      setUserGender(option.gender);
    }
    setTimeout(() => {
      goToNextQuestion(newScore, newGender);
    }, 300);
  };
  const handleMeasurementSubmit = () => {
    const question = getFilteredQuestions()[currentQuestionIndex];
    let pointsAdded = 0;
    if (question.type === 'bmi') {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      if (isNaN(h) || isNaN(w) || h <= 50 || w <= 20) {
        setMeasurementError(t.bmiError);
        return;
      }
      const bmi = w / ((h / 100) ** 2);
      if (bmi >= 30) pointsAdded = 3;
      else if (bmi >= 25) pointsAdded = 1;
    } else if (question.type === 'waist') {
      const wc = parseFloat(waist);
      if (isNaN(wc) || wc < 50 || wc > 250) {
        setMeasurementError(t.waistError);
        return;
      }
      if (userGender === 'male' && wc >= 102) pointsAdded = 2;
      else if (userGender === 'female' && wc >= 88) pointsAdded = 2;
    }
    setMeasurementError(null);
    const newScore = score + pointsAdded;
    setScore(newScore);
    goToNextQuestion(newScore, userGender);
  };
  const toggleLanguage = () => {
    setLanguage(l => l === 'ar' ? 'en' : 'ar');
    resetApp();
  };
  
  // --- Helper variables (UNCHANGED) ---
  const questions = getFilteredQuestions();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (questions.length > 0) ? (currentQuestionIndex / questions.length) * 100 : 0;
  const riskThreshold = quizType === 'cdc' ? 5 : 6;
  const isHighRisk = score >= riskThreshold;

  // --- JSX / HTML Rendering (UNCHANGED) ---
  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', fontFamily: "'Tajawal', sans-serif" }}>
      <div id="app-container" className="w-full max-w-md mx-auto bg-white shadow-xl shadow-cyan-100/50 rounded-3xl p-6 md:p-8 space-y-6 transition-all duration-500 border border-gray-100" dir={isRTL ? "rtl" : "ltr"}>
        
        <header className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="w-1/4 text-left">
            <AnimatePresence>
              {screen !== "menu" && (
                <motion.button
                  id="back-btn"
                  onClick={handleBack}
                  className="relative px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200 transition-colors duration-200 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  </span>
                  <span className="group-hover:opacity-0 transition-opacity duration-200" id="back-btn-text">
                    {t.backBtnText}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="w-1/2 text-center">
            <h1 id="header-title" className="text-3xl font-extrabold text-cyan-700" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {t.headerTitle}
            </h1>
          </div>
          <div className="w-1/4 text-right">
            <AnimatePresence>
              {screen === "menu" && (
                <motion.button
                  id="lang-switcher"
                  onClick={toggleLanguage}
                  className="px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  {t.langSwitch}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </header>

        <AnimatePresence mode="wait">
          
          {screen === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6 pt-4"
            >
              <div className="text-cyan-500 w-20 h-20 mx-auto animate-pulse">
                <HeartPulse />
              </div>
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {t.toolSelectHeading}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t.toolSelectDesc}
              </p>
              <div className="space-y-4">
                <Button
                  data-tool="cdc"
                  onClick={() => startQuiz('cdc')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {t.cdcBtn}
                </Button>
                <Button
                  data-tool="sadrisc"
                  onClick={() => startQuiz('sadrisc')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  {t.sadriscBtn}
                </Button>
              </div>
              <p className="text-sm font-bold text-red-600 pt-4">
                {t.disclaimer}
              </p>
            </motion.div>
          )}

          {screen === "quiz" && currentQuestion && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 30 : -30 }}
              className="space-y-6 pt-4"
            >
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              
              <div className="space-y-5">
                <p className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                  {currentQuestion.text}
                </p>
                
                {currentQuestion.type === 'options' && (
                  <motion.div 
                    className="flex flex-col gap-3 pt-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.05 } }
                    }}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className={cn(
                          "w-full text-start font-semibold p-4 bg-white border border-gray-200 text-gray-700 rounded-lg transition-all duration-200 ease-in-out hover:bg-cyan-50 hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-px",
                          activeOption === option.text && "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-700 ring-2 ring-cyan-500 text-white shadow-lg"
                        )}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        {option.text}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
                
                {(currentQuestion.type === 'bmi' || currentQuestion.type === 'waist') && (
                  <div className="flex flex-col items-center space-y-4 pt-4">
                    {currentQuestion.type === 'bmi' && (
                      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <div className="flex flex-col items-center">
                          <label htmlFor="height-input" className="text-sm text-gray-600 mb-1">{t.heightLabel}</label>
                          <input type="number" id="height-input" value={height} onChange={e => setHeight(e.target.value)} className="w-32 text-center border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-2" placeholder="175" />
                        </div>
                        <div className="flex flex-col items-center">
                          <label htmlFor="weight-input" className="text-sm text-gray-600 mb-1">{t.weightLabel}</label>
                          <input type="number" id="weight-input" value={weight} onChange={e => setWeight(e.target.value)} className="w-32 text-center border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-2" placeholder="80" />
                        </div>
                      </div>
                    )}
                    
                    {currentQuestion.type === 'waist' && (
                      <div className="flex flex-col items-center w-full">
                        <label htmlFor="waist-input" className="text-sm text-gray-600 mb-1">{t.waistLabel}</label>
                        <input type="number" id="waist-input" value={waist} onChange={e => setWaist(e.target.value)} className="w-36 text-center border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-2" placeholder="95" />
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {measurementError && (
                        <motion.p
                          className="text-red-600 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {measurementError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    
                    <Button
                      onClick={handleMeasurementSubmit}
                      className="mt-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      {t.measurementSubmitBtn}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {screen === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6 pt-4"
            >
              <ResultGauge score={score} quizType={quizType} />
              
              <h2 className={cn(
                "text-3xl font-extrabold",
                isHighRisk ? "text-red-600" : "text-green-600"
              )} style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isHighRisk ? t[quizType].resultHighHeading : t[quizType].resultLowHeading}
              </h2>
              
              <p className="text-gray-700 leading-relaxed">
                {isHighRisk ? t[quizType].resultHighDesc : t[quizType].resultLowDesc}
              </p>

              {isHighRisk && (
                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <p className="font-bold text-xl text-blue-900">{t.ctaHeading}</p>
                  <div className="p-4 text-center bg-white border border-red-200 rounded-xl shadow-sm">
                    <p className="text-red-700 font-semibold leading-relaxed">
                      {t.highRiskRecommendation}
                    </p>
                  </div>
                </div>
              )}
              
              {!isHighRisk && (
                <div className="space-y-4 border-t border-gray-100 pt-6 text-left">
                  <p className="font-bold text-xl text-green-800 text-center">{t.infoHeading}</p>
                  <ul className="space-y-4 text-base text-gray-700 list-none px-2">
                    {t.healthAdvice.map((advice, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-3 bg-white border border-green-200 p-3 rounded-lg shadow-sm"
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <span className="text-xl text-green-600">{advice.icon}</span>
                        <div>
                          <p className="font-semibold text-green-800">{advice.title}</p>
                          <p className="text-gray-700">{advice.text}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button
                onClick={resetApp}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 mt-6"
              >
                {t.restartBtn}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
        
        <footer className="text-center text-xs text-gray-500 pt-6 border-t border-gray-100 mt-6">
          <AnimatePresence>
            {screen === "menu" && (
              <motion.p 
                className="mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                dangerouslySetInnerHTML={{ __html: t.ipNotice }} 
              />
            )}
            {screen !== "menu" && quizType && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                dangerouslySetInnerHTML={{ __html: t[quizType]?.sourceLink || "" }}
              />
            )}
          </AnimatePresence>
        </footer>

      </div>
    </div>
  );
}
